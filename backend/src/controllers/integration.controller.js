const prisma = require("../db/prisma");
const SyncService = require("../integrations/sync.service");
const TokenService = require("../integrations/token.service");
const OAuthState = require("../integrations/oauth.state");
const MockProvider = require("../integrations/providers/mock.provider");

/**
 * Get connected integration statuses for the logged in creator
 */
const getIntegrationStatuses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        socialAccounts: {
          select: {
            id: true,
            platform: true,
            platformAccountId: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            profileUrl: true,
            status: true,
            scopes: true,
            lastSyncedAt: true,
            syncError: true,
            createdAt: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Creator profile not found" });
    }

    // Platforms configured status
    const platformsInfo = {
      YOUTUBE: {
        configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        name: "YouTube",
        description: "Google OAuth 2.0 & YouTube Data API v3"
      },
      INSTAGRAM: {
        configured: Boolean(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET),
        name: "Instagram",
        description: "Meta Graph API (Creator & Business Accounts)"
      },
      TWITCH: {
        configured: Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET),
        name: "Twitch",
        description: "Twitch OAuth & Helix API"
      }
    };

    res.json({
      success: true,
      accounts: profile.socialAccounts,
      platformsInfo
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get OAuth Authorization URL with signed, single-use, time-limited state
 */
const getAuthUrl = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const upperPlatform = platform.toUpperCase();

    // Verify creator profile exists
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!creator) {
      return res.status(404).json({ success: false, message: "Creator profile not found" });
    }

    // Generate signed, time-limited, single-use OAuth state token bound to user & platform
    const state = OAuthState.generateState(req.user.id, upperPlatform);

    const provider = SyncService.getProvider(upperPlatform);
    const authData = provider.getAuthUrl(state);

    res.json({
      success: true,
      ...authData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete OAuth callback, exchange token, and store encrypted credential
 * Strictly validates single-use state and prevents account identity hijacking
 */
const handleCallback = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { code, state } = req.body;
    const upperPlatform = platform.toUpperCase();

    if (!code) {
      return res.status(400).json({ success: false, message: "Authorization code is required" });
    }

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "OAuth state token is required for secure CSRF verification"
      });
    }

    // 1. Strict state validation (HMAC signature, 10m TTL, user-binding, single-use consumption)
    try {
      OAuthState.validateState(state, req.user.id, upperPlatform);
    } catch (stateErr) {
      return res.status(403).json({
        success: false,
        message: `OAuth security validation failed: ${stateErr.message}`
      });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!creator) {
      return res.status(404).json({ success: false, message: "Creator profile not found" });
    }

    const provider = SyncService.getProvider(upperPlatform);

    // 2. Exchange authorization code for token bundle
    const tokenResult = await provider.exchangeCode(code);

    // 3. Fetch external profile to identify the account
    const profile = await provider.getProfile(tokenResult.accessToken);

    // 4. Anti-Account-Hijacking: Ensure account is not already connected to a DIFFERENT creator
    const existingOtherOwner = await prisma.socialAccount.findFirst({
      where: {
        platform: upperPlatform,
        platformAccountId: profile.platformAccountId,
        creatorProfileId: { not: creator.id },
        status: { in: ["CONNECTED", "SYNC_PENDING", "SYNC_FAILED", "EXPIRED"] }
      },
      include: {
        creatorProfile: {
          include: { user: { select: { id: true, name: true } } }
        }
      }
    });

    if (existingOtherOwner) {
      return res.status(409).json({
        success: false,
        message: `Account Conflict: This ${upperPlatform} channel (${profile.displayName || profile.username}) is already linked to another creator profile (${existingOtherOwner.creatorProfile.user.name}). An account cannot be linked to multiple creators.`
      });
    }

    // 5. Upsert SocialAccount for the current creator (Handles new connection or clean reconnection)
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        creatorProfileId_platform_platformAccountId: {
          creatorProfileId: creator.id,
          platform: upperPlatform,
          platformAccountId: profile.platformAccountId
        }
      },
      update: {
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
        status: "CONNECTED",
        scopes: tokenResult.scopes || [],
        syncError: null
      },
      create: {
        creatorProfileId: creator.id,
        platform: upperPlatform,
        platformAccountId: profile.platformAccountId,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
        status: "CONNECTED",
        scopes: tokenResult.scopes || []
      }
    });

    // 6. Save encrypted credentials bundle with AAD binding
    await TokenService.saveCredentials(socialAccount.id, {
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
      expiresIn: tokenResult.expiresIn
    });

    // 7. Audit log the connection event
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: "SOCIAL_ACCOUNT_CONNECTED",
        resourceType: "SOCIAL_ACCOUNT",
        resourceId: socialAccount.id,
        detailsJson: {
          platform: upperPlatform,
          platformAccountId: profile.platformAccountId,
          username: profile.username
        }
      }
    });

    // 8. Trigger initial synchronous sync
    await SyncService.syncAccount(socialAccount.id);

    // Re-fetch sanitized social account for response
    const sanitizedAccount = await prisma.socialAccount.findUnique({
      where: { id: socialAccount.id },
      select: {
        id: true,
        platform: true,
        platformAccountId: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        profileUrl: true,
        status: true,
        scopes: true,
        lastSyncedAt: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: `${upperPlatform} account connected and synchronized successfully! 🚀`,
      account: sanitizedAccount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger manual account synchronization
 */
const triggerSync = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId },
      include: { creatorProfile: true }
    });

    if (!account) {
      return res.status(404).json({ success: false, message: "Social account not found" });
    }

    // Ownership check (IDOR Protection)
    if (account.creatorProfile.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden: Not your social account" });
    }

    const result = await SyncService.syncAccount(accountId);

    res.json({
      success: true,
      message: `${account.platform} account synchronized successfully`,
      result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnect a social account with credential purging and audit logging
 */
const disconnectAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId },
      include: { creatorProfile: true }
    });

    if (!account) {
      return res.status(404).json({ success: false, message: "Social account not found" });
    }

    // Ownership check (IDOR Protection)
    if (account.creatorProfile.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden: Not your social account" });
    }

    // 1. Revoke at provider if token is available
    try {
      const provider = SyncService.getProvider(account.platform);
      const token = await TokenService.getValidToken(accountId, provider);
      await provider.revokeAccess(token);
    } catch {
      // Proceed even if external provider revocation fails (e.g. already revoked)
    }

    // 2. Audit log the disconnection before purging
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        action: "SOCIAL_ACCOUNT_DISCONNECTED",
        resourceType: "SOCIAL_ACCOUNT",
        resourceId: accountId,
        detailsJson: {
          platform: account.platform,
          platformAccountId: account.platformAccountId,
          username: account.username
        }
      }
    });

    // 3. Purge encrypted credentials
    await TokenService.deleteCredentials(accountId);

    // 4. Delete social account record (and its cascaded credentials)
    await prisma.socialAccount.delete({
      where: { id: accountId }
    });

    res.json({
      success: true,
      message: `${account.platform} account disconnected and credentials permanently purged.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Connect Mock Provider for Local Development / Testing
 */
const connectMockAccount = async (req, res, next) => {
  try {
    const { platform } = req.body;
    const upperPlatform = (platform || "YOUTUBE").toUpperCase();

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!creator) {
      return res.status(404).json({ success: false, message: "Creator profile not found" });
    }

    const mockProvider = new MockProvider(upperPlatform);
    const mockToken = await mockProvider.exchangeCode("VALID_MOCK_CODE");
    const mockProfile = await mockProvider.getProfile(mockToken.accessToken);

    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        creatorProfileId_platform_platformAccountId: {
          creatorProfileId: creator.id,
          platform: upperPlatform,
          platformAccountId: mockProfile.platformAccountId
        }
      },
      update: {
        username: mockProfile.username,
        displayName: mockProfile.displayName,
        avatarUrl: mockProfile.avatarUrl,
        profileUrl: mockProfile.profileUrl,
        status: "CONNECTED",
        scopes: mockToken.scopes,
        syncError: null
      },
      create: {
        creatorProfileId: creator.id,
        platform: upperPlatform,
        platformAccountId: mockProfile.platformAccountId,
        username: mockProfile.username,
        displayName: mockProfile.displayName,
        avatarUrl: mockProfile.avatarUrl,
        profileUrl: mockProfile.profileUrl,
        status: "CONNECTED",
        scopes: mockToken.scopes
      }
    });

    await TokenService.saveCredentials(socialAccount.id, {
      accessToken: mockToken.accessToken,
      refreshToken: mockToken.refreshToken,
      expiresIn: mockToken.expiresIn
    });

    // Ingest content & snapshot using mock provider
    const contents = await mockProvider.getContent(mockToken.accessToken, mockProfile.platformAccountId);
    for (const item of contents) {
      await prisma.creatorContent.upsert({
        where: {
          creatorProfileId_platform_externalContentId: {
            creatorProfileId: creator.id,
            platform: upperPlatform,
            externalContentId: item.externalContentId
          }
        },
        update: {
          title: item.title,
          description: item.description,
          thumbnailUrl: item.thumbnailUrl,
          contentUrl: item.contentUrl,
          viewCount: item.viewCount,
          likeCount: item.likeCount,
          commentCount: item.commentCount
        },
        create: {
          creatorProfileId: creator.id,
          platform: upperPlatform,
          externalContentId: item.externalContentId,
          title: item.title,
          description: item.description,
          thumbnailUrl: item.thumbnailUrl,
          contentUrl: item.contentUrl,
          publishedAt: item.publishedAt,
          viewCount: item.viewCount,
          likeCount: item.likeCount,
          commentCount: item.commentCount
        }
      });
    }

    const metrics = await mockProvider.getMetrics(mockToken.accessToken, mockProfile.platformAccountId);
    await prisma.creatorMetricSnapshot.create({
      data: {
        creatorProfileId: creator.id,
        platform: upperPlatform,
        followerCount: metrics.followerCount,
        totalViews: metrics.totalViews,
        engagementRate: metrics.engagementRate,
        snapshotDate: new Date()
      }
    });

    await prisma.socialAccount.update({
      where: { id: socialAccount.id },
      data: { lastSyncedAt: new Date() }
    });

    const sanitizedAccount = await prisma.socialAccount.findUnique({
      where: { id: socialAccount.id },
      select: {
        id: true,
        platform: true,
        platformAccountId: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        profileUrl: true,
        status: true,
        scopes: true,
        lastSyncedAt: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: `Verified demo ${upperPlatform} channel connected! 🚀`,
      account: sanitizedAccount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle browser GET redirect from OAuth provider
 * Validates signed state, exchanges code, securely stores tokens, syncs channel, and redirects to frontend
 */
const handleGetCallback = async (req, res, next) => {
  const { platform } = req.params;
  const { code, state, error, error_description } = req.query;
  const upperPlatform = (platform || "").toUpperCase();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (error) {
    return res.redirect(
      `${frontendUrl}/creator?oauth=error&message=${encodeURIComponent(error_description || error)}`
    );
  }

  if (!code || !state) {
    return res.redirect(
      `${frontendUrl}/creator?oauth=error&message=${encodeURIComponent("Missing authorization code or state token")}`
    );
  }

  try {
    // 1. Validate signed, single-use, time-limited state (extracts bound userId)
    const stateResult = OAuthState.validateState(state, null, upperPlatform);
    const userId = stateResult.payload.userId;

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!creator) {
      return res.redirect(
        `${frontendUrl}/creator?oauth=error&message=${encodeURIComponent("Creator profile not found")}`
      );
    }

    const provider = SyncService.getProvider(upperPlatform);

    // 2. Exchange code for access & refresh tokens
    const tokenResult = await provider.exchangeCode(code);

    // 3. Fetch external profile
    const profile = await provider.getProfile(tokenResult.accessToken);

    // 4. Anti-Account-Hijacking: Ensure account is not already connected to a DIFFERENT creator
    const existingOtherOwner = await prisma.socialAccount.findFirst({
      where: {
        platform: upperPlatform,
        platformAccountId: profile.platformAccountId,
        creatorProfileId: { not: creator.id },
        status: { in: ["CONNECTED", "SYNC_PENDING", "SYNC_FAILED", "EXPIRED"] }
      },
      include: {
        creatorProfile: {
          include: { user: { select: { id: true, name: true } } }
        }
      }
    });

    if (existingOtherOwner) {
      return res.redirect(
        `${frontendUrl}/creator?oauth=error&message=${encodeURIComponent(
          `This ${upperPlatform} channel is already linked to another creator profile (${existingOtherOwner.creatorProfile.user.name}).`
        )}`
      );
    }

    // 5. Upsert SocialAccount for the current creator
    const socialAccount = await prisma.socialAccount.upsert({
      where: {
        creatorProfileId_platform_platformAccountId: {
          creatorProfileId: creator.id,
          platform: upperPlatform,
          platformAccountId: profile.platformAccountId
        }
      },
      update: {
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
        status: "CONNECTED",
        scopes: tokenResult.scopes || [],
        syncError: null
      },
      create: {
        creatorProfileId: creator.id,
        platform: upperPlatform,
        platformAccountId: profile.platformAccountId,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
        status: "CONNECTED",
        scopes: tokenResult.scopes || []
      }
    });

    // 6. Save encrypted credentials bundle with AAD binding
    await TokenService.saveCredentials(socialAccount.id, {
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
      expiresIn: tokenResult.expiresIn
    });

    // 7. Audit log connection event
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "SOCIAL_ACCOUNT_CONNECTED_OAUTH",
        resourceType: "SOCIAL_ACCOUNT",
        resourceId: socialAccount.id,
        detailsJson: {
          platform: upperPlatform,
          platformAccountId: profile.platformAccountId,
          username: profile.username
        }
      }
    });

    // 8. Trigger initial sync
    await SyncService.syncAccount(socialAccount.id);

    return res.redirect(
      `${frontendUrl}/creator?oauth=success&platform=${encodeURIComponent(upperPlatform)}`
    );
  } catch (err) {
    return res.redirect(
      `${frontendUrl}/creator?oauth=error&message=${encodeURIComponent(err.message)}`
    );
  }
};

module.exports = {
  getIntegrationStatuses,
  getAuthUrl,
  handleCallback,
  handleGetCallback,
  triggerSync,
  disconnectAccount,
  connectMockAccount
};
