const prisma = require("../db/prisma");

/**
 * Create a new brand campaign
 */
const createCampaign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, niches, budget, deliverables, deadline, brandName } = req.body;

    if (!title || !budget) {
      return res.status(400).json({
        success: false,
        message: "Title and budget are required"
      });
    }

    const brandProfile = await prisma.brandProfile.upsert({
      where: { userId },
      update: {
        companyName: brandName || undefined
      },
      create: {
        userId,
        companyName: brandName || req.user.name
      }
    });

    const normalizedNiches = Array.isArray(niches)
      ? niches.map((n) => n.toLowerCase().trim())
      : [];

    const campaign = await prisma.campaign.create({
      data: {
        brandProfileId: brandProfile.id,
        title,
        description: description || "",
        niches: normalizedNiches,
        budget: Number(budget),
        deliverables: deliverables || "",
        deadline: deadline ? new Date(deadline) : null,
        status: "OPEN"
      },
      include: {
        brandProfile: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Campaign created successfully 🚀",
      campaign: {
        id: campaign.id,
        brandName: campaign.brandProfile.companyName,
        title: campaign.title,
        description: campaign.description,
        niches: campaign.niches,
        budget: campaign.budget,
        deliverables: campaign.deliverables,
        createdAt: campaign.createdAt,
        applicants: []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all campaigns (Brand views their own, or all active if requested)
 */
const getCampaigns = async (req, res, next) => {
  try {
    let whereClause = {};

    // If user is brand, return their campaigns (or all if query ?all=true)
    if (req.user && req.user.role === "BRAND" && req.query.all !== "true") {
      const brandProfile = await prisma.brandProfile.findUnique({
        where: { userId: req.user.id }
      });
      if (brandProfile) {
        whereClause.brandProfileId = brandProfile.id;
      }
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        brandProfile: { include: { user: { select: { name: true } } } },
        applications: {
          include: {
            creatorProfile: {
              include: { user: { select: { id: true, name: true, email: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Format for frontend
    const formatted = campaigns.map((c) => ({
      id: c.id,
      brandName: c.brandProfile.companyName || c.brandProfile.user.name,
      title: c.title,
      description: c.description,
      niches: c.niches,
      budget: c.budget,
      deliverables: c.deliverables,
      status: c.status,
      applicantsCount: c.applications.length,
      createdAt: c.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * Get applicants for a specific campaign
 */
const getApplicants = async (req, res, next) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            creatorProfile: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          },
          orderBy: { appliedAt: "desc" }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found"
      });
    }

    // Format applicants for BrandDashboard
    const applicants = campaign.applications.map((app) => ({
      applicationId: app.id,
      creatorId: app.creatorProfile.id,
      userId: app.creatorProfile.userId,
      name: app.creatorProfile.user.name,
      niches: app.creatorProfile.niches,
      portfolio: {
        platform: app.creatorProfile.platform,
        url: app.creatorProfile.portfolioUrl,
        followers: app.creatorProfile.followers,
        avgViews: app.creatorProfile.avgViews
      },
      status: app.status,
      pitch: app.pitch,
      appliedAt: app.appliedAt
    }));

    res.json(applicants);
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status (Accept / Reject)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id: campaignId, appId } = req.params;
    const { status } = req.body; // 'ACCEPTED' | 'REJECTED'

    const upperStatus = status ? status.toUpperCase() : null;
    if (!["ACCEPTED", "REJECTED"].includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either ACCEPTED or REJECTED"
      });
    }

    const application = await prisma.campaignApplication.update({
      where: { id: appId },
      data: {
        status: upperStatus,
        reviewedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: `Application marked as ${upperStatus}`,
      application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getApplicants,
  updateApplicationStatus
};
