const prisma = require("../db/prisma");
const EscrowService = require("../services/escrow.service");

/**
 * Creator submits deliverable for milestone
 */
const submitMilestoneDeliverable = async (req, res, next) => {
  try {
    const { id: milestoneId } = req.params;
    const { assetUrl, notes } = req.body;

    if (!assetUrl) {
      return res.status(400).json({
        success: false,
        message: "Deliverable assetUrl (link or demo file) is required"
      });
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!creatorProfile) {
      return res.status(403).json({
        success: false,
        message: "Creator profile not found"
      });
    }

    const result = await EscrowService.submitDeliverable({
      milestoneId,
      creatorProfileId: creatorProfile.id,
      assetUrl,
      notes
    });

    res.status(201).json({
      success: true,
      message: "Deliverable submitted for review! Escrow state: SUBMITTED",
      submission: result.submission,
      milestone: result.milestone
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Investor approves milestone deliverable and releases escrow funds
 */
const approveMilestone = async (req, res, next) => {
  try {
    const { id: milestoneId } = req.params;
    const { feedback } = req.body;

    const result = await EscrowService.approveMilestone({
      milestoneId,
      reviewerUserId: req.user.id,
      feedback
    });

    res.json({
      success: true,
      message: "Milestone deliverable approved! Escrow funds released to creator 🎉",
      milestone: result.milestone,
      payoutTxn: result.payoutTxn,
      projectCompleted: result.projectCompleted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Investor requests changes or rejects deliverable
 */
const rejectMilestone = async (req, res, next) => {
  try {
    const { id: milestoneId } = req.params;
    const { reason } = req.body;

    const result = await EscrowService.rejectMilestone({
      milestoneId,
      reviewerUserId: req.user.id,
      reason
    });

    res.json({
      success: true,
      message: "Milestone returned with changes requested. Escrow funds remain HELD.",
      milestone: result.milestone
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get auditable escrow transactions ledger for a project
 */
const getProjectEscrowLedger = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;

    const transactions = await prisma.escrowTransaction.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, role: true } },
        milestone: { select: { id: true, title: true, status: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({
      success: true,
      projectId,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitMilestoneDeliverable,
  approveMilestone,
  rejectMilestone,
  getProjectEscrowLedger
};
