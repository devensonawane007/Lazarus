const prisma = require("../db/prisma");

/**
 * Valid state transitions for Milestones in Escrow
 */
const VALID_MILESTONE_TRANSITIONS = {
  PENDING: ["HELD", "DISPUTED"],
  HELD: ["SUBMITTED", "DISPUTED", "REFUNDED"],
  SUBMITTED: ["APPROVED", "HELD", "DISPUTED"], // HELD represents changes requested / rejection
  APPROVED: ["RELEASED", "DISPUTED"],
  RELEASED: [], // Terminal state — cannot transition back!
  DISPUTED: ["HELD", "REFUNDED", "RELEASED"],
  REFUNDED: [] // Terminal state
};

/**
 * Valid state transitions for Investments
 */
const VALID_INVESTMENT_TRANSITIONS = {
  COMMITTED: ["HELD_IN_ESCROW", "REFUNDED"],
  HELD_IN_ESCROW: ["RELEASED", "REFUNDED"],
  RELEASED: [],
  REFUNDED: []
};

class EscrowService {
  /**
   * Validate if a milestone transition is permissible
   */
  static validateMilestoneTransition(currentStatus, newStatus) {
    const allowed = VALID_MILESTONE_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Invalid escrow transition: Cannot move from ${currentStatus} to ${newStatus}. Allowed transitions: [${allowed.join(", ") || "none"}]`
      );
    }
  }

  /**
   * Record an investment and place funds into escrow hold
   */
  static async recordInvestment({ investorId, projectId, amount }) {
    if (amount <= 0) {
      throw new Error("Investment amount must be greater than zero");
    }

    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId },
        include: { milestones: true }
      });

      if (!project) {
        throw new Error("Project not found");
      }

      if (project.status === "COMPLETED" || project.status === "DISPUTED") {
        throw new Error(`Cannot invest in a project with status ${project.status}`);
      }

      // 1. Create Investment record
      const investment = await tx.investment.create({
        data: {
          investorId,
          projectId,
          amount,
          status: "HELD_IN_ESCROW"
        }
      });

      // 2. Update Project raised amount
      const newRaised = project.amountRaised + amount;
      const newProjectStatus = newRaised >= project.fundingTarget ? "IN_PROGRESS" : "FUNDING";

      await tx.project.update({
        where: { id: projectId },
        data: {
          amountRaised: newRaised,
          status: newProjectStatus
        }
      });

      // 3. Update Investor Profile total invested
      await tx.investorProfile.upsert({
        where: { userId: investorId },
        update: { totalInvested: { increment: amount } },
        create: {
          userId: investorId,
          totalInvested: amount
        }
      });

      // 4. Record Escrow Transaction (HOLD)
      const escrowTxn = await tx.escrowTransaction.create({
        data: {
          projectId,
          investmentId: investment.id,
          userId: investorId,
          amount,
          type: "HOLD",
          status: "COMPLETED",
          externalTxnId: `ESCROW_HOLD_${Date.now()}_${investment.id.slice(0, 8)}`,
          note: `Investment of ₹${amount} placed in escrow hold for project: ${project.title}`
        }
      });

      // 5. If project has milestones in PENDING, update primary milestone to HELD
      const pendingMilestone = project.milestones.find((m) => m.status === "PENDING");
      if (pendingMilestone) {
        await tx.milestone.update({
          where: { id: pendingMilestone.id },
          data: { status: "HELD" }
        });
      }

      return {
        investment,
        totalRaised: newRaised,
        projectStatus: newProjectStatus,
        escrowTxn
      };
    });
  }

  /**
   * Submit deliverable for a milestone
   */
  static async submitDeliverable({ milestoneId, creatorProfileId, assetUrl, notes }) {
    return await prisma.$transaction(async (tx) => {
      const milestone = await tx.milestone.findUnique({
        where: { id: milestoneId },
        include: { project: true }
      });

      if (!milestone) throw new Error("Milestone not found");
      if (milestone.project.creatorProfileId !== creatorProfileId) {
        throw new Error("Unauthorized: You do not own this project milestone");
      }

      // Check transition
      this.validateMilestoneTransition(milestone.status, "SUBMITTED");

      // Create submission record
      const submission = await tx.submission.create({
        data: {
          milestoneId,
          creatorProfileId,
          assetUrl,
          notes,
          status: "SUBMITTED"
        }
      });

      // Update milestone status
      const updatedMilestone = await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: "SUBMITTED" }
      });

      // Update project status to SUBMITTED
      await tx.project.update({
        where: { id: milestone.projectId },
        data: { status: "SUBMITTED" }
      });

      return { submission, milestone: updatedMilestone };
    });
  }

  /**
   * Investor approves milestone deliverable and releases escrow funds
   */
  static async approveMilestone({ milestoneId, reviewerUserId, feedback }) {
    return await prisma.$transaction(async (tx) => {
      const milestone = await tx.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          project: {
            include: {
              creatorProfile: { include: { user: true } },
              investments: true
            }
          },
          submissions: { orderBy: { submittedAt: "desc" }, take: 1 }
        }
      });

      if (!milestone) throw new Error("Milestone not found");

      // Verify reviewer is an investor in this project
      const isInvestor = milestone.project.investments.some((inv) => inv.investorId === reviewerUserId);
      if (!isInvestor) {
        throw new Error("Unauthorized: Only an investor in this project can approve deliverables");
      }

      // Validate transitions
      this.validateMilestoneTransition(milestone.status, "APPROVED");
      this.validateMilestoneTransition("APPROVED", "RELEASED");

      // 1. Update latest submission status
      if (milestone.submissions.length > 0) {
        await tx.submission.update({
          where: { id: milestone.submissions[0].id },
          data: {
            status: "APPROVED",
            reviewerFeedback: feedback || "Approved by investor",
            reviewedAt: new Date()
          }
        });
      }

      // 2. Mark milestone as RELEASED
      const updatedMilestone = await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: "RELEASED" }
      });

      // 3. Record Escrow Transaction (RELEASE payout to creator)
      const payoutTxn = await tx.escrowTransaction.create({
        data: {
          projectId: milestone.projectId,
          milestoneId: milestone.id,
          userId: milestone.project.creatorProfile.userId,
          amount: milestone.targetAmount,
          type: "RELEASE",
          status: "COMPLETED",
          externalTxnId: `ESCROW_RELEASE_${Date.now()}_${milestone.id.slice(0, 8)}`,
          note: `Released ₹${milestone.targetAmount} to creator for milestone: ${milestone.title}`
        }
      });

      // 4. Check if all milestones are released -> mark project COMPLETED
      const allMilestones = await tx.milestone.findMany({
        where: { projectId: milestone.projectId }
      });
      const allReleased = allMilestones.every((m) => m.id === milestoneId || m.status === "RELEASED");

      if (allReleased) {
        await tx.project.update({
          where: { id: milestone.projectId },
          data: { status: "COMPLETED" }
        });
      }

      return {
        milestone: updatedMilestone,
        payoutTxn,
        projectCompleted: allReleased
      };
    });
  }

  /**
   * Investor rejects deliverable / requests revisions
   */
  static async rejectMilestone({ milestoneId, reviewerUserId, reason }) {
    return await prisma.$transaction(async (tx) => {
      const milestone = await tx.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          project: { include: { investments: true } },
          submissions: { orderBy: { submittedAt: "desc" }, take: 1 }
        }
      });

      if (!milestone) throw new Error("Milestone not found");

      const isInvestor = milestone.project.investments.some((inv) => inv.investorId === reviewerUserId);
      if (!isInvestor) {
        throw new Error("Unauthorized: Only an investor can review milestone deliverables");
      }

      // Rejection moves milestone back to HELD
      this.validateMilestoneTransition(milestone.status, "HELD");

      if (milestone.submissions.length > 0) {
        await tx.submission.update({
          where: { id: milestone.submissions[0].id },
          data: {
            status: "CHANGES_REQUESTED",
            reviewerFeedback: reason || "Changes requested by investor",
            reviewedAt: new Date()
          }
        });
      }

      const updatedMilestone = await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: "HELD" }
      });

      await tx.project.update({
        where: { id: milestone.projectId },
        data: { status: "IN_PROGRESS" }
      });

      return { milestone: updatedMilestone };
    });
  }
}

module.exports = EscrowService;
