const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/ideas", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.0-pro"
    });

    const prompt = `
You are an agentic AI for content creators.

Step 1: Understand the niche
Step 2: Generate 3 content ideas
Step 3: Suggest platform and monetization
Step 4: Give next action

Niche: ${query}
`;

    const result = await model.generateContent(prompt);

    res.json({
      output: result.response.text()
    });

  } catch (error) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ error: "AI failed" });
  }
});

module.exports = router;
