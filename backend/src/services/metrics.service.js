const prisma = require("../db/prisma");

class MetricsService {
  /**
   * Aggregate verified cross-platform metrics for a creator
   */
  static async getUnifiedMetrics(creatorProfileId) {
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorProfileId },
      include: {
        socialAccounts: {
          where: { status: "CONNECTED" }
        },
        metricSnapshots: {
          orderBy: { snapshotDate: "desc" },
          take: 30
        },
        contents: {
          orderBy: { publishedAt: "desc" },
          take: 50
        }
      }
    });

    if (!creator) {
      throw new Error("Creator profile not found");
    }

    const platformBreakdown = {};
    let totalAudience = 0;
    let totalLifetimeViews = BigInt(0);

    // Latest snapshot per platform
    for (const acc of creator.socialAccounts) {
      const latestSnapshot = creator.metricSnapshots.find(
        (s) => s.platform === acc.platform
      );

      const followers = latestSnapshot?.followerCount || 0;
      const views = latestSnapshot?.totalViews || BigInt(0);
      const engagementRate = latestSnapshot?.engagementRate || 0.0;

      totalAudience += followers;
      totalLifetimeViews += views;

      platformBreakdown[acc.platform] = {
        platform: acc.platform,
        username: acc.username,
        displayName: acc.displayName,
        avatarUrl: acc.avatarUrl,
        profileUrl: acc.profileUrl,
        followerCount: followers,
        totalViews: views.toString(),
        engagementRate,
        lastSyncedAt: acc.lastSyncedAt
      };
    }

    // Recent content performance analytics
    let recentViews = 0;
    let recentLikes = 0;
    let recentComments = 0;

    creator.contents.forEach((c) => {
      recentViews += c.viewCount;
      recentLikes += c.likeCount;
      recentComments += c.commentCount;
    });

    const recentAvgViews =
      creator.contents.length > 0
        ? Math.round(recentViews / creator.contents.length)
        : 0;

    const aggregateEngagementRate =
      recentViews > 0
        ? Number((((recentLikes + recentComments) / recentViews) * 100).toFixed(2))
        : 0.0;

    // Historical 30-day timeline
    const historicalTrends = creator.metricSnapshots
      .slice(0, 15)
      .reverse()
      .map((s) => ({
        date: s.snapshotDate.toISOString().split("T")[0],
        platform: s.platform,
        followers: s.followerCount,
        engagementRate: s.engagementRate
      }));

    return {
      connectedPlatformsCount: creator.socialAccounts.length,
      totalAudience,
      totalLifetimeViews: totalLifetimeViews.toString(),
      recentContentCount: creator.contents.length,
      recentAvgViews,
      aggregateEngagementRate,
      platformBreakdown,
      historicalTrends
    };
  }

  /**
   * Generate verified Creator Media Kit data
   */
  static async generateMediaKit(creatorProfileId) {
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorProfileId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        socialAccounts: { where: { status: "CONNECTED" } },
        collaborations: {
          where: { status: "COMPLETED" },
          include: {
            campaign: {
              include: { brandProfile: { select: { companyName: true } } }
            }
          }
        },
        contents: {
          orderBy: { viewCount: "desc" },
          take: 6
        }
      }
    });

    if (!creator) {
      throw new Error("Creator profile not found");
    }

    const metrics = await this.getUnifiedMetrics(creatorProfileId);

    const pastCollaborations = creator.collaborations.map((collab) => ({
      brandName: collab.campaign.brandProfile.companyName,
      campaignTitle: collab.campaign.title,
      currency: collab.currency,
      agreedAmount: collab.agreedAmount,
      completedAt: collab.updatedAt
    }));

    return {
      creatorId: creator.id,
      name: creator.user.name,
      email: creator.user.email,
      bio: creator.bio || "Digital Content Creator & Storyteller",
      niches: creator.niches,
      verifiedPlatforms: creator.socialAccounts.map((acc) => ({
        platform: acc.platform,
        username: acc.username,
        displayName: acc.displayName,
        avatarUrl: acc.avatarUrl,
        profileUrl: acc.profileUrl,
        followerCount: metrics.platformBreakdown[acc.platform]?.followerCount || 0,
        engagementRate: metrics.platformBreakdown[acc.platform]?.engagementRate || 0.0
      })),
      totalAudience: metrics.totalAudience,
      totalLifetimeViews: metrics.totalLifetimeViews,
      avgViewsPerVideo: metrics.recentAvgViews,
      engagementRate: metrics.aggregateEngagementRate,
      topPerformingContent: creator.contents.map((c) => ({
        id: c.id,
        platform: c.platform,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        contentUrl: c.contentUrl,
        viewCount: c.viewCount,
        likeCount: c.likeCount,
        publishedAt: c.publishedAt
      })),
      pastCollaborations,
      isMouSigned: creator.isMouSigned,
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = MetricsService;
