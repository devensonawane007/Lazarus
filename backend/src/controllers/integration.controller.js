const crypto = require("crypto");
const prisma = require("../db/prisma");
const SyncService = require("../integrations/sync.service");
const TokenService = require("../integrations/token.service");
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
 * Get OAuth Authorization URL with CSRF state
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

    // Generate secure state: userId:platform:randomBytes
    const randomSalt = crypto.randomBytes(16).toString("hex");
    const state = Buffer.from(
      JSON.stringify({ userId: req.user.id, platform: upperPlatform, salt: randomSalt })
    ).toString("base64url");

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
 */
const handleCallback = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { code, state } = req.body;
    const upperPlatform = platform.toUpperCase();

    if (!code) {
      return res.status(400).json({ success: false, message: "Authorization code is required" });
    }

    // Validate CSRF state if provided
    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
        if (decodedState.userId !== req.user.id) {
          return res.status(403).json({ success: false, message: "Invalid OAuth state token" });
        }
      } catch {
        return res.status(400).json({ success: false, message: "Malformed OAuth state token" });
      }
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!creator) {
      return res.status(404).json({ success: false, message: "Creator profile not found" });
    }

    const provider = SyncService.getProvider(upperPlatform);

    // 1. Exchange code
    const tokenResult = await provider.exchangeCode(code);

    // 2. Fetch profile to identify account
    const profile = await provider.getProfile(tokenResult.accessToken);

    // 3. Upsert SocialAccount
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

    // 4. Save encrypted credentials
    await TokenService.saveCredentials(socialAccount.id, {
      accessToken: tokenResult.accessToken,
      refreshToken: tokenResult.refreshToken,
      expiresIn: tokenResult.expiresIn
    });

    // 5. Trigger initial synchronous sync
    await SyncService.syncAccount(socialAccount.id);

    res.json({
      success: true,
      message: `${upperPlatform} account connected and synchronized successfully! 🚀`,
      account: socialAccount
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

    // Ownership check
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
 * Disconnect a social account
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

    // Ownership check
    if (account.creatorProfile.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden: Not your social account" });
    }

    // Revoke at provider if token exists
    try {
      const provider = SyncService.getProvider(account.platform);
      const token = await TokenService.getValidToken(accountId, provider);
      await provider.revokeAccess(token);
    } catch {
      // Proceed even if revocation fails
    }

    // Delete credentials
    await TokenService.deleteCredentials(accountId);

    // Delete social account record (Cascades contents if desired or leaves archived)
    await prisma.socialAccount.delete({
      where: { id: accountId }
    });

    res.json({
      success: true,
      message: `${account.platform} account disconnected and credentials purged.`
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

    res.json({
      success: true,
      message: `Verified demo ${upperPlatform} channel connected! 🚀`,
      account: socialAccount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIntegrationStatuses,
  getAuthUrl,
  handleCallback,
  triggerSync,
  disconnectAccount,
  connectMockAccount
};
