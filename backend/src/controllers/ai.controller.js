const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generate creator content ideas and monetization strategy using Gemini
 */
const generateIdeas = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Niche query is required"
      });
    }

    const niche = query.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no real API key is configured
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return res.json({
        success: true,
        ai_output: `💡 AI Content & Monetization Strategy for [${niche}]:

Idea 1:
Title: "Zero to Hero in ${niche}: 30-Day Masterclass Series"
Platform: YouTube (Long-form) & TikTok/Reels (Shorts)
Monetization: Brand Sponsorships, Digital Guidebook, Escrow Funded Production

Idea 2:
Title: "${niche} Revealed: 5 Costly Mistakes Everyone Makes"
Platform: Instagram Reels & LinkedIn Thought Leadership
Monetization: Affiliate Partnerships & 1-on-1 Consultations

Idea 3:
Title: "Building a Modern ${niche} Workflow in 2026"
Platform: YouTube In-Depth Breakdown
Monetization: Escrow Community Crowdfunding & Software Sponsorships

Next Action:
Use the button below to turn one of these ideas into an Escrow-Backed Creator Project on Lazarus!`,
        source: "mock_fallback"
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are an expert Creator Economy co-pilot for Lazarus.
Given the creator niche: "${niche}", generate exactly 3 highly actionable, viral, and monetizable content concepts.

Format the output strictly as:

Idea 1:
Title: [Catchy Video Title]
Platform: [Primary Platform e.g. YouTube, TikTok, Instagram]
Monetization: [Direct brand sponsorship, community funding, affiliate]

Idea 2:
Title: [Catchy Video Title]
Platform: [Platform]
Monetization: [Strategy]

Idea 3:
Title: [Catchy Video Title]
Platform: [Platform]
Monetization: [Strategy]

Next Action:
[1 sentence guiding the creator to launch this as a Lazarus funded project]
`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    res.json({
      success: true,
      ai_output: output,
      source: "gemini"
    });
  } catch (error) {
    console.error("Gemini AI generation error:", error.message);
    res.status(500).json({
      success: false,
      message: "AI generation service temporarily unavailable",
      error: error.message
    });
  }
};

module.exports = {
  generateIdeas
};
