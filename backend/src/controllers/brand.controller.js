const prisma = require("../db/prisma");
const MetricsService = require("../services/metrics.service");

/**
 * Create a new brand campaign with targeting criteria
 */
const createCampaign = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      niches,
      targetPlatforms,
      minFollowers,
      minEngagementRate,
      budget,
      deliverables,
      deadline,
      brandName
    } = req.body;

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

    const normalizedPlatforms = Array.isArray(targetPlatforms)
      ? targetPlatforms.map((p) => p.toUpperCase().trim())
      : [];

    const campaign = await prisma.campaign.create({
      data: {
        brandProfileId: brandProfile.id,
        title,
        description: description || "",
        niches: normalizedNiches,
        targetPlatforms: normalizedPlatforms,
        minFollowers: minFollowers ? Number(minFollowers) : 0,
        minEngagementRate: minEngagementRate ? Number(minEngagementRate) : 0.0,
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
      message: "Campaign brief published successfully 🚀",
      campaign: {
        id: campaign.id,
        brandName: campaign.brandProfile.companyName,
        title: campaign.title,
        description: campaign.description,
        niches: campaign.niches,
        targetPlatforms: campaign.targetPlatforms,
        minFollowers: campaign.minFollowers,
        minEngagementRate: campaign.minEngagementRate,
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
 * Get campaigns (Brand views their own, or all active if requested)
 */
const getCampaigns = async (req, res, next) => {
  try {
    let whereClause = {};

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
              include: {
                user: { select: { id: true, name: true, email: true } },
                socialAccounts: { where: { status: "CONNECTED" } }
              }
            }
          }
        },
        collaborations: true
      },
      orderBy: { createdAt: "desc" }
    });

    const formatted = campaigns.map((c) => ({
      id: c.id,
      brandName: c.brandProfile.companyName || c.brandProfile.user.name,
      title: c.title,
      description: c.description,
      niches: c.niches,
      targetPlatforms: c.targetPlatforms,
      budget: c.budget,
      deliverables: c.deliverables,
      status: c.status,
      applicantsCount: c.applications.length,
      collaborationsCount: c.collaborations.length,
      deadline: c.deadline,
      createdAt: c.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * Get applicants for a specific campaign (Enforces Brand Ownership)
 */
const getApplicants = async (req, res, next) => {
  try {
    const { id } = req.params;

    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id }
    });

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            creatorProfile: {
              include: {
                user: { select: { id: true, name: true, email: true } },
                socialAccounts: { where: { status: "CONNECTED" } }
              }
            }
          },
          orderBy: { appliedAt: "desc" }
        },
        collaborations: true
      }
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    if (!brandProfile || campaign.brandProfileId !== brandProfile.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only view applicants for campaigns you own"
      });
    }

    const applicants = campaign.applications.map((app) => {
      const collab = campaign.collaborations.find(
        (c) => c.creatorProfileId === app.creatorProfileId
      );

      return {
        applicationId: app.id,
        creatorId: app.creatorProfile.id,
        userId: app.creatorProfile.userId,
        name: app.creatorProfile.user.name,
        bio: app.creatorProfile.bio,
        niches: app.creatorProfile.niches,
        connectedPlatforms: app.creatorProfile.socialAccounts.map((s) => ({
          platform: s.platform,
          username: s.username,
          avatarUrl: s.avatarUrl
        })),
        portfolio: {
          platform: app.creatorProfile.platform,
          url: app.creatorProfile.portfolioUrl,
          followers: app.creatorProfile.followers,
          avgViews: app.creatorProfile.avgViews
        },
        status: app.status,
        collaborationId: collab?.id || null,
        collaborationStatus: collab?.status || null,
        pitch: app.pitch,
        appliedAt: app.appliedAt
      };
    });

    res.json(applicants);
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status (Accept / Reject / Shortlist) (Enforces Brand Ownership)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id: campaignId, appId } = req.params;
    const { status } = req.body; // 'ACCEPTED' | 'REJECTED' | 'SHORTLISTED'

    const upperStatus = status ? status.toUpperCase() : null;
    if (!["ACCEPTED", "REJECTED", "SHORTLISTED"].includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACCEPTED, REJECTED, or SHORTLISTED"
      });
    }

    const brandProfile = await prisma.brandProfile.findUnique({
      where: { userId: req.user.id }
    });

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    if (!brandProfile || campaign.brandProfileId !== brandProfile.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only manage applications for campaigns you own"
      });
    }

    const application = await prisma.campaignApplication.findUnique({
      where: { id: appId },
      include: { creatorProfile: true }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Map to AppStatus enum (Prisma enum: APPLIED, ACCEPTED, REJECTED)
    const appDbStatus = upperStatus === "SHORTLISTED" ? "APPLIED" : upperStatus;

    await prisma.campaignApplication.update({
      where: { id: appId },
      data: {
        status: appDbStatus,
        reviewedAt: new Date()
      }
    });

    // Update or create linked Collaboration record
    let collab = await prisma.collaboration.findUnique({
      where: {
        campaignId_creatorProfileId: {
          campaignId,
          creatorProfileId: application.creatorProfileId
        }
      }
    });

    const collabTargetStatus =
      upperStatus === "ACCEPTED"
        ? "ACCEPTED"
        : upperStatus === "SHORTLISTED"
        ? "SHORTLISTED"
        : "REJECTED";

    if (collab) {
      collab = await prisma.collaboration.update({
        where: { id: collab.id },
        data: { status: collabTargetStatus }
      });
    } else {
      collab = await prisma.collaboration.create({
        data: {
          campaignId,
          creatorProfileId: application.creatorProfileId,
          brandProfileId: brandProfile.id,
          status: collabTargetStatus,
          agreedAmount: campaign.budget,
          currency: "INR",
          deliverableTerms: campaign.deliverables,
          deadline: campaign.deadline
        }
      });
    }

    // If accepted and no deliverables exist yet, create initial deliverables from campaign terms
    if (upperStatus === "ACCEPTED") {
      const existingDelivs = await prisma.collaborationDeliverable.count({
        where: { collaborationId: collab.id }
      });

      if (existingDelivs === 0) {
        await prisma.collaborationDeliverable.create({
          data: {
            collaborationId: collab.id,
            title: "Primary Campaign Deliverable",
            description: campaign.deliverables || "Standard sponsored content integration",
            dueDate: campaign.deadline || new Date(Date.now() + 14 * 86400000)
          }
        });
      }
    }

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: application.creatorProfile.userId,
        title: `Application ${upperStatus} for "${campaign.title}"`,
        message:
          upperStatus === "ACCEPTED"
            ? `Congratulations! Brand accepted your application. Collaboration workspace is now active.`
            : `Your application status for "${campaign.title}" was updated to ${upperStatus}.`,
        type: "APPLICATION_STATUS",
        linkUrl: `/collaborations/${collab.id}`
      }
    });

    res.json({
      success: true,
      message: `Application marked as ${upperStatus}`,
      application,
      collaborationId: collab.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Brand Creator Discovery Catalog
 * Filters creators by verified metrics, niches, platforms, and keyword
 */
const discoverCreators = async (req, res, next) => {
  try {
    const { query, niche, platform, minFollowers, page = 1, limit = 15 } = req.query;

    let whereClause = {};

    if (niche) {
      whereClause.niches = { has: niche.toLowerCase().trim() };
    }

    if (platform) {
      whereClause.socialAccounts = {
        some: {
          platform: platform.toUpperCase().trim(),
          status: "CONNECTED"
        }
      };
    }

    if (query) {
      whereClause.OR = [
        { bio: { contains: query, mode: "insensitive" } },
        { user: { name: { contains: query, mode: "insensitive" } } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [creators, total] = await Promise.all([
      prisma.creatorProfile.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true } },
          socialAccounts: { where: { status: "CONNECTED" } },
          contents: { take: 3, orderBy: { viewCount: "desc" } }
        },
        skip,
        take: Number(limit),
        orderBy: { updatedAt: "desc" }
      }),
      prisma.creatorProfile.count({ where: whereClause })
    ]);

    // Format safe verified discovery cards
    const discoveryList = creators.map((cr) => {
      let totalReach = 0;
      cr.socialAccounts.forEach((acc) => {
        // Parse followers
        const f = parseInt(cr.followers || "0", 10);
        totalReach = Math.max(totalReach, isNaN(f) ? 0 : f);
      });

      return {
        creatorId: cr.id,
        name: cr.user.name,
        bio: cr.bio || "Content Creator & Influencer",
        niches: cr.niches,
        connectedPlatforms: cr.socialAccounts.map((s) => ({
          platform: s.platform,
          username: s.username,
          avatarUrl: s.avatarUrl
        })),
        verifiedReach: totalReach || cr.followers || "Verified Account",
        avgViews: cr.avgViews || "N/A",
        featuredContent: cr.contents.map((c) => ({
          title: c.title,
          thumbnailUrl: c.thumbnailUrl,
          viewCount: c.viewCount
        })),
        isMouSigned: cr.isMouSigned
      };
    });

    res.json({
      success: true,
      creators: discoveryList,
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

module.exports = {
  createCampaign,
  getCampaigns,
  getApplicants,
  updateApplicationStatus,
  discoverCreators
};
