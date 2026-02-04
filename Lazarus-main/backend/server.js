const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// node-fetch for Gemini REST API
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

/* ===============================
   IN-MEMORY STORES
================================ */
let projects = {};
let contributions = {};
let payouts = {};

/* ===============================
   TEST
================================ */
app.get("/", (req, res) => {
  res.send("Lazarus backend running 🚀");
});

/* ===============================
   CREATE PROJECT (CREATOR)
================================ */
app.post("/api/projects", (req, res) => {
  const {
    title,
    description,
    video_type,
    funding_target,
    allowed_expenses,
    creator
  } = req.body;

  if (!title || !funding_target) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const project = {
    id: Date.now().toString(),
    title,
    description,
    video_type,
    funding_target: Number(funding_target),
    allowed_expenses,
    status: "funding",
    created_at: new Date(),

    creator: creator || {
      name: "Unknown Creator",
      role: "creator"
    }
  };

  projects[project.id] = project;
  contributions[project.id] = [];

  res.status(201).json(project);
});

/* ===============================
   LIST PROJECTS (INVESTOR)
================================ */
app.get("/api/projects", (req, res) => {
  res.json(Object.values(projects));
});

/* ===============================
   INVEST
================================ */
app.post("/api/contribute", (req, res) => {
  const { project_id, amount } = req.body;

  if (!projects[project_id]) {
    return res.status(404).json({ message: "Project not found" });
  }

  const contribution = {
    amount: Number(amount),
    time: new Date()
  };

  contributions[project_id].push(contribution);

  const totalRaised = contributions[project_id].reduce(
    (sum, c) => sum + c.amount,
    0
  );

  res.json({ totalRaised });
});

/* ===============================
   SIMULATE REVENUE
================================ */
app.post("/api/simulate-revenue", (req, res) => {
  const { project_id, revenue_amount } = req.body;

  const contribs = contributions[project_id];
  if (!contribs || contribs.length === 0) {
    return res.status(400).json({ message: "No contributors" });
  }

  const totalInvested = contribs.reduce((s, c) => s + c.amount, 0);
  const revenue = Number(revenue_amount);

  payouts[project_id] = contribs.map((c, i) => ({
    investor: `Investor ${i + 1}`,
    invested: c.amount,
    payout: Math.round((c.amount / totalInvested) * revenue)
  }));

  res.json({ payouts: payouts[project_id] });
});

/* ===============================
   AI IDEAS (LOW TOKEN)
================================ */
app.post("/api/ai/ideas", async (req, res) => {
  const { query } = req.body;

  const prompt = `
Generate exactly 3 content ideas.

Format:
Idea 1:
Title:
Platform:
Monetization:

Idea 2:
Title:
Platform:
Monetization:

Idea 3:
Title:
Platform:
Monetization:

Niche: ${query}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 500 }
      })
    }
  );

  const data = await response.json();
  res.json({ ai_output: data.candidates[0].content.parts[0].text });
});

/* ===============================
   START SERVER
================================ */
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
