const express = require("express");
const router = express.Router();
const escrowController = require("../controllers/escrow.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Creator submits deliverable
router.post("/milestones/:id/submit", authenticate, authorize("CREATOR"), escrowController.submitMilestoneDeliverable);

// Investor approves deliverable -> releases funds
router.post("/milestones/:id/approve", authenticate, authorize("INVESTOR"), escrowController.approveMilestone);

// Investor rejects deliverable
router.post("/milestones/:id/reject", authenticate, authorize("INVESTOR"), escrowController.rejectMilestone);

// Escrow transaction history
router.get("/projects/:id/transactions", authenticate, escrowController.getProjectEscrowLedger);

module.exports = router;
