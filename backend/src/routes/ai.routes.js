const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Generate AI ideas (Authenticated or open with rate limits)
router.post("/ideas", aiController.generateIdeas);

module.exports = router;
