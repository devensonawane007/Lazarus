const express = require("express");
const router = express.Router();
const integrationController = require("../controllers/integration.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// 1. Public OAuth GET callback endpoint for external provider browser redirects (secured by signed HMAC state)
router.get("/:platform/callback", integrationController.handleGetCallback);

// 2. All subsequent integration endpoints require authenticated user with creator/admin role
router.use(authenticate);

router.get("/status", authorize("CREATOR", "ADMIN"), integrationController.getIntegrationStatuses);
router.get("/:platform/auth-url", authorize("CREATOR", "ADMIN"), integrationController.getAuthUrl);
router.post("/:platform/callback", authorize("CREATOR", "ADMIN"), integrationController.handleCallback);
router.post("/:accountId/sync", authorize("CREATOR", "ADMIN"), integrationController.triggerSync);
router.post("/:accountId/disconnect", authorize("CREATOR", "ADMIN"), integrationController.disconnectAccount);
router.post("/connect-mock", authorize("CREATOR", "ADMIN"), integrationController.connectMockAccount);

module.exports = router;
