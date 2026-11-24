const express = require("express");
const router = express.Router();
const integrationController = require("../controllers/integration.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// All integration endpoints require authentication and creator/admin role
router.use(authenticate);

router.get("/status", authorize("CREATOR", "ADMIN"), integrationController.getIntegrationStatuses);
router.get("/:platform/auth-url", authorize("CREATOR", "ADMIN"), integrationController.getAuthUrl);
router.post("/:platform/callback", authorize("CREATOR", "ADMIN"), integrationController.handleCallback);
router.post("/:accountId/sync", authorize("CREATOR", "ADMIN"), integrationController.triggerSync);
router.post("/:accountId/disconnect", authorize("CREATOR", "ADMIN"), integrationController.disconnectAccount);
router.post("/connect-mock", authorize("CREATOR", "ADMIN"), integrationController.connectMockAccount);

module.exports = router;
