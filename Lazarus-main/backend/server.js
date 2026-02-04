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
   IN-MEMORY STORES (HACKATHON)
================================ */
let creators = {};        // creator profiles
let projects = {};        // creator projects
let contributions = {};  // investor contributions
let payouts = {};        // revenue payouts
let campaigns = {};      // brand campaigns

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("Lazarus backend running 🚀");
});

/* ===============================
   CREATOR PROFILE
================================ */

/**
 * CREATE / UPDATE CREATOR PROFILE
 */
app.post("/api/creator/profile", (req, res) => {
  const {
    creatorId,
    name,
    niches,       // array ["tech","ai"]
    platform,
    url,
    followers,
    avgViews
  } = req.body;

  if (!creatorId || !name || !niches || niches.length === 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  creators[creatorId] = {
    id: creatorId,
    name,
    niches,
    portfolio: {
      platform,
      url,
      followers,
      avgViews
    },
    createdAt: new Date()
  };

  res.json({
    message: "Creator profile saved",
    creator: creators[creatorId]
  });
});

/**
 * GET CREATOR PROFILE (BRAND VIEW)
 */
app.get("/api/creator/profile/:id", (req, res) => {
  const creator = creators[req.params.id];

  if (!creator) {
    return res.status(404).json({ message: "Creator not found" });
  }

  res.json(creator);
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
    creatorId
  } = req.body;

  if (!title || !funding_target || !creatorId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const creator = creators[creatorId];

  const project = {
    id: Date.now().toString(),
    title,
    description: description || "",
    video_type: video_type || "general",
    funding_target: Number(funding_target),
    allowed_expenses: allowed_expenses || [],
    status: "funding",
    created_at: new Date(),
    creator: creator || { id: creatorId, name: "Unknown", niches: [] }
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
   INVESTOR: CONTRIBUTE
================================ */
app.post("/api/contribute", (req, res) => {
  const { project_id, amount } = req.body;

  if (!projects[project_id]) {
    return res.status(404).json({ message: "Project not found" });
  }

  contributions[project_id].push({
    amount: Number(amount),
    time: new Date()
  });

  const totalRaised = contributions[project_id].reduce(
    (sum, c) => sum + c.amount,
    0
  );

  res.json({ totalRaised });
});

/* ===============================
   SIMULATE REVENUE (INVESTOR)
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
   BRAND CAMPAIGNS
================================ */

/**
 * CREATE BRAND CAMPAIGN
 */
app.post("/api/brand/campaign", (req, res) => {
  const {
    brandName,
    title,
    description,
    niches,        // array ["tech","ai"]
    budget,
    deliverables
  } = req.body;

  if (!brandName || !title || !niches || niches.length === 0) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const campaign = {
    id: Date.now().toString(),
    brandName,
    title,
    description,
    niches,
    budget,
    deliverables,
    createdAt: new Date(),
    applicants: []   // creators who apply
  };

  campaigns[campaign.id] = campaign;

  res.status(201).json(campaign);
});

/* ===============================
   MATCH CAMPAIGNS FOR CREATOR
================================ */
app.get("/api/campaigns/match/:creatorId", (req, res) => {
  const creator = creators[req.params.creatorId];

  if (!creator) {
    return res.json([]);
  }

  const matched = Object.values(campaigns).filter((campaign) =>
    campaign.niches.some((niche) =>
      creator.niches.includes(niche)
    )
  );

  res.json(matched);
});

/**
 * CREATOR APPLIES TO CAMPAIGN
 */
app.post("/api/campaign/apply", (req, res) => {
  const { campaignId, creatorId } = req.body;

  const campaign = campaigns[campaignId];
  const creator = creators[creatorId];

  if (!campaign || !creator) {
    return res.status(404).json({ message: "Campaign or Creator not found" });
  }

  const alreadyApplied = campaign.applicants.find(
    a => a.creatorId === creatorId
  );

  if (alreadyApplied) {
    return res.status(400).json({ message: "Already applied" });
  }

  campaign.applicants.push({
    creatorId,
    name: creator.name,
    niches: creator.niches,
    portfolio: creator.portfolio,
    appliedAt: new Date()
  });

  res.json({ message: "Applied successfully" });
});

/**
 * BRAND VIEWS APPLICANTS
 */
app.get("/api/brand/campaign/:id/applicants", (req, res) => {
  const campaign = campaigns[req.params.id];

  if (!campaign) {
    return res.status(404).json({ message: "Campaign not found" });
  }

  res.json(campaign.applicants);
});

/* ===============================
   🤖 AI IDEAS (LOW TOKEN MODE)
================================ */
app.post("/api/ai/ideas", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query required" });
    }

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
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (!data.candidates) {
      return res.status(500).json({ message: "AI returned no output" });
    }

    res.json({
      ai_output: data.candidates[0].content.parts[0].text
    });

  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ message: "AI generation failed" });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
