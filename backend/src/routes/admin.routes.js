const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Privacy endpoints accessible by any authenticated user for their own account
router.get("/privacy/export", authenticate, adminController.exportUserData);
router.delete("/privacy/delete-account", authenticate, adminController.deleteUserAccount);

// Operations endpoints strictly restricted to ADMIN role
router.get("/health", authenticate, authorize("ADMIN"), adminController.getPlatformHealth);
router.get("/users", authenticate, authorize("ADMIN"), adminController.listUsers);
router.patch("/brands/:brandId/verification", authenticate, authorize("ADMIN"), adminController.toggleBrandVerification);
router.get("/audit-logs", authenticate, authorize("ADMIN"), adminController.getAuditLogs);

module.exports = router;
