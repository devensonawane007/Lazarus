const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Create Project (Creator only)
router.post("/", authenticate, authorize("CREATOR"), projectController.createProject);

// List Projects (Public or authenticated)
router.get("/", projectController.getProjects);

// Get Project Details
router.get("/:id", projectController.getProjectById);

module.exports = router;
