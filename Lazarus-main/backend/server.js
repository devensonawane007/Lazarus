const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   In-memory stores (hackathon)
================================ */
let projects = {};
let contributions = {};
let revenues = {};
let payouts = {};

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("Lazarus backend running 🚀");
});

/* ===============================
   CREATOR: CREATE PROJECT
================================ */
app.post("/api/projects", (req, res) => {
  const {
    title,
    description,
    video_type,
    funding_target,
    allowed_expenses
  } = req.body;

  if (!title || !funding_target) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const project = {
    id: Date.now().toString(),
    title,
    description: description || "",
    video_type: video_type || "general",
    funding_target: Number(funding_target),
    allowed_expenses: allowed_expenses || [],
    status: "funding",
    created_at: new Date()
  };

  projects[project.id] = project;
  contributions[project.id] = [];

  console.log("Project created:", project);

  res.status(201).json(project);
});

/* ===============================
   PUBLIC: LIST PROJECTS
================================ */
app.get("/api/projects", (req, res) => {
  res.json(Object.values(projects));
});

/* ===============================
   INVESTOR: CONTRIBUTE
================================ */
app.post("/api/contribute", (req, res) => {
  const { project_id, amount } = req.body;

  if (!project_id || !amount) {
    return res.status(400).json({ message: "Missing data" });
  }

  if (!projects[project_id]) {
    return res.status(404).json({ message: "Project not found" });
  }

  const contribution = {
    amount: Number(amount),
    contributed_at: new Date()
  };

  contributions[project_id].push(contribution);

  const totalRaised = contributions[project_id].reduce(
    (sum, c) => sum + c.amount,
    0
  );

  res.json({
    message: "Contribution successful",
    totalRaised
  });
});

/* ===============================
   SIMULATE REVENUE + AUTO PAYOUT
================================ */
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

  const revenue = Number(revenue_amount);

  payouts[project_id] = projectContributions.map((c, index) => ({
    contributor: `Investor ${index + 1}`,
    invested: c.amount,
    payout: Math.round((c.amount / totalInvested) * revenue)
  }));

  revenues[project_id] = revenue;

  res.json({
    message: "Revenue distributed automatically",
    totalRevenue: revenue,
    payouts: payouts[project_id]
  });
});

/* ===============================
   VIEW PAYOUTS (OPTIONAL)
================================ */
app.get("/api/payouts/:project_id", (req, res) => {
  const { project_id } = req.params;
  res.json(payouts[project_id] || []);
});

/* ===============================
   START SERVER
================================ */
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
