const express = require("express");
const router = express.Router();
const creatorController = require("../controllers/creator.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Authenticated Creator Endpoints
router.get("/profile", authenticate, authorize("CREATOR", "ADMIN"), creatorController.getProfile);
router.post("/profile", authenticate, authorize("CREATOR", "ADMIN"), creatorController.updateProfile);
router.post("/mou", authenticate, authorize("CREATOR", "ADMIN"), creatorController.signMOU);
router.get("/matched-campaigns", authenticate, authorize("CREATOR", "ADMIN"), creatorController.getMatchedCampaigns);
router.post("/apply-campaign", authenticate, authorize("CREATOR", "ADMIN"), creatorController.applyToCampaign);

// Creator Studio V3 Endpoints
router.get("/analytics", authenticate, authorize("CREATOR", "ADMIN"), creatorController.getUnifiedAnalytics);
router.get("/content", authenticate, authorize("CREATOR", "ADMIN"), creatorController.getContentLibrary);
router.get("/media-kit", authenticate, authorize("CREATOR", "ADMIN"), creatorController.getMediaKit);

// Public / Cross-Role Views
router.get("/profile/:id", creatorController.getPublicProfile);
router.get("/media-kit/:id", creatorController.getPublicMediaKit);

module.exports = router;
