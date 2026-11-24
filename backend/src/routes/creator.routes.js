const express = require("express");
const router = express.Router();
const creatorController = require("../controllers/creator.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Authenticated Creator Endpoints
router.get("/profile", authenticate, authorize("CREATOR"), creatorController.getProfile);
router.post("/profile", authenticate, authorize("CREATOR"), creatorController.updateProfile);
router.post("/mou", authenticate, authorize("CREATOR"), creatorController.signMOU);
router.get("/matched-campaigns", authenticate, authorize("CREATOR"), creatorController.getMatchedCampaigns);
router.post("/apply-campaign", authenticate, authorize("CREATOR"), creatorController.applyToCampaign);

// Public / Cross-Role View
router.get("/profile/:id", creatorController.getPublicProfile);

module.exports = router;
