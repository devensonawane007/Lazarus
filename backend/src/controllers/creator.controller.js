const prisma = require("../db/prisma");
const MetricsService = require("../services/metrics.service");
const MatchingService = require("../services/matching.service");

/**
 * Get Creator Profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        mous: { orderBy: { signedAt: "desc" }, take: 1 },
        socialAccounts: { where: { status: "CONNECTED" } },
        projects: { include: { milestones: true } }
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found"
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public/Brand view of a creator profile by ID or userId
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await prisma.creatorProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }]
      },
      include: {
        user: { select: { id: true, name: true } },
        socialAccounts: { where: { status: "CONNECTED" } },
        projects: { where: { status: "COMPLETED" } }
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Creator not found"
      });
    }

    res.json({
      id: profile.id,
      name: profile.user.name,
      bio: profile.bio,
      niches: profile.niches,
      portfolio: {
        platform: profile.platform,
        url: profile.portfolioUrl,
        followers: profile.followers,
        avgViews: profile.avgViews
      },
      socialAccounts: profile.socialAccounts,
      isMouSigned: profile.isMouSigned
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or Update Creator Profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { niches, platform, url, followers, avgViews, bio } = req.body;

    const normalizedNiches = Array.isArray(niches)
      ? niches.map((n) => n.toLowerCase().trim())
      : [];

    const profile = await prisma.creatorProfile.upsert({
      where: { userId },
      update: {
        niches: normalizedNiches,
        platform: platform || "youtube",
        portfolioUrl: url || undefined,
        followers: followers ? String(followers) : undefined,
        avgViews: avgViews ? String(avgViews) : undefined,
        bio: bio || undefined
      },
      create: {
        userId,
        niches: normalizedNiches,
        platform: platform || "youtube",
        portfolioUrl: url || "",
        followers: followers ? String(followers) : "",
        avgViews: avgViews ? String(avgViews) : "",
        bio: bio || ""
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    res.json({
      success: true,
      message: "Creator profile updated successfully",
      creator: {
        id: profile.id,
        name: profile.user.name,
        niches: profile.niches,
        portfolio: {
          platform: profile.platform,
          url: profile.portfolioUrl,
          followers: profile.followers,
          avgViews: profile.avgViews
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sign Agentic AI Creator MOU
 */
const signMOU = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { signatureData, documentTitle } = req.body;

    if (!signatureData) {
      return res.status(400).json({
        success: false,
        message: "Digital signature is required"
      });
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found. Please register as creator."
      });
    }

    const mou = await prisma.$transaction(async (tx) => {
      const created = await tx.mOUAgreement.create({
        data: {
          creatorProfileId: profile.id,
          documentTitle: documentTitle || "Agentic AI Creator MOU Agreement",
          signatureData
        }
      });

      await tx.creatorProfile.update({
        where: { id: profile.id },
        data: { isMouSigned: true }
      });

      return created;
    });

    res.status(201).json({
      success: true,
      message: "MOU signed and recorded successfully",
      mouId: mou.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Matched Campaigns for Creator with Explainable Matching Scores
 */
const getMatchedCampaigns = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.json([]);
    }

    const rankedOpportunities = await MatchingService.getOpportunitiesForCreator(profile.id);
    res.json(rankedOpportunities);
  } catch (error) {
    next(error);
  }
};

/**
 * Creator applies to a brand campaign
 */
const applyToCampaign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { campaignId, pitch } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required"
      });
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Creator profile not found"
      });
    }

    if (!profile.isMouSigned) {
      return res.status(403).json({
        success: false,
        message: "You must sign the Agentic AI MOU before applying to campaigns"
      });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { brandProfile: true }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    const existingApp = await prisma.campaignApplication.findUnique({
      where: {
        campaignId_creatorProfileId: {
          campaignId,
          creatorProfileId: profile.id
        }
      }
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: "Already applied to this campaign"
      });
    }

    // Create both application and initiate collaboration lifecycle in transaction
    const { application, collaboration } = await prisma.$transaction(async (tx) => {
      const app = await tx.campaignApplication.create({
        data: {
          campaignId,
          creatorProfileId: profile.id,
          pitch: pitch || ""
        }
      });

      const collab = await tx.collaboration.create({
        data: {
          campaignId,
          creatorProfileId: profile.id,
          brandProfileId: campaign.brandProfileId,
          status: "APPLIED",
          agreedAmount: campaign.budget,
          currency: "INR",
          deliverableTerms: campaign.deliverables,
          deadline: campaign.deadline
        }
      });

      // Notify Brand
      await tx.notification.create({
        data: {
          userId: campaign.brandProfile.userId,
          title: "New Creator Application Received",
          message: `A creator applied to your campaign "${campaign.title}". Pitch: ${
            pitch ? pitch.slice(0, 100) : "Review application"
          }`,
          type: "APPLICATION_STATUS",
          linkUrl: `/collaborations/${collab.id}`
        }
      });

      return { application: app, collaboration: collab };
    });

    res.status(201).json({
      success: true,
      message: "Application submitted and collaboration workspace initialized! 🚀",
      application,
      collaborationId: collaboration.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unified cross-platform analytics for Creator Studio
 */
const getUnifiedAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Creator profile not found" });
    }

    const analytics = await MetricsService.getUnifiedMetrics(profile.id);
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unified content library for Creator Studio
 */
const getContentLibrary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { platform, page = 1, limit = 20 } = req.query;

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Creator profile not found" });
    }

    let whereClause = { creatorProfileId: profile.id };
    if (platform && platform !== "ALL") {
      whereClause.platform = platform.toUpperCase();
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [contents, total] = await Promise.all([
      prisma.creatorContent.findMany({
        where: whereClause,
        orderBy: { publishedAt: "desc" },
        skip,
        take: Number(limit)
      }),
      prisma.creatorContent.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      contents,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get automatically generated Creator Media Kit
 */
const getMediaKit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Creator profile not found" });
    }

    const mediaKit = await MetricsService.generateMediaKit(profile.id);
    res.json({
      success: true,
      mediaKit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public Creator Media Kit View (Accessible without auth)
 */
const getPublicMediaKit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await prisma.creatorProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }]
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Creator not found" });
    }

    const mediaKit = await MetricsService.generateMediaKit(profile.id);
    res.json({
      success: true,
      mediaKit
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getPublicProfile,
  updateProfile,
  signMOU,
  getMatchedCampaigns,
  applyToCampaign,
  getUnifiedAnalytics,
  getContentLibrary,
  getMediaKit,
  getPublicMediaKit
};
