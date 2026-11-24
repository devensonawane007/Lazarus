const prisma = require("../db/prisma");
const MetricsService = require("./metrics.service");

class MatchingService {
  /**
   * Deterministic matching weights
   */
  static WEIGHTS = {
    NICHE: 0.35,
    PLATFORM: 0.25,
    AUDIENCE: 0.20,
    ENGAGEMENT: 0.20
  };

  /**
   * Compute compatibility score and explanation between a creator and a campaign
   */
  static evaluateMatch(creator, unifiedMetrics, campaign) {
    const creatorNiches = (creator.niches || []).map((n) => n.toLowerCase().trim());
    const campaignNiches = (campaign.niches || []).map((n) => n.toLowerCase().trim());
    const connectedPlatforms = (creator.socialAccounts || []).map((acc) => acc.platform);

    // 1. Niche Compatibility Score (0 - 100)
    let nicheScore = 0;
    const commonNiches = creatorNiches.filter((n) => campaignNiches.includes(n));
    if (campaignNiches.length === 0) {
      nicheScore = 80; // General open campaign
    } else if (commonNiches.length > 0) {
      nicheScore = Math.min(
        100,
        Math.round((commonNiches.length / campaignNiches.length) * 100 + 20)
      );
    } else {
      nicheScore = 15; // Low overlap
    }

    // 2. Platform Compatibility Score (0 - 100)
    let platformScore = 100;
    const targetPlatforms = campaign.targetPlatforms || [];
    if (targetPlatforms.length > 0) {
      const matchingPlatforms = targetPlatforms.filter((p) =>
        connectedPlatforms.includes(p.toUpperCase())
      );
      if (matchingPlatforms.length === targetPlatforms.length) {
        platformScore = 100;
      } else if (matchingPlatforms.length > 0) {
        platformScore = Math.round((matchingPlatforms.length / targetPlatforms.length) * 100);
      } else {
        platformScore = 10; // Creator does not have required platform
      }
    }

    // 3. Audience Scale Compatibility Score (0 - 100)
    let audienceScore = 100;
    const totalAudience = unifiedMetrics.totalAudience || 0;
    const minFollowers = campaign.minFollowers || 0;
    if (minFollowers > 0) {
      if (totalAudience >= minFollowers) {
        audienceScore = 100;
      } else {
        const ratio = totalAudience / minFollowers;
        audienceScore = Math.max(10, Math.round(ratio * 80));
      }
    }

    // 4. Engagement Quality Score (0 - 100)
    let engagementScore = 100;
    const engagementRate = unifiedMetrics.aggregateEngagementRate || 0.0;
    const minEngagement = campaign.minEngagementRate || 0.0;
    if (minEngagement > 0) {
      if (engagementRate >= minEngagement) {
        engagementScore = 100;
      } else {
        const ratio = engagementRate / minEngagement;
        engagementScore = Math.max(20, Math.round(ratio * 80));
      }
    }

    // Weighted Overall Score
    const overallScore = Math.round(
      nicheScore * this.WEIGHTS.NICHE +
      platformScore * this.WEIGHTS.PLATFORM +
      audienceScore * this.WEIGHTS.AUDIENCE +
      engagementScore * this.WEIGHTS.ENGAGEMENT
    );

    // Human-readable explainable rationale
    const reasons = [];
    if (commonNiches.length > 0) {
      reasons.push(`aligned with your ${commonNiches.join(", ")} content focus`);
    }
    if (targetPlatforms.length > 0 && platformScore >= 80) {
      reasons.push(`matches your connected ${connectedPlatforms.join(", ")} presence`);
    }
    if (totalAudience > 0 && audienceScore >= 80) {
      reasons.push(`verified audience reach (${totalAudience.toLocaleString()} followers)`);
    }
    if (engagementRate > 0) {
      reasons.push(`${engagementRate}% engagement rate`);
    }

    const explanation =
      reasons.length > 0
        ? `Recommended because of your ${reasons.join(", and ")}.`
        : "Standard opportunity match based on platform catalog.";

    return {
      overallScore,
      breakdown: {
        nicheScore,
        platformScore,
        audienceScore,
        engagementScore
      },
      explanation
    };
  }

  /**
   * Get scored, ranked opportunities for a specific creator
   */
  static async getOpportunitiesForCreator(creatorProfileId) {
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorProfileId },
      include: {
        socialAccounts: { where: { status: "CONNECTED" } },
        applications: true,
        collaborations: true
      }
    });

    if (!creator) {
      throw new Error("Creator profile not found");
    }

    const unifiedMetrics = await MetricsService.getUnifiedMetrics(creatorProfileId);

    const openCampaigns = await prisma.campaign.findMany({
      where: { status: "OPEN" },
      include: {
        brandProfile: {
          include: { user: { select: { name: true } } }
        },
        applications: {
          where: { creatorProfileId }
        },
        collaborations: {
          where: { creatorProfileId }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const evaluated = openCampaigns.map((camp) => {
      const matchEvaluation = this.evaluateMatch(creator, unifiedMetrics, camp);
      const existingApplication = camp.applications[0];
      const existingCollaboration = camp.collaborations[0];

      return {
        id: camp.id,
        brandName: camp.brandProfile.companyName || camp.brandProfile.user.name,
        brandWebsite: camp.brandProfile.website,
        isBrandVerified: camp.brandProfile.isVerified,
        title: camp.title,
        description: camp.description,
        niches: camp.niches,
        targetPlatforms: camp.targetPlatforms,
        budget: camp.budget,
        deliverables: camp.deliverables,
        minFollowers: camp.minFollowers,
        minEngagementRate: camp.minEngagementRate,
        deadline: camp.deadline,
        matchScore: matchEvaluation.overallScore,
        matchBreakdown: matchEvaluation.breakdown,
        explanation: matchEvaluation.explanation,
        alreadyApplied: Boolean(existingApplication),
        applicationStatus: existingApplication?.status || null,
        collaborationStatus: existingCollaboration?.status || null,
        collaborationId: existingCollaboration?.id || null,
        createdAt: camp.createdAt
      };
    });

    // Rank by matchScore descending
    evaluated.sort((a, b) => b.matchScore - a.matchScore);

    return evaluated;
  }
}

module.exports = MatchingService;
