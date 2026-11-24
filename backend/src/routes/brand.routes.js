const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brand.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Create campaign
router.post("/campaign", authenticate, authorize("BRAND"), brandController.createCampaign);

// List campaigns (Fixes missing GET /api/brand/campaigns)
router.get("/campaigns", authenticate, brandController.getCampaigns);

// View applicants
router.get("/campaign/:id/applicants", authenticate, authorize("BRAND"), brandController.getApplicants);

// Accept / Reject applicant
router.patch("/campaign/:id/applications/:appId", authenticate, authorize("BRAND"), brandController.updateApplicationStatus);

module.exports = router;
