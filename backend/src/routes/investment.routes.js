const express = require("express");
const router = express.Router();
const investmentController = require("../controllers/investment.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Investor contribute (Held in Escrow)
router.post("/contribute", authenticate, authorize("INVESTOR"), investmentController.contribute);

// Investor dashboard real metrics
router.get("/dashboard", authenticate, authorize("INVESTOR"), investmentController.getInvestorDashboard);

// Simulate revenue payout distribution
router.post("/simulate-revenue", authenticate, investmentController.simulateRevenue);

module.exports = router;
