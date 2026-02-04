const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// node-fetch for REST API
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("Lazarus backend running 🚀");
});

/* ===============================
   🤖 AGENTIC AI (LOW TOKEN MODE)
================================ */
app.post("/api/ai/ideas", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query required" });
    }

    // 🔒 STRICT PROMPT (LOW TOKEN)
    const prompt = `
You are an AI assistant for content creators.

TASK:
Generate exactly 3 content ideas.

RULES:
- Keep response under 200 words
- No tables
- No markdown
- No explanations
- Use short bullet points only

OUTPUT FORMAT:
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

Creator niche: ${query}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 600,   // 🔥 TOKEN CONTROL
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (!data.candidates) {
      console.error("Gemini raw response:", data);
      return res.status(500).json({ message: "AI returned no output" });
    }

    const aiText = data.candidates[0].content.parts[0].text;

    console.log("AI OUTPUT:", aiText); // optional log

    res.json({
      ai_output: aiText
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
