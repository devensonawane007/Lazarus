const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brand.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Create campaign
router.post("/campaign", authenticate, authorize("BRAND", "ADMIN"), brandController.createCampaign);

// List campaigns
router.get("/campaigns", authenticate, brandController.getCampaigns);

// Creator Discovery Catalog
router.get("/creators", authenticate, authorize("BRAND", "ADMIN"), brandController.discoverCreators);

// View applicants
router.get("/campaign/:id/applicants", authenticate, authorize("BRAND", "ADMIN"), brandController.getApplicants);

// Accept / Reject / Shortlist applicant
router.patch("/campaign/:id/applications/:appId", authenticate, authorize("BRAND", "ADMIN"), brandController.updateApplicationStatus);

module.exports = router;
