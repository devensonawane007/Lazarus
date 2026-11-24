const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Public
router.post("/register", authController.register);
router.post("/login", authController.login);

// Authenticated
router.get("/me", authenticate, authController.getMe);

module.exports = router;
