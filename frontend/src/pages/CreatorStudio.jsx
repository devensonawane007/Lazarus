import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import AppShell from "../components/layout/AppShell";
import { api } from "../services/api";

export default function CreatorStudio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // State
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [contents, setContents] = useState([]);
  const [contentPlatform, setContentPlatform] = useState("ALL");
  const [opportunities, setOpportunities] = useState([]);
  const [mediaKit, setMediaKit] = useState(null);
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showMouModal, setShowMouModal] = useState(false);
  const [hasSignedMou, setHasSignedMou] = useState(false);
  const sigCanvasRef = useRef(null);

  const [applyingCampaign, setApplyingCampaign] = useState(null);
  const [pitchText, setPitchText] = useState("");

  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadStudioData();
  }, []);

  const loadStudioData = async () => {
    setLoading(true);
    try {
      const [profData, analyticsData, integData, oppsData, mediaData, collabData] =
        await Promise.allSettled([
          api.creator.getProfile(),
          api.creator.getAnalytics(),
          api.integrations.getStatus(),
          api.creator.getMatchedCampaigns(),
          api.creator.getMediaKit(),
          api.collaborations.list()
        ]);

      if (profData.status === "fulfilled") setProfile(profData.value?.profile);
      if (analyticsData.status === "fulfilled") setAnalytics(analyticsData.value?.analytics);
      if (integData.status === "fulfilled") setIntegrations(integData.value?.accounts || []);
      if (oppsData.status === "fulfilled") setOpportunities(oppsData.value || []);
      if (mediaData.status === "fulfilled") setMediaKit(mediaData.value?.mediaKit);
      if (collabData.status === "fulfilled") setCollaborations(collabData.value?.collaborations || []);

      loadContentLibrary("ALL");
    } catch (err) {
      console.error("Studio load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadContentLibrary = async (platform) => {
    try {
      const query = platform && platform !== "ALL" ? `?platform=${platform}` : "";
      const res = await api.creator.getContent(query);
      setContents(res?.contents || []);
    } catch (err) {
      console.error("Content load error:", err);
    }
  };

  /* ===============================
     OAUTH & INTEGRATION HANDLERS
  ================================ */
  const handleConnectOAuth = async (platform) => {
    try {
      const res = await api.integrations.getAuthUrl(platform);
      if (res.configured && res.url) {
        window.location.href = res.url;
      } else {
        alert(
          `${platform} OAuth credentials not configured in backend/.env. Use the "Connect Verified Demo Channel" button below to test integration workflows!`
        );
      }
    } catch (err) {
      alert("Failed to initiate connection: " + (err.message || ""));
    }
  };

  const handleConnectMock = async (platform = "YOUTUBE") => {
    setActionLoading(true);
    try {
      await api.integrations.connectMock(platform);
      alert(`Verified ${platform} Demo Channel connected! Metrics & content ingested ✅`);
      await loadStudioData();
    } catch (err) {
      alert("Failed to connect mock account: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncAccount = async (accountId) => {
    setActionLoading(true);
    try {
      await api.integrations.sync(accountId);
      alert("Account synchronized with latest platform data ✅");
      await loadStudioData();
    } catch (err) {
      alert("Sync failed: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    if (!confirm("Are you sure you want to disconnect this platform account?")) return;
    setActionLoading(true);
    try {
      await api.integrations.disconnect(accountId);
      alert("Account disconnected and credentials purged ✅");
      await loadStudioData();
    } catch (err) {
      alert("Failed to disconnect: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  /* ===============================
     MOU SIGNING
  ================================ */
  const handleSaveSignature = async () => {
    if (!hasSignedMou) {
      alert("Please draw your digital signature before saving.");
      return;
    }
    const signatureData = sigCanvasRef.current.toDataURL("image/png");
    setActionLoading(true);
    try {
      await api.creator.signMou({ signatureData });
      alert("MOU Agreement registered in Neon PostgreSQL! ✅");
      setShowMouModal(false);
      await loadStudioData();
    } catch (err) {
      alert("Failed to save MOU: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  /* ===============================
     APPLY TO CAMPAIGN
  ================================ */
  const handleApplyToCampaign = async () => {
    if (!applyingCampaign) return;
    if (!profile?.isMouSigned) {
      alert("Please sign the Creator MOU agreement first before applying to brand deals.");
      setShowMouModal(true);
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.creator.applyToCampaign({
        campaignId: applyingCampaign.id,
        pitch: pitchText
      });
      alert("Application submitted! Collaboration workspace initialized 🚀");
      setApplyingCampaign(null);
      setPitchText("");
      await loadStudioData();

      if (res.collaborationId) {
        navigate(`/collaborations/${res.collaborationId}`);
      }
    } catch (err) {
      alert("Application failed: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  /* ===============================
     COPY SHAREABLE MEDIA KIT LINK
  ================================ */
  const copyMediaKitLink = () => {
    const url = `${window.location.origin}/media-kit/${profile?.id}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      pageTitle={
        activeTab === "overview"
          ? "Creator Studio Overview"
          : activeTab === "accounts"
          ? "Connected Accounts & Integrations"
          : activeTab === "analytics"
          ? "Verified Cross-Platform Analytics"
          : activeTab === "content"
          ? "Unified Content Library"
          : activeTab === "opportunities"
          ? "Explainable Opportunity Finder"
          : activeTab === "mediakit"
          ? "Automated Creator Media Kit"
          : "Brand Collaborations & Deals"
      }
      subtitle={
        profile?.user?.name
          ? `Welcome back, ${profile.user.name}. ${integrations.length} verified platform accounts connected.`
          : "Professional workspace for content creators"
      }
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚡</div>
          Loading Creator Studio data from Neon PostgreSQL...
        </div>
      ) : (
        <div>
          {/* Top MOU Banner if not signed */}
          {profile && !profile.isMouSigned && (
            <div style={mouAlertBannerStyle}>
              <div>
                <strong style={{ color: "#f8fafc" }}>📄 Digital MOU Required:</strong> Sign the in-app creator agreement to unlock verified campaign applications.
              </div>
              <button onClick={() => setShowMouModal(true)} style={signMouBtnStyle}>
                Sign MOU Agreement
              </button>
            </div>
          )}

          {/* =========================================================
              TAB 1: OVERVIEW
          ========================================================== */}
          {activeTab === "overview" && (
            <div>
              {/* Stat Cards Grid */}
              <div style={statGridStyle}>
                <div style={statCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={statLabelStyle}>TOTAL VERIFIED AUDIENCE</span>
                    <span style={{ fontSize: "20px" }}>👥</span>
                  </div>
                  <div style={statNumberStyle}>
                    {(analytics?.totalAudience || 0).toLocaleString()}
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                    {integrations.map((acc) => (
                      <span key={acc.id} style={platformTagStyle}>
                        {acc.platform}: {acc.platform === "YOUTUBE" ? "YouTube" : acc.platform}
                      </span>
                    ))}
                    {integrations.length === 0 && (
                      <span style={{ fontSize: "12px", color: "#64748b" }}>0 accounts connected</span>
                    )}
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={statLabelStyle}>TOTAL VERIFIED VIEWS</span>
                    <span style={{ fontSize: "20px" }}>👁️</span>
                  </div>
                  <div style={statNumberStyle}>
                    {Number(analytics?.totalLifetimeViews || 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Avg: {(analytics?.recentAvgViews || 0).toLocaleString()} views / video
                  </span>
                </div>

                <div style={statCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={statLabelStyle}>AVG ENGAGEMENT RATE</span>
                    <span style={{ fontSize: "20px" }}>⚡</span>
                  </div>
                  <div style={{ ...statNumberStyle, color: "#10b981" }}>
                    {analytics?.aggregateEngagementRate || 0.0}%
                  </div>
                  <span style={{ fontSize: "12px", color: "#10b981" }}>
                    Verified from recent media activity
                  </span>
                </div>

                <div style={statCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={statLabelStyle}>ACTIVE COLLABORATIONS</span>
                    <span style={{ fontSize: "20px" }}>🤝</span>
                  </div>
                  <div style={statNumberStyle}>
                    {collaborations.filter((c) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(c.status)).length}
                  </div>
                  <span style={{ fontSize: "12px", color: "#38bdf8" }}>
                    {collaborations.length} total deals in pipeline
                  </span>
                </div>
              </div>

              {/* Quick Actions & Recent Showcase */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginTop: "28px" }}>
                {/* Recent Content Showcase */}
                <div style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>
                      🎬 Synchronized Content Highlights
                    </h3>
                    <button onClick={() => setActiveTab("content")} style={viewAllBtnStyle}>
                      View Content Library ({contents.length}) →
                    </button>
                  </div>

                  {contents.length === 0 ? (
                    <div style={emptyCardStyle}>
                      <p>No videos or posts synchronized yet.</p>
                      <button onClick={() => setActiveTab("accounts")} style={primaryBtnSmallStyle}>
                        Connect Social Account
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {contents.slice(0, 4).map((c) => (
                        <div key={c.id} style={contentRowStyle}>
                          <img
                            src={c.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80"}
                            alt={c.title}
                            style={thumbnailMiniStyle}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {c.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", gap: "12px", marginTop: "4px" }}>
                              <span>👁️ {c.viewCount.toLocaleString()} views</span>
                              <span>❤️ {c.likeCount.toLocaleString()} likes</span>
                              <span>💬 {c.commentCount.toLocaleString()} comments</span>
                            </div>
                          </div>
                          <a
                            href={c.contentUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={externalLinkBtnStyle}
                          >
                            Watch ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Next Steps Card */}
                <div style={cardStyle}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                    🚀 Studio Quick Links
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button onClick={() => setActiveTab("accounts")} style={quickLinkItemStyle}>
                      <span>🔗 Manage Connected Accounts</span>
                      <span style={{ color: "#10b981" }}>{integrations.length} Active</span>
                    </button>
                    <button onClick={() => setActiveTab("opportunities")} style={quickLinkItemStyle}>
                      <span>🎯 Discover Brand Opportunities</span>
                      <span style={{ color: "#38bdf8" }}>{opportunities.length} Matched</span>
                    </button>
                    <button onClick={() => setActiveTab("mediakit")} style={quickLinkItemStyle}>
                      <span>📄 View Automated Media Kit</span>
                      <span style={{ color: "#8b5cf6" }}>Live</span>
                    </button>
                    <button onClick={() => setActiveTab("collaborations")} style={quickLinkItemStyle}>
                      <span>🤝 Track Active Deliverables</span>
                      <span style={{ color: "#f59e0b" }}>{collaborations.length} Deals</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 2: ACCOUNTS & INTEGRATIONS
          ========================================================== */}
          {activeTab === "accounts" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
                  Connected Social Accounts
                </h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  Connect your official creator accounts using standard OAuth. Lazarus never scrapes or requests passwords.
                </p>
              </div>

              {/* Provider Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                {/* YouTube */}
                <div style={integrationCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ ...providerIconStyle, backgroundColor: "#ef4444" }}>▶️</div>
                      <div>
                        <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>YouTube</h4>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Google OAuth 2.0 & Data API v3</span>
                      </div>
                    </div>
                    {integrations.find((a) => a.platform === "YOUTUBE") ? (
                      <span className="badge badge-green">Connected</span>
                    ) : (
                      <span className="badge badge-gray">Not Connected</span>
                    )}
                  </div>

                  {integrations.find((a) => a.platform === "YOUTUBE") ? (
                    <div>
                      {(() => {
                        const acc = integrations.find((a) => a.platform === "YOUTUBE");
                        return (
                          <div>
                            <div style={connectedAccountBoxStyle}>
                              <img src={acc.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80"} alt={acc.displayName} style={miniAvatarStyle} />
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>{acc.displayName}</div>
                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>@{acc.username}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", margin: "10px 0" }}>
                              Last Synced: {acc.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleString() : "Never"}
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleSyncAccount(acc.id)} disabled={actionLoading} style={btnSmallOutlineStyle}>
                                🔄 Re-Sync
                              </button>
                              <button onClick={() => handleDisconnectAccount(acc.id)} disabled={actionLoading} style={btnSmallDangerStyle}>
                                Disconnect
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5, marginBottom: "16px" }}>
                        Import your YouTube subscriber counts, video library, and lifetime analytics with official Google authorization.
                      </p>
                      <button onClick={() => handleConnectOAuth("youtube")} style={connectBtnStyle}>
                        Connect YouTube Channel →
                      </button>
                    </div>
                  )}
                </div>

                {/* Instagram */}
                <div style={integrationCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ ...providerIconStyle, background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>📸</div>
                      <div>
                        <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>Instagram</h4>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Meta Graph API (Professional)</span>
                      </div>
                    </div>
                    {integrations.find((a) => a.platform === "INSTAGRAM") ? (
                      <span className="badge badge-green">Connected</span>
                    ) : (
                      <span className="badge badge-gray">Not Connected</span>
                    )}
                  </div>

                  {integrations.find((a) => a.platform === "INSTAGRAM") ? (
                    <div>
                      {(() => {
                        const acc = integrations.find((a) => a.platform === "INSTAGRAM");
                        return (
                          <div>
                            <div style={connectedAccountBoxStyle}>
                              <img src={acc.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80"} alt={acc.displayName} style={miniAvatarStyle} />
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>{acc.displayName}</div>
                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>@{acc.username}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", margin: "10px 0" }}>
                              Last Synced: {acc.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleString() : "Never"}
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleSyncAccount(acc.id)} disabled={actionLoading} style={btnSmallOutlineStyle}>
                                🔄 Re-Sync
                              </button>
                              <button onClick={() => handleDisconnectAccount(acc.id)} disabled={actionLoading} style={btnSmallDangerStyle}>
                                Disconnect
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5, marginBottom: "16px" }}>
                        Authorize your Instagram Creator or Business account via Meta to verify followers, reels, and engagement rates.
                      </p>
                      <button onClick={() => handleConnectOAuth("instagram")} style={connectBtnStyle}>
                        Connect Instagram →
                      </button>
                    </div>
                  )}
                </div>

                {/* Twitch */}
                <div style={integrationCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ ...providerIconStyle, backgroundColor: "#9146ff" }}>🟣</div>
                      <div>
                        <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc" }}>Twitch</h4>
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>Twitch OAuth & Helix API</span>
                      </div>
                    </div>
                    {integrations.find((a) => a.platform === "TWITCH") ? (
                      <span className="badge badge-green">Connected</span>
                    ) : (
                      <span className="badge badge-gray">Not Connected</span>
                    )}
                  </div>

                  {integrations.find((a) => a.platform === "TWITCH") ? (
                    <div>
                      {(() => {
                        const acc = integrations.find((a) => a.platform === "TWITCH");
                        return (
                          <div>
                            <div style={connectedAccountBoxStyle}>
                              <img src={acc.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80"} alt={acc.displayName} style={miniAvatarStyle} />
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>{acc.displayName}</div>
                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>@{acc.username}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b", margin: "10px 0" }}>
                              Last Synced: {acc.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleString() : "Never"}
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => handleSyncAccount(acc.id)} disabled={actionLoading} style={btnSmallOutlineStyle}>
                                🔄 Re-Sync
                              </button>
                              <button onClick={() => handleDisconnectAccount(acc.id)} disabled={actionLoading} style={btnSmallDangerStyle}>
                                Disconnect
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5, marginBottom: "16px" }}>
                        Authorize your Twitch channel to verify live broadcast history, follower metrics, and VOD statistics.
                      </p>
                      <button onClick={() => handleConnectOAuth("twitch")} style={connectBtnStyle}>
                        Connect Twitch →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Developer / Testing Notice & Quick Mock Connect */}
              <div style={testFixtureBoxStyle}>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#f8fafc" }}>
                    🧪 Development & Evaluation Sandboxing
                  </h4>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                    If you do not have live Google/Meta OAuth client secrets configured, you can connect official mock fixtures to ingest verified channels, videos, and metrics directly into Neon PostgreSQL.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleConnectMock("YOUTUBE")} disabled={actionLoading} style={mockBtnStyle}>
                    ⚡ Connect Verified YouTube Channel
                  </button>
                  <button onClick={() => handleConnectMock("INSTAGRAM")} disabled={actionLoading} style={mockBtnStyle}>
                    ⚡ Connect Verified Instagram Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 3: VERIFIED ANALYTICS
          ========================================================== */}
          {activeTab === "analytics" && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
                  Verified Cross-Platform Analytics
                </h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  Data snapshot trends calculated directly from connected platform APIs.
                </p>
              </div>

              {/* Interactive Recharts Graph */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                  📈 Audience Growth & Performance Snapshots
                </h3>

                {analytics?.historicalTrends && analytics.historicalTrends.length > 0 ? (
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={analytics.historicalTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="followers"
                          name="Audience Reach"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Connect accounts and perform a sync to build historical growth curves.
                  </div>
                )}
              </div>

              {/* Platform Breakdown Table */}
              <div style={{ ...cardStyle, marginTop: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                  Platform Breakdown
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Platform</th>
                        <th style={thStyle}>Handle / Channel</th>
                        <th style={thStyle}>Verified Followers</th>
                        <th style={thStyle}>Lifetime Views</th>
                        <th style={thStyle}>Engagement Rate</th>
                        <th style={thStyle}>Sync Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.platformBreakdown && Object.values(analytics.platformBreakdown).length > 0 ? (
                        Object.values(analytics.platformBreakdown).map((p, idx) => (
                          <tr key={idx} style={trStyle}>
                            <td style={tdStyle}>
                              <strong>{p.platform}</strong>
                            </td>
                            <td style={tdStyle}>{p.displayName} (@{p.username})</td>
                            <td style={tdStyle}>{p.followerCount.toLocaleString()}</td>
                            <td style={tdStyle}>{Number(p.totalViews).toLocaleString()}</td>
                            <td style={{ ...tdStyle, color: "#10b981", fontWeight: "600" }}>{p.engagementRate}%</td>
                            <td style={tdStyle}><span className="badge badge-green">Synced</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                            No platform accounts currently connected.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 4: CONTENT LIBRARY
          ========================================================== */}
          {activeTab === "content" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
                    Unified Content Library
                  </h2>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                    {contents.length} synchronized media items from your connected channels.
                  </p>
                </div>

                {/* Filter Pills */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {["ALL", "YOUTUBE", "INSTAGRAM", "TWITCH"].map((p) => (
                    <button
                      key={p}
                      onClick={() => { setContentPlatform(p); loadContentLibrary(p); }}
                      style={{
                        ...filterPillStyle,
                        backgroundColor: contentPlatform === p ? "#10b981" : "var(--bg-card)",
                        color: contentPlatform === p ? "#ffffff" : "#94a3b8"
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {contents.length === 0 ? (
                <div style={emptyCardStyle}>
                  <p>No content records found for platform: {contentPlatform}</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {contents.map((item) => (
                    <div key={item.id} style={contentCardStyle}>
                      <div style={{ position: "relative" }}>
                        <img
                          src={item.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80"}
                          alt={item.title}
                          style={contentThumbnailStyle}
                        />
                        <span style={contentPlatformBadgeStyle}>{item.platform}</span>
                      </div>
                      <div style={{ padding: "16px" }}>
                        <h4 style={contentCardTitleStyle} title={item.title}>
                          {item.title}
                        </h4>
                        <div style={contentMetricsGridStyle}>
                          <div>
                            <span style={metricLabelStyle}>VIEWS</span>
                            <div style={metricValStyle}>{item.viewCount.toLocaleString()}</div>
                          </div>
                          <div>
                            <span style={metricLabelStyle}>LIKES</span>
                            <div style={metricValStyle}>{item.likeCount.toLocaleString()}</div>
                          </div>
                          <div>
                            <span style={metricLabelStyle}>COMMENTS</span>
                            <div style={metricValStyle}>{item.commentCount.toLocaleString()}</div>
                          </div>
                        </div>
                        <a
                          href={item.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={watchOnPlatformBtnStyle}
                        >
                          Open on Platform ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 5: OPPORTUNITY FINDER
          ========================================================== */}
          {activeTab === "opportunities" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
                  Explainable Opportunity Finder
                </h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  Brand campaigns ranked deterministically based on your verified audience reach, connected platforms, and content niches.
                </p>
              </div>

              {opportunities.length === 0 ? (
                <div style={emptyCardStyle}>
                  <p>No open brand campaigns match your profile currently.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {opportunities.map((opp) => (
                    <div key={opp.id} style={opportunityCardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#94a3b8" }}>
                              {opp.brandName}
                            </span>
                            {opp.isBrandVerified && <span className="badge badge-blue">Verified Brand</span>}
                          </div>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", marginTop: "4px" }}>
                            {opp.title}
                          </h3>
                        </div>

                        {/* Match Score Badge */}
                        <div style={matchScoreContainerStyle}>
                          <div style={{ fontSize: "24px", fontWeight: "800", color: opp.matchScore >= 80 ? "#10b981" : opp.matchScore >= 60 ? "#f59e0b" : "#94a3b8" }}>
                            {opp.matchScore}%
                          </div>
                          <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700", letterSpacing: "0.04em" }}>
                            MATCH SCORE
                          </span>
                        </div>
                      </div>

                      {/* Explainable Rationale */}
                      <div style={explanationBannerStyle}>
                        💡 <strong>Recommendation Rationale:</strong> {opp.explanation}
                      </div>

                      <p style={{ fontSize: "14px", color: "#cbd5e1", margin: "14px 0", lineHeight: 1.5 }}>
                        {opp.description}
                      </p>

                      <div style={opportunityMetaGridStyle}>
                        <div>
                          <span style={oppMetaLabelStyle}>COMPENSATION</span>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "#10b981" }}>
                            ₹{opp.budget.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span style={oppMetaLabelStyle}>NICHES</span>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "2px" }}>
                            {opp.niches.map((n) => (
                              <span key={n} style={nicheBadgeStyle}>{n}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span style={oppMetaLabelStyle}>TARGET PLATFORMS</span>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "2px" }}>
                            {opp.targetPlatforms && opp.targetPlatforms.length > 0 ? (
                              opp.targetPlatforms.map((p) => <span key={p} style={nicheBadgeStyle}>{p}</span>)
                            ) : (
                              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Any Platform</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span style={oppMetaLabelStyle}>DELIVERABLES</span>
                          <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "2px" }}>
                            {opp.deliverables}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                        {opp.alreadyApplied ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="badge badge-green">Applied ({opp.applicationStatus})</span>
                            {opp.collaborationId && (
                              <button
                                onClick={() => navigate(`/collaborations/${opp.collaborationId}`)}
                                style={openCollabBtnStyle}
                              >
                                Open Collaboration Deal →
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => { setApplyingCampaign(opp); setPitchText(""); }}
                            style={applyBtnStyle}
                          >
                            Apply to Opportunity →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 6: AUTOMATED MEDIA KIT
          ========================================================== */}
          {activeTab === "mediakit" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
                    Automated Creator Media Kit
                  </h2>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                    Dynamic, shareable portfolio verified continuously against official platform APIs.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={copyMediaKitLink} style={btnSecondaryStyle}>
                    {copySuccess ? "Link Copied! ✅" : "📋 Copy Shareable Link"}
                  </button>
                  <a
                    href={`/media-kit/${profile?.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={btnPrimaryStyle}
                  >
                    Open Public View ↗
                  </a>
                </div>
              </div>

              {mediaKit ? (
                <div style={mediaKitContainerStyle}>
                  {/* Top Creator Header */}
                  <div style={mediaKitHeaderStyle}>
                    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                      <div style={mediaKitAvatarStyle}>
                        {mediaKit.name ? mediaKit.name[0].toUpperCase() : "C"}
                      </div>
                      <div>
                        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#f8fafc" }}>
                          {mediaKit.name}
                        </h1>
                        <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>
                          {mediaKit.bio}
                        </p>
                        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                          {mediaKit.niches.map((n) => (
                            <span key={n} style={nicheBadgeStyle}>{n}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span className="badge badge-green">Verified Creator Profile</span>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>
                        Data Updated: {new Date(mediaKit.generatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Stats */}
                  <div style={mediaKitStatsGridStyle}>
                    <div style={mediaKitStatItemStyle}>
                      <span style={statLabelStyle}>TOTAL VERIFIED AUDIENCE</span>
                      <div style={statNumberStyle}>{mediaKit.totalAudience.toLocaleString()}</div>
                    </div>
                    <div style={mediaKitStatItemStyle}>
                      <span style={statLabelStyle}>TOTAL VIDEO VIEWS</span>
                      <div style={statNumberStyle}>{Number(mediaKit.totalLifetimeViews).toLocaleString()}</div>
                    </div>
                    <div style={mediaKitStatItemStyle}>
                      <span style={statLabelStyle}>AVG VIEWS / VIDEO</span>
                      <div style={statNumberStyle}>{mediaKit.avgViewsPerVideo.toLocaleString()}</div>
                    </div>
                    <div style={mediaKitStatItemStyle}>
                      <span style={statLabelStyle}>ENGAGEMENT RATE</span>
                      <div style={{ ...statNumberStyle, color: "#10b981" }}>{mediaKit.engagementRate}%</div>
                    </div>
                  </div>

                  {/* Top Content Showcase */}
                  <div style={{ marginTop: "32px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                      🔥 Top Performing Content
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                      {mediaKit.topPerformingContent.map((c) => (
                        <div key={c.id} style={mediaKitContentCardStyle}>
                          <img src={c.thumbnailUrl} alt={c.title} style={{ width: "100%", height: "140px", objectFit: "cover" }} />
                          <div style={{ padding: "12px" }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {c.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "600", marginTop: "4px" }}>
                              {c.viewCount.toLocaleString()} views
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p>Generating media kit...</p>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 7: COLLABORATIONS & DEALS
          ========================================================== */}
          {activeTab === "collaborations" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc" }}>
                  Brand Collaborations & Deals
                </h2>
                <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                  Track deliverable submissions, revisions, and approval milestones for all active sponsorships.
                </p>
              </div>

              {collaborations.length === 0 ? (
                <div style={emptyCardStyle}>
                  <p>No active collaborations yet. Explore the Opportunity Finder to apply to open campaigns!</p>
                  <button onClick={() => setActiveTab("opportunities")} style={primaryBtnSmallStyle}>
                    Explore Opportunities →
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {collaborations.map((collab) => (
                    <div key={collab.id} style={cardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
                            BRAND: {collab.campaign?.brandProfile?.companyName || "Brand Partner"}
                          </span>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc", marginTop: "2px" }}>
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

                      <div style={{ display: "flex", gap: "24px", marginTop: "16px", padding: "12px 16px", backgroundColor: "rgba(10, 17, 34, 0.4)", borderRadius: "8px" }}>
                        <div>
                          <span style={statLabelStyle}>AGREED COMPENSATION</span>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: "#10b981" }}>
                            ₹{collab.agreedAmount.toLocaleString()} {collab.currency}
                          </div>
                        </div>
                        <div>
                          <span style={statLabelStyle}>DELIVERABLES</span>
                          <div style={{ fontSize: "13px", color: "#f8fafc" }}>
                            {collab.deliverables?.length || 0} milestones defined
                          </div>
                        </div>
                        <div>
                          <span style={statLabelStyle}>UPDATED</span>
                          <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                            {new Date(collab.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                        <button
                          onClick={() => navigate(`/collaborations/${collab.id}`)}
                          style={openCollabBtnStyle}
                        >
                          Enter Collaboration Deal Room →
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
          MODAL: APPLY TO CAMPAIGN
      ========================================================== */}
      {applyingCampaign && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc" }}>
                Apply to {applyingCampaign.brandName}
              </h3>
              <button onClick={() => setApplyingCampaign(null)} style={{ color: "#94a3b8", fontSize: "18px" }}>✕</button>
            </div>

            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
              Campaign: <strong>{applyingCampaign.title}</strong> (Budget: ₹{applyingCampaign.budget.toLocaleString()})
            </p>

            <label style={{ fontSize: "12px", fontWeight: "600", color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
              Your Collaboration Pitch & Deliverable Plan
            </label>
            <textarea
              rows={5}
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              placeholder="Explain how you will integrate the sponsor's brand, your proposed format (e.g. dedicated review, shoutout), and timeline..."
              style={{ width: "100%", marginBottom: "20px" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setApplyingCampaign(null)} style={btnSecondaryStyle}>
                Cancel
              </button>
              <button onClick={handleApplyToCampaign} disabled={actionLoading} style={btnPrimaryStyle}>
                {actionLoading ? "Submitting..." : "Confirm & Send Application →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: SIGN MOU AGREEMENT
      ========================================================== */}
      {showMouModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#f8fafc" }}>
                Sign Creator MOU Agreement
              </h3>
              <button onClick={() => setShowMouModal(false)} style={{ color: "#94a3b8", fontSize: "18px" }}>✕</button>
            </div>

            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "14px", lineHeight: 1.5 }}>
              By signing below, you acknowledge the terms of the Lazarus Creator Network, agreeing to provide authentic deliverable metrics and uphold brand collaboration guidelines.
            </p>

            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "8px", overflow: "hidden", backgroundColor: "#ffffff" }}>
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="#000000"
                canvasProps={{ width: 500, height: 160, className: "sigCanvas" }}
                onBegin={() => setHasSignedMou(true)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => {
                  sigCanvasRef.current?.clear();
                  setHasSignedMou(false);
                }}
                style={{ fontSize: "12px", color: "#ef4444" }}
              >
                Clear Signature
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowMouModal(false)} style={btnSecondaryStyle}>
                  Cancel
                </button>
                <button onClick={handleSaveSignature} disabled={actionLoading} style={btnPrimaryStyle}>
                  {actionLoading ? "Saving..." : "Sign & Register Agreement ✅"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// Styles
const mouAlertBannerStyle = {
  backgroundColor: "rgba(245, 158, 11, 0.12)",
  border: "1px solid rgba(245, 158, 11, 0.3)",
  borderRadius: "10px",
  padding: "14px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px"
};

const signMouBtnStyle = {
  background: "#f59e0b",
  color: "#000000",
  fontWeight: "700",
  fontSize: "12px",
  padding: "8px 14px",
  borderRadius: "6px"
};

const statGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px"
};

const statCardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "20px"
};

const statLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "var(--text-dim)",
  letterSpacing: "0.05em"
};

const statNumberStyle = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#f8fafc",
  margin: "8px 0"
};

const platformTagStyle = {
  fontSize: "11px",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  color: "#cbd5e1",
  padding: "2px 8px",
  borderRadius: "4px"
};

const cardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px"
};

const emptyCardStyle = {
  padding: "40px 20px",
  textAlign: "center",
  color: "#94a3b8",
  backgroundColor: "rgba(10, 17, 34, 0.3)",
  borderRadius: "8px"
};

const primaryBtnSmallStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "8px 16px",
  borderRadius: "6px",
  marginTop: "12px"
};

const viewAllBtnStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#10b981"
};

const contentRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "10px",
  borderRadius: "8px",
  backgroundColor: "rgba(15, 23, 42, 0.4)",
  border: "1px solid var(--border-subtle)"
};

const thumbnailMiniStyle = {
  width: "60px",
  height: "40px",
  borderRadius: "4px",
  objectFit: "cover"
};

const externalLinkBtnStyle = {
  fontSize: "12px",
  color: "#10b981",
  fontWeight: "600",
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid rgba(16, 185, 129, 0.3)"
};

const quickLinkItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 14px",
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "8px",
  fontSize: "13px",
  color: "#f8fafc",
  fontWeight: "500"
};

const integrationCardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px"
};

const providerIconStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px"
};

const connectedAccountBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 12px",
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  borderRadius: "8px",
  border: "1px solid var(--border-subtle)"
};

const miniAvatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  objectFit: "cover"
};

const connectBtnStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "10px 16px",
  borderRadius: "8px",
  width: "100%"
};

const btnSmallOutlineStyle = {
  border: "1px solid var(--border-subtle)",
  color: "#cbd5e1",
  fontSize: "12px",
  padding: "6px 12px",
  borderRadius: "6px"
};

const btnSmallDangerStyle = {
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "#ef4444",
  fontSize: "12px",
  padding: "6px 12px",
  borderRadius: "6px"
};

const testFixtureBoxStyle = {
  marginTop: "32px",
  padding: "24px",
  backgroundColor: "rgba(19, 29, 53, 0.4)",
  border: "1px dashed #334155",
  borderRadius: "var(--radius-lg)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "16px"
};

const mockBtnStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  color: "#38bdf8",
  fontWeight: "600",
  fontSize: "13px",
  padding: "10px 16px",
  borderRadius: "8px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px"
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  color: "#64748b",
  borderBottom: "1px solid var(--border-subtle)",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.04em"
};

const trStyle = {
  borderBottom: "1px solid rgba(255, 255, 255, 0.04)"
};

const tdStyle = {
  padding: "14px 12px",
  color: "#f8fafc"
};

const filterPillStyle = {
  padding: "6px 14px",
  borderRadius: "var(--radius-full)",
  fontSize: "12px",
  fontWeight: "600",
  border: "1px solid var(--border-subtle)"
};

const contentCardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  overflow: "hidden"
};

const contentThumbnailStyle = {
  width: "100%",
  height: "160px",
  objectFit: "cover"
};

const contentPlatformBadgeStyle = {
  position: "absolute",
  top: "10px",
  left: "10px",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: "700",
  padding: "2px 8px",
  borderRadius: "4px"
};

const contentCardTitleStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#f8fafc",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const contentMetricsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "8px",
  marginTop: "12px",
  padding: "8px",
  backgroundColor: "rgba(10, 17, 34, 0.5)",
  borderRadius: "6px"
};

const metricLabelStyle = {
  fontSize: "9px",
  color: "#64748b",
  fontWeight: "700"
};

const metricValStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#f8fafc",
  marginTop: "2px"
};

const watchOnPlatformBtnStyle = {
  display: "block",
  textAlign: "center",
  marginTop: "14px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#10b981",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid rgba(16, 185, 129, 0.3)"
};

const opportunityCardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px"
};

const matchScoreContainerStyle = {
  textAlign: "center",
  padding: "8px 16px",
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  borderRadius: "10px",
  border: "1px solid var(--border-subtle)"
};

const explanationBannerStyle = {
  marginTop: "12px",
  padding: "10px 14px",
  backgroundColor: "rgba(16, 185, 129, 0.08)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "6px",
  fontSize: "13px",
  color: "#34d399"
};

const opportunityMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "16px",
  padding: "14px",
  backgroundColor: "rgba(10, 17, 34, 0.4)",
  borderRadius: "8px"
};

const oppMetaLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "var(--text-dim)",
  letterSpacing: "0.04em"
};

const nicheBadgeStyle = {
  fontSize: "11px",
  padding: "2px 8px",
  borderRadius: "4px",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  color: "#cbd5e1"
};

const applyBtnStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "10px 18px",
  borderRadius: "8px"
};

const openCollabBtnStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  color: "#38bdf8",
  fontWeight: "600",
  fontSize: "13px",
  padding: "8px 14px",
  borderRadius: "6px"
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

const btnPrimaryStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "6px",
  display: "inline-flex",
  alignItems: "center"
};

const mediaKitContainerStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "32px"
};

const mediaKitHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "24px",
  borderBottom: "1px solid var(--border-subtle)"
};

const mediaKitAvatarStyle = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #10b981 0%, #38bdf8 100%)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: "800"
};

const mediaKitStatsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "20px",
  marginTop: "24px"
};

const mediaKitStatItemStyle = {
  padding: "16px",
  backgroundColor: "rgba(10, 17, 34, 0.5)",
  borderRadius: "8px",
  border: "1px solid var(--border-subtle)"
};

const mediaKitContentCardStyle = {
  backgroundColor: "var(--bg-surface)",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid var(--border-subtle)"
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
  maxWidth: "560px",
  padding: "28px"
};
