const prisma = require("../db/prisma");

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
        projects: { where: { status: "COMPLETED" } }
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Creator not found"
      });
    }

    // Format for legacy frontend compatibility as well
    res.json({
      id: profile.id,
      name: profile.user.name,
      niches: profile.niches,
      portfolio: {
        platform: profile.platform,
        url: profile.portfolioUrl,
        followers: profile.followers,
        avgViews: profile.avgViews
      },
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
 * Get Matched Campaigns for Creator based on niches
 */
const getMatchedCampaigns = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId },
      include: { applications: true }
    });

    if (!profile || !profile.niches || profile.niches.length === 0) {
      return res.json([]);
    }

    // Find campaigns where niches overlap with creator niches
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: "OPEN",
        niches: {
          hasSome: profile.niches
        }
      },
      include: {
        brandProfile: {
          include: { user: { select: { name: true } } }
        },
        applications: {
          where: { creatorProfileId: profile.id }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Format response matching frontend expectation
    const formatted = campaigns.map((c) => ({
      id: c.id,
      brandName: c.brandProfile.companyName || c.brandProfile.user.name,
      title: c.title,
      description: c.description,
      niches: c.niches,
      budget: c.budget,
      deliverables: c.deliverables,
      alreadyApplied: c.applications.length > 0,
      createdAt: c.createdAt
    }));

    res.json(formatted);
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
      where: { id: campaignId }
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

    const application = await prisma.campaignApplication.create({
      data: {
        campaignId,
        creatorProfileId: profile.id,
        pitch: pitch || ""
      }
    });

    res.status(201).json({
      success: true,
      message: "Applied successfully 🚀",
      application
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
  applyToCampaign
};
