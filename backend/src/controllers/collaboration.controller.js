const prisma = require("../db/prisma");
const CollaborationService = require("../services/collaboration.service");

/**
 * List collaborations for current authenticated user
 */
const getCollaborations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};
    if (userRole === "CREATOR") {
      const creator = await prisma.creatorProfile.findUnique({ where: { userId } });
      if (!creator) return res.json([]);
      whereClause.creatorProfileId = creator.id;
    } else if (userRole === "BRAND") {
      const brand = await prisma.brandProfile.findUnique({ where: { userId } });
      if (!brand) return res.json([]);
      whereClause.brandProfileId = brand.id;
    }

    const collaborations = await prisma.collaboration.findMany({
      where: whereClause,
      include: {
        campaign: {
          include: { brandProfile: { select: { companyName: true, website: true } } }
        },
        creatorProfile: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        deliverables: true
      },
      orderBy: { updatedAt: "desc" }
    });

    res.json({
      success: true,
      collaborations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single collaboration with ownership check
 */
const getCollaborationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const collab = await prisma.collaboration.findUnique({
      where: { id },
      include: {
        campaign: {
          include: { brandProfile: true }
        },
        creatorProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            socialAccounts: { where: { status: "CONNECTED" } }
          }
        },
        brandProfile: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
        deliverables: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!collab) {
      return res.status(404).json({ success: false, message: "Collaboration not found" });
    }

    // Ownership check (Creator, Brand, or Admin)
    const isParticipant =
      collab.creatorProfile.userId === userId ||
      collab.brandProfile.userId === userId ||
      req.user.role === "ADMIN";

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not a participant in this collaboration"
      });
    }

    res.json({
      success: true,
      collaboration: collab
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transition collaboration lifecycle state
 */
const transitionCollaborationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const userId = req.user.id;

    const collab = await prisma.collaboration.findUnique({
      where: { id },
      include: { creatorProfile: true, brandProfile: true }
    });

    if (!collab) {
      return res.status(404).json({ success: false, message: "Collaboration not found" });
    }

    // Ownership check
    const isParticipant =
      collab.creatorProfile.userId === userId ||
      collab.brandProfile.userId === userId ||
      req.user.role === "ADMIN";

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updated = await CollaborationService.transitionStatus(id, status, userId, note);

    res.json({
      success: true,
      message: `Collaboration moved to ${status}`,
      collaboration: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add deliverable requirement to collaboration
 */
const addDeliverable = async (req, res, next) => {
  try {
    const { id: collaborationId } = req.params;
    const { title, description, platform, dueDate } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ success: false, message: "Deliverable title is required" });
    }

    const collab = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: { brandProfile: true }
    });

    if (!collab) {
      return res.status(404).json({ success: false, message: "Collaboration not found" });
    }

    if (collab.brandProfile.userId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the brand owner can define deliverables"
      });
    }

    const deliverable = await prisma.collaborationDeliverable.create({
      data: {
        collaborationId,
        title,
        description: description || "",
        platform: platform ? platform.toUpperCase() : null,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    res.status(201).json({
      success: true,
      message: "Deliverable requirement added",
      deliverable
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Creator submits deliverable
 */
const submitDeliverable = async (req, res, next) => {
  try {
    const { deliverableId } = req.params;
    const { submissionUrl, notes } = req.body;
    const userId = req.user.id;

    if (!submissionUrl) {
      return res.status(400).json({
        success: false,
        message: "Submission URL (video link, cloud asset URL, post link) is required"
      });
    }

    const deliverable = await CollaborationService.submitDeliverable(
      deliverableId,
      { submissionUrl, notes },
      userId
    );

    res.json({
      success: true,
      message: "Deliverable submitted for brand review! 🚀",
      deliverable
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Brand reviews deliverable
 */
const reviewDeliverable = async (req, res, next) => {
  try {
    const { deliverableId } = req.params;
    const { decision, feedback } = req.body;
    const userId = req.user.id;

    const deliverable = await CollaborationService.reviewDeliverable(
      deliverableId,
      { decision, feedback },
      userId
    );

    res.json({
      success: true,
      message: `Deliverable marked as ${decision}`,
      deliverable
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCollaborations,
  getCollaborationById,
  transitionCollaborationStatus,
  addDeliverable,
  submitDeliverable,
  reviewDeliverable
};
