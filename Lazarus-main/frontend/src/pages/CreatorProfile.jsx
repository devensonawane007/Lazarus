import { getCreatorAnalytics } from "../utils/creatorAnalytics";
import AgenticAIMOU from "../components/AgenticAIMOU";
import { generateAIInsight } from "../utils/aiTextGenerator";


export default function CreatorProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const portfolio = JSON.parse(localStorage.getItem("creatorPortfolio"));
  const analytics = getCreatorAnalytics();

  // Simple AI-ready credibility score
  const credibilityScore =
    analytics.totalProjects * 10 +
    analytics.activeBackers +
    Math.min((portfolio?.views || 0) / 10000, 30);
    const videos = [
  { views: 12000 },
  { views: 18000 },
  { views: 9500 },
  { views: 22000 },
];
const aiInsight = generateAIInsight(videos);


  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h2>Creator Public Profile</h2>

      <p>
        <strong>Name:</strong> {user?.name}
      </p>

      <hr />

      {/* =====================
          Portfolio
      ====================== */}
      <h3>Portfolio</h3>
      <p>
        <strong>Platform:</strong> {portfolio?.platform}
      </p>
      <p>
        <strong>Views:</strong> {portfolio?.views}
      </p>

      {portfolio?.url && (
        <a href={portfolio.url} target="_blank" rel="noreferrer">
          View Content
        </a>
      )}

      <hr />

      {/* =====================
          Creator Analytics
      ====================== */}
      <h3>Creator Analytics</h3>
      <p>Total Projects: {analytics.totalProjects}</p>
      <p>Funding Raised: ₹{analytics.fundingRaised}</p>
      <p>Active Backers: {analytics.activeBackers}</p>

      <hr />

      {/* =====================
          Credibility Score
      ====================== */}
      <h3>Credibility Score</h3>
      <h1>{Math.round(credibilityScore)}</h1>
      <p>(AI-assisted trust indicator)</p>

      <hr />

      {/* =====================
          Agentic AI + MOU
      ====================== */}
      <AgenticAIMOU />
      <hr />

<h3>🧠 Agentic AI Insight</h3>

<pre
  style={{
    whiteSpace: "pre-wrap",
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.6",
  }}
>
  {aiInsight}
</pre>

    </div>
  );
}
