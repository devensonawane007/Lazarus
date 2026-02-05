import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function BrandDashboard() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     LOAD BRAND CAMPAIGNS
  ================================ */
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API}/api/brand/campaigns`);
      const data = await res.json();
      setCampaigns(data);
    } catch {
      alert("Failed to load campaigns");
    }
  };

  /* ===============================
     VIEW APPLIED CREATORS
  ================================ */
  const viewApplicants = async (campaign) => {
    setSelectedCampaign(campaign);
    setLoading(true);

    try {
      const res = await fetch(
        `${API}/api/brand/campaign/${campaign.id}/applicants`
      );
      const data = await res.json();
      setApplicants(data);
    } catch {
      alert("Failed to load applicants");
    }

    setLoading(false);
  };

  /* ===============================
     UI
  ================================ */
  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "auto" }}>
      <h1>🏷 Brand Dashboard</h1>
      <p>View campaigns & creators who applied</p>

      <button
        onClick={() => navigate("/brand/campaign")}
        style={primaryBtn}
      >
        ➕ Create New Campaign
      </button>

      <hr />

      {/* CAMPAIGNS */}
      <h2>📢 Your Campaigns</h2>

      {campaigns.length === 0 && <p>No campaigns yet</p>}

      {campaigns.map((c) => (
        <div key={c.id} style={card}>
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <p><strong>Niches:</strong> {c.niches.join(", ")}</p>
          <p><strong>Budget:</strong> ₹{c.budget}</p>

          <button onClick={() => viewApplicants(c)}>
            👥 View Applied Creators
          </button>
        </div>
      ))}

      {/* APPLICANTS */}
      {selectedCampaign && (
        <>
          <hr />
          <h2>👤 Applicants for “{selectedCampaign.title}”</h2>

          {loading && <p>Loading applicants...</p>}

          {applicants.length === 0 && !loading && (
            <p>No creators have applied yet</p>
          )}

          {applicants.map((creator) => (
            <div key={creator.creatorId} style={creatorCard}>
              <h4>{creator.name}</h4>
              <p><strong>Niches:</strong> {creator.niches.join(", ")}</p>
              <p><strong>Platform:</strong> {creator.portfolio.platform}</p>
              <p><strong>Followers:</strong> {creator.portfolio.followers}</p>

              <a
                href={creator.portfolio.url}
                target="_blank"
                rel="noreferrer"
              >
                🔗 View Portfolio
              </a>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ===============================
   STYLES
================================ */
const primaryBtn = {
  padding: "12px 18px",
  borderRadius: "14px",
  border: "none",
  background: "#0071e3",
  color: "#fff",
  fontSize: "15px",
  cursor: "pointer",
  marginBottom: "20px"
};

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "16px",
  marginBottom: "16px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
};

const creatorCard = {
  background: "#f5f5f7",
  padding: "16px",
  borderRadius: "14px",
  marginBottom: "12px"
};
