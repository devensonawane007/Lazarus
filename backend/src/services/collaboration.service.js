const prisma = require("../db/prisma");

class CollaborationService {
  /**
   * Allowed state transitions
   */
  static VALID_TRANSITIONS = {
    DISCOVERED: ["APPLIED", "CANCELLED"],
    APPLIED: ["SHORTLISTED", "REJECTED", "CANCELLED"],
    SHORTLISTED: ["NEGOTIATION", "REJECTED", "CANCELLED"],
    NEGOTIATION: ["ACCEPTED", "REJECTED", "CANCELLED"],
    ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["SUBMITTED", "CANCELLED"],
    SUBMITTED: ["REVISION_REQUESTED", "APPROVED"],
    REVISION_REQUESTED: ["SUBMITTED", "CANCELLED"],
    APPROVED: ["COMPLETED"],
    COMPLETED: [],
    REJECTED: [],
    CANCELLED: []
  };

  /**
   * Transition collaboration state safely
   */
  static async transitionStatus(collaborationId, targetStatus, actorId, note = "") {
    const collab = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        campaign: true,
        creatorProfile: { include: { user: true } },
        brandProfile: { include: { user: true } },
        deliverables: true
      }
    });

    if (!collab) {
      throw new Error("Collaboration not found");
    }

    const currentStatus = collab.status;
    const allowed = this.VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(targetStatus)) {
      throw new Error(
        `Invalid lifecycle transition from ${currentStatus} to ${targetStatus}. Allowed: [${allowed.join(
          ", "
        )}]`
      );
    }

    // Update status
    const updated = await prisma.collaboration.update({
      where: { id: collaborationId },
      data: {
        status: targetStatus,
        updatedAt: new Date()
      },
      include: {
        campaign: true,
        deliverables: true
      }
    });

    // Notify counterpart
    const notifyUserId =
      actorId === collab.creatorProfile.userId
        ? collab.brandProfile.userId
        : collab.creatorProfile.userId;

    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        title: `Collaboration ${targetStatus.replace("_", " ")}`,
        message: `Campaign "${collab.campaign.title}" collaboration status moved to ${targetStatus}.${
          note ? ` Note: ${note}` : ""
        }`,
        type: "COLLABORATION_UPDATE",
        linkUrl: `/collaborations/${collaborationId}`
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId,
        action: `COLLABORATION_STATUS_${targetStatus}`,
        resourceType: "COLLABORATION",
        resourceId: collaborationId,
        detailsJson: { previousStatus: currentStatus, newStatus: targetStatus, note }
      }
    });

    return updated;
  }

  /**
   * Submit deliverable asset / content link
   */
  static async submitDeliverable(deliverableId, { submissionUrl, notes }, creatorUserId) {
    const deliverable = await prisma.collaborationDeliverable.findUnique({
      where: { id: deliverableId },
      include: {
        collaboration: {
          include: { creatorProfile: true, brandProfile: true, campaign: true }
        }
      }
    });

    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    if (deliverable.collaboration.creatorProfile.userId !== creatorUserId) {
      throw new Error("Forbidden: You are not authorized to submit this deliverable");
    }

    const updatedDeliverable = await prisma.collaborationDeliverable.update({
      where: { id: deliverableId },
      data: {
        submissionUrl,
        notes,
        status: "SUBMITTED",
        submittedAt: new Date()
      }
    });

    // Move collaboration to SUBMITTED if in IN_PROGRESS or REVISION_REQUESTED
    if (["IN_PROGRESS", "REVISION_REQUESTED"].includes(deliverable.collaboration.status)) {
      await prisma.collaboration.update({
        where: { id: deliverable.collaborationId },
        data: { status: "SUBMITTED" }
      });
    }

    // Notify brand
    await prisma.notification.create({
      data: {
        userId: deliverable.collaboration.brandProfile.userId,
        title: "Deliverable Submitted for Review",
        message: `Deliverable "${deliverable.title}" submitted by creator for campaign "${deliverable.collaboration.campaign.title}".`,
        type: "DELIVERABLE_SUBMITTED",
        linkUrl: `/collaborations/${deliverable.collaborationId}`
      }
    });

    return updatedDeliverable;
  }

  /**
   * Brand review of a deliverable (Approved or Changes Requested)
   */
  static async reviewDeliverable(
    deliverableId,
    { decision, feedback },
    brandUserId
  ) {
    const upperDecision = String(decision).toUpperCase();
    if (!["APPROVED", "CHANGES_REQUESTED"].includes(upperDecision)) {
      throw new Error("Decision must be either APPROVED or CHANGES_REQUESTED");
    }

    const deliverable = await prisma.collaborationDeliverable.findUnique({
      where: { id: deliverableId },
      include: {
        collaboration: {
          include: {
            creatorProfile: true,
            brandProfile: true,
            campaign: true,
            deliverables: true
          }
        }
      }
    });

    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    if (deliverable.collaboration.brandProfile.userId !== brandUserId) {
      throw new Error("Forbidden: Only the campaign brand owner can review deliverables");
    }

    const updatedDeliverable = await prisma.collaborationDeliverable.update({
      where: { id: deliverableId },
      data: {
        status: upperDecision,
        brandFeedback: feedback || null,
        reviewedAt: new Date()
      }
    });

    // Check if all deliverables in collaboration are approved
    const allDeliverables = await prisma.collaborationDeliverable.findMany({
      where: { collaborationId: deliverable.collaborationId }
    });

    const allApproved =
      allDeliverables.length > 0 &&
      allDeliverables.every((d) => d.status === "APPROVED");

    if (upperDecision === "APPROVED") {
      if (allApproved) {
        await prisma.collaboration.update({
          where: { id: deliverable.collaborationId },
          data: { status: "COMPLETED" }
        });
      } else {
        await prisma.collaboration.update({
          where: { id: deliverable.collaborationId },
          data: { status: "APPROVED" }
        });
      }
    } else {
      await prisma.collaboration.update({
        where: { id: deliverable.collaborationId },
        data: { status: "REVISION_REQUESTED" }
      });
    }

    // Notify creator
    await prisma.notification.create({
      data: {
        userId: deliverable.collaboration.creatorProfile.userId,
        title:
          upperDecision === "APPROVED"
            ? "Deliverable Approved! 🎉"
            : "Revisions Requested on Deliverable",
        message:
          upperDecision === "APPROVED"
            ? `Your deliverable "${deliverable.title}" was approved by the brand.`
            : `Brand requested changes on "${deliverable.title}": ${feedback || "Please review requirements."}`,
        type: "DELIVERABLE_APPROVED",
        linkUrl: `/collaborations/${deliverable.collaborationId}`
      }
    });

    return updatedDeliverable;
  }
}

module.exports = CollaborationService;
