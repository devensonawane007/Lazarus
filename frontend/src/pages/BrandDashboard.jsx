import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function BrandDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await api.brand.getCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewApplicants = async (campaign) => {
    setSelectedCampaign(campaign);
    setLoading(true);

    try {
      const data = await api.brand.getApplicants(campaign.id);
      setApplicants(data || []);
    } catch (err) {
      console.error("Failed to load applicants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationDecision = async (applicationId, status) => {
    if (!selectedCampaign) return;
    setActionLoading(true);

    try {
      await api.brand.updateApplication(selectedCampaign.id, applicationId, status);
      // Refresh applicants list
      const data = await api.brand.getApplicants(selectedCampaign.id);
      setApplicants(data || []);
    } catch (err) {
      alert(err.message || "Failed to update application");
    } finally {
      setActionLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1000px", margin: "auto", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid #e5e7eb", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827", margin: 0 }}>
            🏢 Brand Dashboard
          </h1>
          <p style={{ color: "#6b7280", margin: "4px 0 0 0" }}>
            Welcome, <strong>{user?.name || "Brand Partner"}</strong>. Manage sponsor campaigns & creator partnerships.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => navigate("/brand/campaign")} style={primaryBtn}>
            ➕ Launch Campaign
          </button>
          <button onClick={logout} style={logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Campaigns Section */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "16px" }}>
          📢 Active Campaigns ({campaigns.length})
        </h2>

        {loading && !selectedCampaign && <p style={{ color: "#6b7280" }}>Loading campaigns from PostgreSQL...</p>}

        {campaigns.length === 0 && !loading && (
          <div style={emptyCard}>
            <p style={{ margin: "0 0 12px 0", color: "#6b7280" }}>No active brand campaigns created yet.</p>
            <button onClick={() => navigate("/brand/campaign")} style={primaryBtn}>
              Create Your First Campaign
            </button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {campaigns.map((c) => (
            <div key={c.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#111827" }}>{c.title}</h3>
                <span style={budgetBadge}>₹{Number(c.budget).toLocaleString()}</span>
              </div>
              <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.4", minHeight: "40px" }}>
                {c.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "12px 0" }}>
                {c.niches?.map((niche, idx) => (
                  <span key={idx} style={tagStyle}>#{niche}</span>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  👥 {c.applicantsCount || 0} applied
                </span>
                <button onClick={() => viewApplicants(c)} style={viewBtn}>
                  Review Applicants →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applicants Section */}
      {selectedCampaign && (
        <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>
              👤 Creator Applications for “{selectedCampaign.title}”
            </h2>
            <button onClick={() => setSelectedCampaign(null)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "14px" }}>
              ✕ Close
            </button>
          </div>

          {loading && <p style={{ color: "#6b7280" }}>Loading applicants...</p>}

          {applicants.length === 0 && !loading && (
            <div style={emptyCard}>
              <p style={{ color: "#6b7280", margin: 0 }}>No creators have applied to this campaign yet.</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {applicants.map((creator) => (
              <div key={creator.applicationId || creator.creatorId} style={creatorCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "17px", color: "#111827" }}>
                      {creator.name}
                    </h4>
                    <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#4b5563" }}>
                      Platform: <strong>{creator.portfolio?.platform || "YouTube"}</strong> | Followers: <strong>{creator.portfolio?.followers || "N/A"}</strong> | Avg Views: <strong>{creator.portfolio?.avgViews || "N/A"}</strong>
                    </p>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {creator.niches?.map((n, i) => (
                        <span key={i} style={tagStyle}>#{n}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: creator.status === "ACCEPTED" ? "#d1fae5" : creator.status === "REJECTED" ? "#fee2e2" : "#fef3c7",
                      color: creator.status === "ACCEPTED" ? "#065f46" : creator.status === "REJECTED" ? "#991b1b" : "#92400e"
                    }}>
                      {creator.status || "APPLIED"}
                    </span>

                    {creator.portfolio?.url && (
                      <div style={{ marginTop: "8px" }}>
                        <a
                          href={creator.portfolio.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: "13px", color: "#0071e3", textDecoration: "none", fontWeight: "500" }}
                        >
                          🔗 View Portfolio
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {creator.status === "APPLIED" && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "14px", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
                    <button
                      onClick={() => handleApplicationDecision(creator.applicationId, "ACCEPTED")}
                      disabled={actionLoading}
                      style={acceptBtn}
                    >
                      ✓ Accept Creator
                    </button>
                    <button
                      onClick={() => handleApplicationDecision(creator.applicationId, "REJECTED")}
                      disabled={actionLoading}
                      style={rejectBtn}
                    >
                      ✕ Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const primaryBtn = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#059669",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer"
};

const logoutBtn = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer"
};

const card = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
};

const emptyCard = {
  background: "#f9fafb",
  padding: "36px",
  borderRadius: "14px",
  border: "1px dashed #d1d5db",
  textAlign: "center"
};

const creatorCard = {
  background: "#ffffff",
  padding: "18px 20px",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
};

const budgetBadge = {
  backgroundColor: "#ecfdf5",
  color: "#059669",
  fontSize: "13px",
  fontWeight: "700",
  padding: "4px 8px",
  borderRadius: "6px"
};

const tagStyle = {
  backgroundColor: "#f3f4f6",
  color: "#4b5563",
  fontSize: "11px",
  padding: "2px 8px",
  borderRadius: "4px"
};

const viewBtn = {
  background: "none",
  border: "none",
  color: "#059669",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer"
};

const acceptBtn = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#059669",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer"
};

const rejectBtn = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "13px",
  fontWeight: "500",
  cursor: "pointer"
};
