const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const creatorRoutes = require("./routes/creator.routes");
const brandRoutes = require("./routes/brand.routes");
const projectRoutes = require("./routes/project.routes");
const investmentRoutes = require("./routes/investment.routes");
const escrowRoutes = require("./routes/escrow.routes");
const aiRoutes = require("./routes/ai.routes");

// Controllers for backward compatibility mappings
const creatorController = require("./controllers/creator.controller");
const brandController = require("./controllers/brand.controller");
const investmentController = require("./controllers/investment.controller");
const { authenticate } = require("./middleware/auth.middleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: "10mb" })); // Support base64 MOU signatures

// Health Check
app.get("/", (req, res) => {
  res.json({
    name: "Lazarus V2 Backend",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Primary Modular API Routes
app.use("/api/auth", authRoutes);
app.use("/api/creator", creatorRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/ai", aiRoutes);

// -------------------------------------------------------------
// Backward Compatibility Route Aliases (For Legacy Frontend Calls)
// -------------------------------------------------------------
app.post("/api/contribute", authenticate, investmentController.contribute);
app.post("/api/simulate-revenue", authenticate, investmentController.simulateRevenue);
app.get("/api/campaigns/match/:creatorId", creatorController.getMatchedCampaigns);
app.post("/api/campaign/apply", authenticate, creatorController.applyToCampaign);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Lazarus V2 backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
