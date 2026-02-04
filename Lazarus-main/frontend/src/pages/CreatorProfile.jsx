import { getCreatorAnalytics } from "../utils/creatorAnalytics";

export default function CreatorProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const portfolio = JSON.parse(localStorage.getItem("creatorPortfolio"));
  const analytics = getCreatorAnalytics();

  // Simple AI-ready credibility score
  const credibilityScore =
    analytics.totalProjects * 10 +
    analytics.activeBackers +
    Math.min(portfolio?.views / 10000 || 0, 30);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h2>Creator Public Profile</h2>

      <p><strong>Name:</strong> {user?.name}</p>

      <hr />

      <h3>Portfolio</h3>
      <p><strong>Platform:</strong> {portfolio?.platform}</p>
      <p><strong>Views:</strong> {portfolio?.views}</p>

      <a href={portfolio?.url} target="_blank">
        View Content
      </a>

      <hr />

      <h3>Creator Analytics</h3>
      <p>Total Projects: {analytics.totalProjects}</p>
      <p>Funding Raised: ₹{analytics.fundingRaised}</p>
      <p>Active Backers: {analytics.activeBackers}</p>

      <hr />

      <h3>Credibility Score</h3>
      <h1>{Math.round(credibilityScore)}</h1>
      <p>(AI-assisted trust indicator)</p>
    </div>
  );
}
