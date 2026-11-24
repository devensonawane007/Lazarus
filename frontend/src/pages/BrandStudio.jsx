import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { api } from "../services/api";
import {
  Plus,
  Megaphone,
  Search,
  Inbox,
  Handshake,
  ArrowRight,
  ExternalLink,
  X,
  Filter,
  Check,
  CheckCircle2,
  XCircle,
  Building2,
  Sparkles,
  Users,
  Eye,
  Zap,
  Calendar,
  Layers
} from "lucide-react";

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

      alert("Campaign brief published successfully.");
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
      alert(`Application updated to ${decision}.`);
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
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "var(--brand-light)",
            color: "var(--brand-primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px"
          }}>
            <Megaphone size={24} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
            Loading Brand Studio data from Neon PostgreSQL...
          </p>
        </div>
      ) : (
        <div>
          {/* =========================================================
              TAB 1: CAMPAIGNS
          ========================================================== */}
          {activeTab === "campaigns" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                    Active Brand Campaigns ({campaigns.length})
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Campaigns with targeting requirements discoverable by matched creators.
                  </p>
                </div>

                <button onClick={() => setShowCreateModal(true)} style={primaryBtnStyle}>
                  <Plus size={16} /> Create New Campaign Brief
                </button>
              </div>

              {campaigns.length === 0 ? (
                <div style={emptyCardStyle}>
                  <Megaphone size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No campaigns published yet.</p>
                  <button onClick={() => setShowCreateModal(true)} style={{ ...primaryBtnStyle, marginTop: "12px" }}>
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
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                              Created {new Date(camp.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: "6px 0 0" }}>
                            {camp.title}
                          </h3>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <span style={statLabelStyle}>BUDGET</span>
                          <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--brand-primary)" }}>
                            ₹{camp.budget.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "14px 0", lineHeight: 1.5 }}>
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
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Any</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span style={statLabelStyle}>APPLICANTS</span>
                          <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px" }}>
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
                          Review Applicants ({camp.applicantsCount}) <ArrowRight size={14} />
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
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  Creator Discovery Catalog
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Explore verified creators with certified audience reach and authentic engagement rates.
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div style={searchFilterBarStyle}>
                <input
                  type="text"
                  placeholder="Search creators by name or bio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 2, minWidth: "220px", padding: "10px 14px", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}
                />

                <select
                  value={filterNiche}
                  onChange={(e) => setFilterNiche(e.target.value)}
                  style={{ flex: 1, minWidth: "140px", padding: "10px 14px", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}
                >
                  <option value="">All Niches</option>
                  {NICHE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n.toUpperCase()}</option>
                  ))}
                </select>

                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  style={{ flex: 1, minWidth: "140px", padding: "10px 14px", backgroundColor: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", color: "var(--text-primary)" }}
                >
                  <option value="">All Platforms</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TWITCH">Twitch</option>
                </select>

                <button onClick={handleFilterCreators} disabled={actionLoading} style={filterBtnStyle}>
                  <Filter size={14} /> Filter
                </button>
              </div>

              {/* Creators Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px", marginTop: "24px" }}>
                {creators.map((c) => (
                  <div key={c.id} style={cardStyle}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
                      <div style={avatarStyle}>
                        {c.name ? c.name[0].toUpperCase() : "C"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.name}
                        </div>
                        <span className="badge badge-green">Verified Creator</span>
                      </div>
                    </div>

                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", minHeight: "38px", margin: "0 0 12px", lineHeight: 1.45 }}>
                      {c.bio || "Content creator with verified cross-platform channel metrics."}
                    </p>

                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "14px" }}>
                      {c.niches.map((n) => <span key={n} style={nicheBadgeStyle}>{n}</span>)}
                    </div>

                    <div style={creatorStatsBoxStyle}>
                      <div>
                        <span style={statLabelStyle}>TOTAL AUDIENCE</span>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                          {c.totalAudience.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span style={statLabelStyle}>ENGAGEMENT</span>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--brand-primary)" }}>
                          {c.engagementRate}%
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                      <a
                        href={`/media-kit/${c.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={viewMediaKitBtnStyle}
                      >
                        Public Media Kit <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => {
                          setActiveTab("campaigns");
                          setShowCreateModal(true);
                        }}
                        style={primaryBtnStyle}
                      >
                        Target Campaign
                      </button>
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
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  Application Management
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Select a campaign to evaluate creator pitches, match scores, and initiate collaboration deal rooms.
                </p>
              </div>

              {/* Campaign Picker */}
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px" }}>
                {campaigns.map((camp) => (
                  <button
                    key={camp.id}
                    onClick={() => handleSelectCampaign(camp)}
                    style={{
                      ...campaignPickerBtnStyle,
                      backgroundColor: selectedCampaign?.id === camp.id ? "var(--brand-light)" : "var(--bg-surface)",
                      borderColor: selectedCampaign?.id === camp.id ? "var(--brand-primary)" : "var(--border-subtle)",
                      color: selectedCampaign?.id === camp.id ? "var(--brand-primary)" : "var(--text-secondary)"
                    }}
                  >
                    <span style={{ fontWeight: "600" }}>{camp.title}</span>
                    <span className="badge badge-gray">{camp.applicantsCount}</span>
                  </button>
                ))}
              </div>

              {!selectedCampaign ? (
                <div style={emptyCardStyle}>
                  <p>Select a campaign above to view applicants.</p>
                </div>
              ) : applicants.length === 0 ? (
                <div style={emptyCardStyle}>
                  <Inbox size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No creator applications received yet for this campaign.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {applicants.map((app) => (
                    <div key={app.id} style={cardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={avatarStyle}>
                            {app.creatorName ? app.creatorName[0].toUpperCase() : "C"}
                          </div>
                          <div>
                            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                              {app.creatorName}
                            </h4>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                              Applied: {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span className={`badge ${app.status === "ACCEPTED" ? "badge-green" : app.status === "REJECTED" ? "badge-red" : "badge-amber"}`}>
                            {app.status}
                          </span>
                          <a
                            href={`/media-kit/${app.creatorProfileId}`}
                            target="_blank"
                            rel="noreferrer"
                            style={btnOutlineStyle}
                          >
                            View Media Kit <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>

                      {app.pitch && (
                        <div style={pitchBoxStyle}>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>CREATOR'S PITCH:</span>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: 1.45 }}>
                            "{app.pitch}"
                          </p>
                        </div>
                      )}

                      {app.status === "PENDING" && (
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                          <button
                            onClick={() => handleDecision(app.id, "REJECTED")}
                            disabled={actionLoading}
                            style={rejectBtnStyle}
                          >
                            <XCircle size={14} /> Decline
                          </button>
                          <button
                            onClick={() => handleDecision(app.id, "ACCEPTED")}
                            disabled={actionLoading}
                            style={acceptBtnStyle}
                          >
                            <CheckCircle2 size={14} /> Accept & Start Deal Room
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 4: COLLABORATIONS & DELIVERABLES
          ========================================================== */}
          {activeTab === "collaborations" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  Brand Collaborations & Deals
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Active deal rooms where you can review deliverable submissions, request revisions, and issue milestone approvals.
                </p>
              </div>

              {collaborations.length === 0 ? (
                <div style={emptyCardStyle}>
                  <Handshake size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No active collaborations yet. Review and accept creator applications to launch deal rooms.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {collaborations.map((collab) => (
                    <div key={collab.id} style={cardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                            CREATOR: {collab.creatorProfile?.user?.name || "Creator"}
                          </span>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: "2px 0 0" }}>
                            {collab.campaign?.title}
                          </h3>
                        </div>

                        <span className={`badge ${
                          collab.status === "COMPLETED"
                            ? "badge-green"
                            : collab.status === "IN_PROGRESS" || collab.status === "SUBMITTED"
                            ? "badge-blue"
                            : collab.status === "REVISION_REQUESTED"
                            ? "badge-amber"
                            : "badge-purple"
                        }`}>
                          {collab.status.replace("_", " ")}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "24px", marginTop: "16px", padding: "12px 16px", backgroundColor: "var(--bg-surface-raised)", borderRadius: "var(--radius-md)" }}>
                        <div>
                          <span style={statLabelStyle}>AGREED COMPENSATION</span>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--brand-primary)" }}>
                            ₹{collab.agreedAmount.toLocaleString()} {collab.currency}
                          </div>
                        </div>
                        <div>
                          <span style={statLabelStyle}>DELIVERABLES</span>
                          <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                            {collab.deliverables?.length || 0} milestones defined
                          </div>
                        </div>
                        <div>
                          <span style={statLabelStyle}>LAST UPDATED</span>
                          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            {new Date(collab.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                        <button
                          onClick={() => navigate(`/collaborations/${collab.id}`)}
                          style={btnOutlineStyle}
                        >
                          Enter Collaboration Deal Room <ArrowRight size={14} />
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
          MODAL: CREATE CAMPAIGN
      ========================================================== */}
      {showCreateModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                Launch New Brand Campaign
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 AI Productivity Tool Launch Sponsorship"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Campaign Description & Deliverable Brief</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the target objective, sponsor call to action, talking points, and deliverable format..."
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Total Budget (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={campaignForm.budget}
                    onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Deliverables Requirement</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Dedicated YouTube Video + 1 Reel"
                    value={campaignForm.deliverables}
                    onChange={(e) => setCampaignForm({ ...campaignForm, deliverables: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Target Niches (Select all that apply)</label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  {NICHE_OPTIONS.map((n) => {
                    const isSelected = campaignForm.niches.includes(n);
                    return (
                      <button
                        type="button"
                        key={n}
                        onClick={() => toggleNiche(n)}
                        style={{
                          ...nicheToggleBtnStyle,
                          backgroundColor: isSelected ? "var(--brand-primary)" : "var(--bg-surface-raised)",
                          color: isSelected ? "#ffffff" : "var(--text-secondary)",
                          borderColor: isSelected ? "var(--brand-primary)" : "var(--border-subtle)"
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Target Platforms</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  {["YOUTUBE", "INSTAGRAM", "TWITCH"].map((p) => {
                    const isSelected = campaignForm.targetPlatforms.includes(p);
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => togglePlatform(p)}
                        style={{
                          ...nicheToggleBtnStyle,
                          backgroundColor: isSelected ? "var(--brand-primary)" : "var(--bg-surface-raised)",
                          color: isSelected ? "#ffffff" : "var(--text-secondary)",
                          borderColor: isSelected ? "var(--brand-primary)" : "var(--border-subtle)"
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={btnSecondaryStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={primaryBtnStyle}
                >
                  {actionLoading ? "Publishing..." : "Publish Campaign Brief"}
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
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "9px 16px",
  borderRadius: "var(--radius-md)",
  boxShadow: "0 2px 8px var(--brand-glow)",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px"
};

const cardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  boxShadow: "var(--shadow-sm)"
};

const emptyCardStyle = {
  padding: "40px",
  textAlign: "center",
  color: "var(--text-muted)",
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "var(--radius-md)",
  border: "1px dashed var(--border-subtle)"
};

const statLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "var(--text-muted)",
  letterSpacing: "0.05em"
};

const campaignMetaBoxStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "16px",
  padding: "12px 16px",
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)"
};

const nicheBadgeStyle = {
  fontSize: "11px",
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-secondary)",
  padding: "2px 8px",
  borderRadius: "var(--radius-sm)"
};

const btnOutlineStyle = {
  border: "1px solid var(--border-subtle)",
  backgroundColor: "var(--bg-surface-raised)",
  color: "var(--text-primary)",
  fontSize: "13px",
  fontWeight: "600",
  padding: "8px 14px",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  textDecoration: "none"
};

const searchFilterBarStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  padding: "16px",
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-sm)"
};

const filterBtnStyle = {
  background: "var(--brand-primary)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "10px 18px",
  borderRadius: "var(--radius-md)",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px"
};

const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "var(--brand-light)",
  border: "1px solid var(--border-subtle)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  fontWeight: "700",
  color: "var(--brand-primary)",
  flexShrink: 0
};

const creatorStatsBoxStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "8px",
  padding: "10px",
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "var(--radius-md)"
};

const viewMediaKitBtnStyle = {
  fontSize: "12px",
  color: "var(--brand-primary)",
  fontWeight: "600",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  textDecoration: "none"
};

const pitchBoxStyle = {
  marginTop: "12px",
  padding: "12px",
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)"
};

const acceptBtnStyle = {
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "600",
  padding: "8px 14px",
  borderRadius: "var(--radius-md)",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  boxShadow: "0 2px 8px var(--brand-glow)"
};

const rejectBtnStyle = {
  border: "1px solid rgba(239, 68, 68, 0.3)",
  backgroundColor: "var(--bg-surface)",
  color: "var(--color-red)",
  fontSize: "12px",
  fontWeight: "600",
  padding: "8px 14px",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px"
};

const nicheToggleBtnStyle = {
  padding: "6px 12px",
  borderRadius: "var(--radius-full)",
  fontSize: "12px",
  fontWeight: "600",
  border: "1px solid var(--border-subtle)",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const campaignPickerBtnStyle = {
  padding: "8px 14px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)",
  fontSize: "13px",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const btnSecondaryStyle = {
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-primary)",
  fontSize: "13px",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "var(--radius-md)",
  cursor: "pointer"
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "var(--bg-overlay)",
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
  padding: "28px",
  boxShadow: "var(--shadow-xl)"
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "var(--text-secondary)",
  display: "block",
  marginBottom: "6px"
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  backgroundColor: "var(--bg-input)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-primary)",
  fontSize: "13.5px",
  outline: "none"
};
