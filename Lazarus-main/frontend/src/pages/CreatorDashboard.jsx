import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API = "http://localhost:5000";

// 🔽 Fixed niche list (easy matching)
const NICHE_OPTIONS = [
  "tech",
  "ai",
  "finance",
  "fitness",
  "travel",
  "fashion",
  "gaming",
  "education",
  "food",
  "lifestyle"
];

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const creatorId = user.name.toLowerCase().replace(/\s+/g, "_");

  const [selectedNiches, setSelectedNiches] = useState([]);
  const [portfolio, setPortfolio] = useState({
    platform: "youtube",
    url: "",
    followers: "",
    avgViews: ""
  });

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     SAVE CREATOR PROFILE
  ================================ */
  const saveProfile = async () => {
    if (selectedNiches.length === 0) {
      alert("Select at least one niche");
      return;
    }

    try {
      await fetch(`${API}/api/creator/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          name: user.name,
          niches: selectedNiches,
          platform: portfolio.platform,
          url: portfolio.url,
          followers: portfolio.followers,
          avgViews: portfolio.avgViews
        })
      });

      alert("Profile saved ✅");
      fetchMatchedCampaigns();
    } catch {
      alert("Failed to save profile");
    }
  };

  /* ===============================
     FETCH MATCHED CAMPAIGNS
  ================================ */
  const fetchMatchedCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/campaigns/match/${creatorId}`
      );
      const data = await res.json();
      setCampaigns(data);
    } catch {
      alert("Failed to load campaigns");
    }
    setLoading(false);
  };

  /* ===============================
     APPLY TO CAMPAIGN
  ================================ */
  const applyCampaign = async (campaignId) => {
    try {
      await fetch(`${API}/api/campaign/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          creatorId
        })
      });

      alert("Applied successfully 🚀");
    } catch {
      alert("Failed to apply");
    }
  };

  /* ===============================
     LOGOUT
  ================================ */
  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  /* ===============================
     UI
  ================================ */
  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h2>👤 Creator Dashboard</h2>

      <p><strong>Name:</strong> {user?.name}</p>
      <p><strong>Role:</strong> Creator</p>

      <hr />

      {/* ===============================
         PORTFOLIO
      ================================ */}
      <h3>📊 Creator Portfolio</h3>

      <label><strong>Select Niches</strong></label><br />
      {NICHE_OPTIONS.map((niche) => (
        <label key={niche} style={{ marginRight: "12px" }}>
          <input
            type="checkbox"
            value={niche}
            checked={selectedNiches.includes(niche)}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedNiches((prev) =>
                prev.includes(value)
                  ? prev.filter(n => n !== value)
                  : [...prev, value]
              );
            }}
          />{" "}
          {niche}
        </label>
      ))}

      <br /><br />

      <select
        value={portfolio.platform}
        onChange={(e) =>
          setPortfolio({ ...portfolio, platform: e.target.value })
        }
      >
        <option value="youtube">YouTube</option>
        <option value="instagram">Instagram</option>
        <option value="shorts">YouTube Shorts</option>
      </select>

      <br /><br />

      <input
        type="url"
        placeholder="Channel / Profile URL"
        value={portfolio.url}
        onChange={(e) =>
          setPortfolio({ ...portfolio, url: e.target.value })
        }
      />

      <br /><br />

      <input
        type="number"
        placeholder="Followers / Subscribers"
        value={portfolio.followers}
        onChange={(e) =>
          setPortfolio({ ...portfolio, followers: e.target.value })
        }
      />

      <br /><br />

      <input
        type="number"
        placeholder="Average Views"
        value={portfolio.avgViews}
        onChange={(e) =>
          setPortfolio({ ...portfolio, avgViews: e.target.value })
        }
      />

      <br /><br />

      <button onClick={saveProfile}>💾 Save Profile</button>

      <hr />

      {/* ===============================
         MATCHED CAMPAIGNS
      ================================ */}
      <h3>🎯 Brand Campaigns for You</h3>

      {loading && <p>Loading campaigns...</p>}

      {campaigns.length === 0 && !loading && (
        <p>No matching campaigns yet</p>
      )}

      {campaigns.map((c) => (
        <div
          key={c.id}
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "16px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
          }}
        >
          <h4>{c.title}</h4>
          <p>{c.description}</p>
          <p><strong>Brand:</strong> {c.brandName}</p>
          <p><strong>Niches:</strong> {c.niches.join(", ")}</p>
          <p><strong>Budget:</strong> ₹{c.budget}</p>

          <button onClick={() => applyCampaign(c.id)}>
            Apply to Campaign
          </button>
        </div>
      ))}

      <hr />

      <button onClick={() => navigate("/create-project")}>
        ➕ Create Funding Project
      </button>

      <br /><br />

      <button onClick={logout} style={{ color: "red" }}>
        Logout
      </button>
    </div>
  );
}
