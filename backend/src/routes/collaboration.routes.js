const express = require("express");
const router = express.Router();
const collaborationController = require("../controllers/collaboration.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);

router.get("/", collaborationController.getCollaborations);
router.get("/:id", collaborationController.getCollaborationById);
router.post("/:id/transition", collaborationController.transitionCollaborationStatus);
router.post("/:id/deliverables", collaborationController.addDeliverable);
router.post("/deliverables/:deliverableId/submit", collaborationController.submitDeliverable);
router.post("/deliverables/:deliverableId/review", collaborationController.reviewDeliverable);

module.exports = router;
