import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { api } from "../services/api";

const NICHE_OPTIONS = [
  "tech", "ai", "finance", "fitness", "travel",
  "fashion", "gaming", "education", "food", "lifestyle"
];

export default function BrandStudio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("campaigns");

  // State
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [creators, setCreators] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters for Discovery
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNiche, setFilterNiche] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");

  // Campaign Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    description: "",
    budget: "",
    deliverables: "",
    minFollowers: "",
    minEngagementRate: "",
    deadline: "",
    niches: [],
    targetPlatforms: []
  });

  useEffect(() => {
    loadBrandData();
  }, []);

  const loadBrandData = async () => {
    setLoading(true);
    try {
      const [campsRes, creatorsRes, collabsRes] = await Promise.allSettled([
        api.brand.getCampaigns(),
        api.brand.discoverCreators(),
        api.collaborations.list()
      ]);

      if (campsRes.status === "fulfilled") setCampaigns(campsRes.value || []);
      if (creatorsRes.status === "fulfilled") setCreators(creatorsRes.value?.creators || []);
      if (collabsRes.status === "fulfilled") setCollaborations(collabsRes.value?.collaborations || []);
    } catch (err) {
      console.error("Brand load error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     CAMPAIGN CREATION
  ================================ */
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!campaignForm.title || !campaignForm.budget) {
      alert("Please provide campaign title and budget.");
      return;
    }

    setActionLoading(true);
    try {
      await api.brand.createCampaign({
        ...campaignForm,
        budget: Number(campaignForm.budget),
        minFollowers: campaignForm.minFollowers ? Number(campaignForm.minFollowers) : 0,
        minEngagementRate: campaignForm.minEngagementRate ? Number(campaignForm.minEngagementRate) : 0
      });

      alert("Campaign brief published successfully 🚀");
      setShowCreateModal(false);
      setCampaignForm({
        title: "",
        description: "",
        budget: "",
        deliverables: "",
        minFollowers: "",
        minEngagementRate: "",
        deadline: "",
        niches: [],
        targetPlatforms: []
      });
      await loadBrandData();
    } catch (err) {
      alert("Failed to create campaign: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  const toggleNiche = (niche) => {
    setCampaignForm((prev) => ({
      ...prev,
      niches: prev.niches.includes(niche)
        ? prev.niches.filter((n) => n !== niche)
        : [...prev.niches, niche]
    }));
  };

  const togglePlatform = (p) => {
    setCampaignForm((prev) => ({
      ...prev,
      targetPlatforms: prev.targetPlatforms.includes(p)
        ? prev.targetPlatforms.filter((item) => item !== p)
        : [...prev.targetPlatforms, p]
    }));
  };

  /* ===============================
     APPLICATIONS REVIEW
  ================================ */
  const handleSelectCampaign = async (camp) => {
    setSelectedCampaign(camp);
    setActionLoading(true);
    try {
      const data = await api.brand.getApplicants(camp.id);
      setApplicants(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecision = async (appId, decision) => {
    if (!selectedCampaign) return;
    setActionLoading(true);
    try {
      const res = await api.brand.updateApplication(selectedCampaign.id, appId, decision);
      alert(`Application updated to ${decision} ✅`);
      const data = await api.brand.getApplicants(selectedCampaign.id);
      setApplicants(data || []);
      await loadBrandData();

      if (decision === "ACCEPTED" && res.collaborationId) {
        navigate(`/collaborations/${res.collaborationId}`);
      }
    } catch (err) {
      alert("Decision failed: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  /* ===============================
     DISCOVERY FILTERING
  ================================ */
  const handleFilterCreators = async () => {
    setActionLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (filterNiche) params.append("niche", filterNiche);
      if (filterPlatform) params.append("platform", filterPlatform);

      const res = await api.brand.discoverCreators(`?${params.toString()}`);
      setCreators(res?.creators || []);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      pageTitle={
        activeTab === "campaigns"
          ? "Brand Campaign Studio"
          : activeTab === "discovery"
          ? "Creator Discovery Catalog"
          : activeTab === "applications"
          ? "Application Management"
          : "Brand Collaborations & Deals"
      }
      subtitle="Manage sponsor briefs, review verified creators, and approve deliverables"
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          Loading Brand Studio data from Neon PostgreSQL...
        </div>
      ) : (
        <div>
          {/* =========================================================
              TAB 1: CAMPAIGNS
          ========================================================== */}
          {activeTab === "campaigns" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
                    Active Brand Campaigns ({campaigns.length})
                  </h2>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                    Campaigns with targeting requirements discoverable by matched creators.
                  </p>
                </div>

                <button onClick={() => setShowCreateModal(true)} style={primaryBtnStyle}>
                  ➕ Create New Campaign Brief
                </button>
              </div>

              {campaigns.length === 0 ? (
                <div style={emptyCardStyle}>
                  <p>No campaigns published yet.</p>
                  <button onClick={() => setShowCreateModal(true)} style={primaryBtnStyle}>
                    Launch Your First Campaign
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {campaigns.map((camp) => (
                    <div key={camp.id} style={cardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="badge badge-green">{camp.status}</span>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>
                              Created {new Date(camp.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", marginTop: "6px" }}>
                            {camp.title}
                          </h3>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span style={statLabelStyle}>BUDGET</span>
                          <div style={{ fontSize: "20px", fontWeight: "800", color: "#10b981" }}>
                            ₹{camp.budget.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: "14px", color: "#cbd5e1", margin: "14px 0", lineHeight: 1.5 }}>
                        {camp.description}
                      </p>

                      <div style={campaignMetaBoxStyle}>
                        <div>
                          <span style={statLabelStyle}>NICHES</span>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                            {camp.niches.map((n) => <span key={n} style={nicheBadgeStyle}>{n}</span>)}
                          </div>
                        </div>
                        <div>
                          <span style={statLabelStyle}>TARGET PLATFORMS</span>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                            {camp.targetPlatforms && camp.targetPlatforms.length > 0 ? (
                              camp.targetPlatforms.map((p) => <span key={p} style={nicheBadgeStyle}>{p}</span>)
                            ) : (
                              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Any</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span style={statLabelStyle}>APPLICANTS</span>
                          <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginTop: "2px" }}>
                            {camp.applicantsCount} Creators
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", gap: "10px" }}>
                        <button
                          onClick={() => {
                            setActiveTab("applications");
                            handleSelectCampaign(camp);
                          }}
                          style={btnOutlineStyle}
                        >
                          Review Applicants ({camp.applicantsCount}) →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 2: CREATOR DISCOVERY
          ========================================================== */}
          {activeTab === "discovery" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
                  Creator Discovery Catalog
                </h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  Search and evaluate verified creators across YouTube, Instagram, and Twitch.
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div style={searchFilterBarStyle}>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by creator name or bio keywords..."
                  style={{ flex: 2 }}
                />

                <select
                  value={filterNiche}
                  onChange={(e) => setFilterNiche(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">All Niches</option>
                  {NICHE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n.toUpperCase()}</option>
                  ))}
                </select>

                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">All Platforms</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TWITCH">Twitch</option>
                </select>

                <button onClick={handleFilterCreators} disabled={actionLoading} style={filterBtnStyle}>
                  🔍 Filter
                </button>
              </div>

              {/* Creators Catalog Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginTop: "24px" }}>
                {creators.map((c) => (
                  <div key={c.creatorId} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={avatarStyle}>{c.name[0]}</div>
                        <div>
                          <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>{c.name}</h4>
                          <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>Verified Creator</span>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: "13px", color: "#94a3b8", margin: "12px 0", minHeight: "38px" }}>
                      {c.bio}
                    </p>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                      {c.niches.map((n) => <span key={n} style={nicheBadgeStyle}>{n}</span>)}
                    </div>

                    <div style={creatorStatsBoxStyle}>
                      <div>
                        <span style={statLabelStyle}>VERIFIED REACH</span>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>
                          {c.verifiedReach}
                        </div>
                      </div>
                      <div>
                        <span style={statLabelStyle}>AVG VIEWS</span>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#38bdf8" }}>
                          {c.avgViews}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                      <a
                        href={`/media-kit/${c.creatorId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={viewMediaKitBtnStyle}
                      >
                        Inspect Verified Media Kit ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 3: APPLICATIONS MANAGEMENT
          ========================================================== */}
          {activeTab === "applications" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
                  Creator Applications
                </h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  Review creator pitches and transition into structured collaborations.
                </p>
              </div>

              {/* Select Campaign Dropdown if not selected */}
              <div style={{ marginBottom: "20px" }}>
                <label style={statLabelStyle}>SELECT ACTIVE CAMPAIGN:</label>
                <select
                  value={selectedCampaign?.id || ""}
                  onChange={(e) => {
                    const c = campaigns.find((x) => x.id === e.target.value);
                    if (c) handleSelectCampaign(c);
                  }}
                  style={{ maxWidth: "400px", display: "block", marginTop: "6px" }}
                >
                  <option value="">-- Choose Campaign to View Applicants --</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.title} ({c.applicantsCount} applicants)</option>
                  ))}
                </select>
              </div>

              {selectedCampaign && (
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                    Applicants for: "{selectedCampaign.title}" ({applicants.length})
                  </h3>

                  {applicants.length === 0 ? (
                    <div style={emptyCardStyle}>
                      <p>No creators have applied to this campaign yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {applicants.map((app) => (
                        <div key={app.applicationId} style={cardStyle}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                            <div>
                              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>
                                {app.name}
                              </h4>
                              <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                                {app.niches.map((n) => <span key={n} style={nicheBadgeStyle}>{n}</span>)}
                              </div>
                            </div>

                            <span className={`badge ${
                              app.status === "ACCEPTED" ? "badge-green" : app.status === "REJECTED" ? "badge-red" : "badge-blue"
                            }`}>
                              {app.status}
                            </span>
                          </div>

                          {/* Creator Pitch */}
                          <div style={pitchBoxStyle}>
                            <strong style={{ color: "#38bdf8", fontSize: "12px" }}>Creator Pitch:</strong>
                            <p style={{ fontSize: "13px", color: "#f8fafc", marginTop: "4px", lineHeight: 1.5 }}>
                              {app.pitch || "No written pitch attached."}
                            </p>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                            <a
                              href={`/media-kit/${app.creatorId}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: "13px", color: "#10b981", fontWeight: "600" }}
                            >
                              Inspect Media Kit ↗
                            </a>

                            <div style={{ display: "flex", gap: "8px" }}>
                              {app.status !== "ACCEPTED" && (
                                <button
                                  onClick={() => handleDecision(app.applicationId, "ACCEPTED")}
                                  disabled={actionLoading}
                                  style={acceptBtnStyle}
                                >
                                  ✅ Accept & Begin Deal
                                </button>
                              )}
                              {app.status !== "SHORTLISTED" && app.status !== "ACCEPTED" && (
                                <button
                                  onClick={() => handleDecision(app.applicationId, "SHORTLISTED")}
                                  disabled={actionLoading}
                                  style={btnOutlineStyle}
                                >
                                  ⭐ Shortlist
                                </button>
                              )}
                              {app.status !== "REJECTED" && (
                                <button
                                  onClick={() => handleDecision(app.applicationId, "REJECTED")}
                                  disabled={actionLoading}
                                  style={rejectBtnStyle}
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 4: COLLABORATIONS
          ========================================================== */}
          {activeTab === "collaborations" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
                  Active Brand Collaborations
                </h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  Review submitted creator deliverables, request revisions, and issue approvals.
                </p>
              </div>

              {collaborations.length === 0 ? (
                <div style={emptyCardStyle}>
                  <p>No active collaborations currently in progress.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {collaborations.map((collab) => (
                    <div key={collab.id} style={cardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
                            CREATOR: {collab.creatorProfile?.user?.name}
                          </span>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", marginTop: "2px" }}>
                            {collab.campaign?.title}
                          </h3>
                        </div>

                        <span className={`badge ${
                          collab.status === "COMPLETED" ? "badge-green" : "badge-blue"
                        }`}>
                          {collab.status.replace("_", " ")}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                        <button
                          onClick={() => navigate(`/collaborations/${collab.id}`)}
                          style={primaryBtnStyle}
                        >
                          Enter Deal Room & Review Deliverables →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          MODAL: CREATE CAMPAIGN BRIEF
      ========================================================== */}
      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc" }}>
                Launch New Brand Campaign Brief
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ color: "#94a3b8", fontSize: "18px" }}>✕</button>
            </div>

            <form onSubmit={handleCreateCampaign} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={statLabelStyle}>CAMPAIGN TITLE</label>
                <input
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  placeholder="e.g. Q4 AI Developer Tool Integration"
                  required
                />
              </div>

              <div>
                <label style={statLabelStyle}>CAMPAIGN DESCRIPTION & BRIEF</label>
                <textarea
                  rows={3}
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  placeholder="Explain your product, target audience, and key talking points..."
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={statLabelStyle}>COMPENSATION BUDGET (INR)</label>
                  <input
                    type="number"
                    value={campaignForm.budget}
                    onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                    placeholder="75000"
                    required
                  />
                </div>
                <div>
                  <label style={statLabelStyle}>MIN VERIFIED FOLLOWERS</label>
                  <input
                    type="number"
                    value={campaignForm.minFollowers}
                    onChange={(e) => setCampaignForm({ ...campaignForm, minFollowers: e.target.value })}
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label style={statLabelStyle}>DELIVERABLES SPECIFICATION</label>
                <input
                  value={campaignForm.deliverables}
                  onChange={(e) => setCampaignForm({ ...campaignForm, deliverables: e.target.value })}
                  placeholder="e.g. 1x Dedicated 10-minute YouTube Review + 1x Short clip"
                  required
                />
              </div>

              <div>
                <label style={statLabelStyle}>TARGET NICHES</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  {NICHE_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleNiche(n)}
                      style={{
                        ...nicheToggleBtnStyle,
                        backgroundColor: campaignForm.niches.includes(n) ? "#10b981" : "var(--bg-input)",
                        color: campaignForm.niches.includes(n) ? "#ffffff" : "#94a3b8"
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={statLabelStyle}>TARGET PLATFORMS</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  {["YOUTUBE", "INSTAGRAM", "TWITCH"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      style={{
                        ...nicheToggleBtnStyle,
                        backgroundColor: campaignForm.targetPlatforms.includes(p) ? "#38bdf8" : "var(--bg-input)",
                        color: campaignForm.targetPlatforms.includes(p) ? "#ffffff" : "#94a3b8"
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={btnSecondaryStyle}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} style={primaryBtnStyle}>
                  {actionLoading ? "Publishing..." : "Publish Campaign Brief 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// Styles
const primaryBtnStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "13px",
  padding: "10px 18px",
  borderRadius: "8px",
  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)"
};

const cardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px"
};

const emptyCardStyle = {
  padding: "40px",
  textAlign: "center",
  color: "#94a3b8",
  backgroundColor: "rgba(10, 17, 34, 0.4)",
  borderRadius: "8px"
};

const statLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "var(--text-dim)",
  letterSpacing: "0.05em"
};

const campaignMetaBoxStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "16px",
  padding: "12px 16px",
  backgroundColor: "rgba(10, 17, 34, 0.5)",
  borderRadius: "8px"
};

const nicheBadgeStyle = {
  fontSize: "11px",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  color: "#cbd5e1",
  padding: "2px 8px",
  borderRadius: "4px"
};

const btnOutlineStyle = {
  border: "1px solid var(--border-subtle)",
  color: "#cbd5e1",
  fontSize: "13px",
  fontWeight: "600",
  padding: "8px 14px",
  borderRadius: "6px"
};

const searchFilterBarStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  padding: "16px",
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)"
};

const filterBtnStyle = {
  background: "#10b981",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "10px 18px",
  borderRadius: "6px"
};

const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  fontWeight: "700",
  color: "#10b981"
};

const creatorStatsBoxStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "8px",
  padding: "10px",
  backgroundColor: "rgba(10, 17, 34, 0.5)",
  borderRadius: "6px"
};

const viewMediaKitBtnStyle = {
  fontSize: "12px",
  color: "#10b981",
  fontWeight: "600"
};

const pitchBoxStyle = {
  marginTop: "12px",
  padding: "12px",
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "8px"
};

const acceptBtnStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "600",
  padding: "8px 14px",
  borderRadius: "6px"
};

const rejectBtnStyle = {
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "#ef4444",
  fontSize: "12px",
  fontWeight: "600",
  padding: "8px 14px",
  borderRadius: "6px"
};

const nicheToggleBtnStyle = {
  padding: "6px 12px",
  borderRadius: "var(--radius-full)",
  fontSize: "12px",
  fontWeight: "600",
  border: "1px solid var(--border-subtle)"
};

const btnSecondaryStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  color: "#f8fafc",
  fontSize: "13px",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "6px"
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1200,
  padding: "20px"
};

const modalBoxStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  width: "100%",
  maxWidth: "600px",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: "28px"
};
