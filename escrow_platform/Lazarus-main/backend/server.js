const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// TEST route
app.get("/", (req, res) => {
  res.send("Lazarus backend running");
});

// CREATE PROJECT API
app.post("/api/projects", (req, res) => {
  const { title, description, video_type, funding_target, allowed_expenses } = req.body;

  if (!title || !funding_target) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // For hackathon demo (DB later)
  const project = {
    id: Date.now(),
    title,
    description,
    video_type,
    funding_target,
    allowed_expenses,
    status: "funding"
  };

  console.log("Project created:", project);

  res.status(201).json(project);
});
let contributions = {}; // in-memory store (hackathon shortcut)

// CONTRIBUTE TO PROJECT
app.post("/api/contribute", (req, res) => {
  const { project_id, amount } = req.body;

  if (!project_id || !amount) {
    return res.status(400).json({ message: "Missing data" });
  }

  if (!contributions[project_id]) {
    contributions[project_id] = [];
  }

  contributions[project_id].push({
    amount: Number(amount)
  });

  const totalRaised = contributions[project_id].reduce(
    (sum, c) => sum + c.amount,
    0
  );

  res.json({
    message: "Contribution successful",
    totalRaised
  });
});

// In-memory stores (hackathon shortcut)
let revenues = {};
let payouts = {};

// SIMULATE REVENUE + AUTO PAYOUT
app.post("/api/simulate-revenue", (req, res) => {
  const { project_id, revenue_amount } = req.body;

  if (!project_id || !revenue_amount) {
    return res.status(400).json({ message: "Missing data" });
  }

  const projectContributions = contributions[project_id];

  if (!projectContributions || projectContributions.length === 0) {
    return res.status(400).json({ message: "No contributors found" });
  }

  const totalInvested = projectContributions.reduce(
    (sum, c) => sum + c.amount,
    0
  );

  // Calculate payouts
  payouts[project_id] = projectContributions.map((c, index) => {
    return {
      contributor: `Contributor ${index + 1}`,
      invested: c.amount,
      payout: Math.round((c.amount / totalInvested) * revenue_amount)
    };
  });

  revenues[project_id] = revenue_amount;

  res.json({
    message: "Revenue distributed automatically",
    totalRevenue: revenue_amount,
    payouts: payouts[project_id]
  });
});

// START SERVER
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
