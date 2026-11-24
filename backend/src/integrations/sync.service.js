const prisma = require("../db/prisma");
const TokenService = require("./token.service");
const youtubeProvider = require("./providers/youtube.provider");
const instagramProvider = require("./providers/instagram.provider");
const twitchProvider = require("./providers/twitch.provider");
const MockProvider = require("./providers/mock.provider");

class SyncService {
  static getProvider(platform) {
    const p = String(platform).toUpperCase();
    if (process.env.USE_MOCK_INTEGRATIONS === "true") {
      return new MockProvider(p);
    }

    switch (p) {
      case "YOUTUBE":
        return youtubeProvider;
      case "INSTAGRAM":
        return instagramProvider;
      case "TWITCH":
        return twitchProvider;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Synchronize a specific social account
   */
  static async syncAccount(socialAccountId) {
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
      include: { creatorProfile: true }
    });

    if (!account) {
      throw new Error("Social account not found");
    }

    const provider = this.getProvider(account.platform);

    try {
      // 1. Mark status as SYNC_PENDING
      await prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: { status: "SYNC_PENDING" }
      });

      // 2. Obtain decrypted, valid token
      const accessToken = await TokenService.getValidToken(socialAccountId, provider);

      // 3. Fetch latest platform profile
      const profile = await provider.getProfile(accessToken);

      // Update social account record
      await prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: {
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          profileUrl: profile.profileUrl,
          status: "CONNECTED",
          syncError: null,
          lastSyncedAt: new Date()
        }
      });

      // 4. Ingest recent content
      const contents = await provider.getContent(accessToken, account.platformAccountId, {
        uploadsPlaylistId: profile.uploadsPlaylistId,
        maxResults: 20
      });

      for (const item of contents) {
        await prisma.creatorContent.upsert({
          where: {
            creatorProfileId_platform_externalContentId: {
              creatorProfileId: account.creatorProfileId,
              platform: account.platform,
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
            commentCount: item.commentCount,
            metricsJson: item.metricsJson
          },
          create: {
            creatorProfileId: account.creatorProfileId,
            platform: account.platform,
            externalContentId: item.externalContentId,
            title: item.title,
            description: item.description,
            thumbnailUrl: item.thumbnailUrl,
            contentUrl: item.contentUrl,
            publishedAt: item.publishedAt,
            viewCount: item.viewCount,
            likeCount: item.likeCount,
            commentCount: item.commentCount,
            metricsJson: item.metricsJson
          }
        });
      }

      // 5. Ingest metrics snapshot
      const metrics = await provider.getMetrics(accessToken, account.platformAccountId);
      const snapshot = await prisma.creatorMetricSnapshot.create({
        data: {
          creatorProfileId: account.creatorProfileId,
          platform: account.platform,
          followerCount: metrics.followerCount,
          totalViews: metrics.totalViews,
          engagementRate: metrics.engagementRate,
          snapshotDate: new Date()
        }
      });

      // Update CreatorProfile general fields if empty
      await prisma.creatorProfile.update({
        where: { id: account.creatorProfileId },
        data: {
          followers: String(metrics.followerCount),
          avgViews: String(metrics.recentAvgViews || 0)
        }
      });

      return {
        success: true,
        account: {
          id: account.id,
          platform: account.platform,
          status: "CONNECTED",
          lastSyncedAt: new Date()
        },
        itemsSynced: contents.length,
        snapshotId: snapshot.id
      };
    } catch (syncError) {
      console.error(`Sync error on account ${socialAccountId}:`, syncError.message);

      await prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: {
          status: "SYNC_FAILED",
          syncError: syncError.message
        }
      });

      // Create notification for creator
      if (account.creatorProfile?.userId) {
        await prisma.notification.create({
          data: {
            userId: account.creatorProfile.userId,
            title: `Sync Failed: ${account.platform}`,
            message: `Synchronization failed: ${syncError.message}. Please check integration settings.`,
            type: "SYNC_FAILURE"
          }
        });
      }

      throw syncError;
    }
  }

  /**
   * Synchronize all connected accounts for a creator
   */
  static async syncAllForCreator(creatorProfileId) {
    const accounts = await prisma.socialAccount.findMany({
      where: {
        creatorProfileId,
        status: { in: ["CONNECTED", "SYNC_PENDING", "SYNC_FAILED"] }
      }
    });

    const results = [];
    for (const acc of accounts) {
      try {
        const res = await this.syncAccount(acc.id);
        results.push(res);
      } catch (err) {
        results.push({
          success: false,
          accountId: acc.id,
          platform: acc.platform,
          error: err.message
        });
      }
    }

    return results;
  }
}

module.exports = SyncService;
