import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { useTheme } from "../context/ThemeContext";
import {
  Users,
  Eye,
  Zap,
  Handshake,
  Film,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Unlink,
  Copy,
  Check,
  FileText,
  X,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Target,
  Link2,
  Calendar,
  MessageSquare,
  Heart
} from "lucide-react";

export default function CreatorStudio() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartStroke = isDark ? "#10b981" : "#059669";
  const gridStroke = isDark ? "#1e293b" : "#e2e8f0";
  const axisStroke = isDark ? "#64748b" : "#94a3b8";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#1e293b" : "#cbd5e1";
  const tooltipText = isDark ? "#f8fafc" : "#0f172a";

  const [activeTab, setActiveTab] = useState("overview");

  // URL search parameters for OAuth callbacks
  const [searchParams] = useSearchParams();
  const [oauthBanner, setOauthBanner] = useState(null);
  const [syncingAccountId, setSyncingAccountId] = useState(null);

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

  useEffect(() => {
    const oauthStatus = searchParams.get("oauth");
    const platform = searchParams.get("platform");
    const errorMsg = searchParams.get("message") || searchParams.get("error");

    if (oauthStatus === "success") {
      setOauthBanner({
        type: "success",
        message: `Successfully connected ${platform || "social"} account! Channel records and analytics synchronized with Neon PostgreSQL.`
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      loadStudioData();
    } else if (oauthStatus === "error" || errorMsg) {
      setOauthBanner({
        type: "error",
        message: errorMsg || `Failed to authenticate ${platform || "social"} account. Please verify credentials or retry.`
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

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
      alert(`Verified ${platform} Demo Channel connected! Metrics & content ingested.`);
      await loadStudioData();
    } catch (err) {
      alert("Failed to connect mock account: " + (err.message || ""));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncAccount = async (accountId) => {
    setSyncingAccountId(accountId);
    setActionLoading(true);
    try {
      await api.integrations.sync(accountId);
      setOauthBanner({
        type: "success",
        message: "Account synchronized successfully with the latest platform data."
      });
      await loadStudioData();
    } catch (err) {
      setOauthBanner({
        type: "error",
        message: "Sync failed: " + (err.message || "Failed to sync platform account")
      });
    } finally {
      setActionLoading(false);
      setSyncingAccountId(null);
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    if (!confirm("Are you sure you want to disconnect this platform account? All stored credentials will be securely wiped.")) return;
    setActionLoading(true);
    try {
      await api.integrations.disconnect(accountId);
      setOauthBanner({
        type: "success",
        message: "Account disconnected and encrypted credentials purged from Neon."
      });
      await loadStudioData();
    } catch (err) {
      setOauthBanner({
        type: "error",
        message: "Failed to disconnect account: " + (err.message || "")
      });
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
      alert("MOU Agreement registered in Neon PostgreSQL!");
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
      alert("Application submitted! Collaboration workspace initialized.");
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
            <Zap size={24} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}>
            Loading Creator Studio data from Neon PostgreSQL...
          </p>
        </div>
      ) : (
        <div>
          {/* Top OAuth & Action Notification Banner */}
          {oauthBanner && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                marginBottom: "20px",
                backgroundColor:
                  oauthBanner.type === "success"
                    ? "var(--brand-light)"
                    : "rgba(239, 68, 68, 0.12)",
                border: `1px solid ${
                  oauthBanner.type === "success"
                    ? "var(--brand-primary)"
                    : "rgba(239, 68, 68, 0.35)"
                }`,
                color:
                  oauthBanner.type === "success"
                    ? "var(--brand-primary)"
                    : "var(--color-red)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {oauthBanner.type === "success" ? (
                  <Check size={18} style={{ flexShrink: 0 }} />
                ) : (
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                )}
                <span style={{ fontSize: "13px", fontWeight: "600" }}>
                  {oauthBanner.message}
                </span>
              </div>
              <button
                onClick={() => setOauthBanner(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px"
                }}
                aria-label="Dismiss banner"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Top MOU Banner if not signed */}
          {profile && !profile.isMouSigned && (
            <div style={mouAlertBannerStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={18} style={{ color: "var(--color-amber)", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>Digital MOU Required:</strong>{" "}
                  <span style={{ color: "var(--text-secondary)" }}>
                    Sign the in-app creator agreement to unlock verified campaign applications.
                  </span>
                </div>
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
                    <div style={{ ...statIconStyle, color: "var(--color-blue)", backgroundColor: "var(--color-blue-light)" }}>
                      <Users size={18} />
                    </div>
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
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>0 accounts connected</span>
                    )}
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={statLabelStyle}>TOTAL VERIFIED VIEWS</span>
                    <div style={{ ...statIconStyle, color: "var(--color-purple)", backgroundColor: "var(--color-purple-light)" }}>
                      <Eye size={18} />
                    </div>
                  </div>
                  <div style={statNumberStyle}>
                    {Number(analytics?.totalLifetimeViews || 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Avg: {(analytics?.recentAvgViews || 0).toLocaleString()} views / video
                  </span>
                </div>

                <div style={statCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={statLabelStyle}>AVG ENGAGEMENT RATE</span>
                    <div style={{ ...statIconStyle, color: "var(--brand-primary)", backgroundColor: "var(--brand-light)" }}>
                      <Zap size={18} />
                    </div>
                  </div>
                  <div style={{ ...statNumberStyle, color: "var(--brand-primary)" }}>
                    {analytics?.aggregateEngagementRate || 0.0}%
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--brand-primary)" }}>
                    Verified from recent media activity
                  </span>
                </div>

                <div style={statCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={statLabelStyle}>ACTIVE COLLABORATIONS</span>
                    <div style={{ ...statIconStyle, color: "var(--color-amber)", backgroundColor: "var(--color-amber-light)" }}>
                      <Handshake size={18} />
                    </div>
                  </div>
                  <div style={statNumberStyle}>
                    {collaborations.filter((c) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(c.status)).length}
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--color-blue)" }}>
                    {collaborations.length} total deals in pipeline
                  </span>
                </div>
              </div>

              {/* Quick Actions & Recent Showcase */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginTop: "28px" }}>
                {/* Recent Content Showcase */}
                <div style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                      <Film size={18} style={{ color: "var(--brand-primary)" }} />
                      Synchronized Content Highlights
                    </h3>
                    <button onClick={() => setActiveTab("content")} style={viewAllBtnStyle}>
                      View Library ({contents.length}) →
                    </button>
                  </div>

                  {contents.length === 0 ? (
                    <div style={emptyCardStyle}>
                      <Film size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                      <p style={{ margin: 0 }}>No videos or posts synchronized yet.</p>
                      <button onClick={() => setActiveTab("accounts")} style={primaryBtnSmallStyle}>
                        Connect Social Account
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {contents.slice(0, 4).map((c) => (
                        <div key={c.id} style={contentRowStyle}>
                          <img
                            src={c.thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80"}
                            alt={c.title}
                            style={thumbnailMiniStyle}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {c.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", gap: "12px", marginTop: "4px" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <Eye size={12} /> {c.viewCount.toLocaleString()}
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <Heart size={12} /> {c.likeCount.toLocaleString()}
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <MessageSquare size={12} /> {c.commentCount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <a
                            href={c.contentUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={externalLinkBtnStyle}
                          >
                            Watch <ExternalLink size={12} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Studio Quick Links */}
                <div style={cardStyle}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles size={18} style={{ color: "var(--color-amber)" }} />
                    Studio Quick Links
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                    <button onClick={() => setActiveTab("accounts")} style={quickLinkItemStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <Link2 size={16} /> Manage Connected Accounts
                      </span>
                      <span style={{ color: "var(--brand-primary)", fontWeight: "600" }}>{integrations.length} Active</span>
                    </button>
                    <button onClick={() => setActiveTab("opportunities")} style={quickLinkItemStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <Target size={16} /> Discover Brand Opportunities
                      </span>
                      <span style={{ color: "var(--color-blue)", fontWeight: "600" }}>{opportunities.length} Matched</span>
                    </button>
                    <button onClick={() => setActiveTab("mediakit")} style={quickLinkItemStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <FileText size={16} /> View Automated Media Kit
                      </span>
                      <span style={{ color: "var(--color-purple)", fontWeight: "600" }}>Live</span>
                    </button>
                    <button onClick={() => setActiveTab("collaborations")} style={quickLinkItemStyle}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <Handshake size={16} /> Track Active Deliverables
                      </span>
                      <span style={{ color: "var(--color-amber)", fontWeight: "600" }}>{collaborations.length} Deals</span>
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
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  Connected Social Accounts
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Connect your official creator accounts using standard OAuth. Lazarus never scrapes or requests passwords.
                </p>
              </div>

              {/* Provider Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                {/* YouTube */}
                {(() => {
                  const acc = integrations.find((a) => a.platform === "YOUTUBE");
                  const isSyncing = syncingAccountId === acc?.id || acc?.status === "SYNC_PENDING";
                  const isFailed = acc?.status === "SYNC_FAILED" || Boolean(acc?.syncError);
                  const isExpired = acc?.status === "EXPIRED" || acc?.status === "REVOKED";

                  return (
                    <div style={integrationCardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ ...providerIconStyle, backgroundColor: "#ef4444", color: "#ffffff" }}>
                            <Film size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>YouTube</h4>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Google OAuth 2.0 & Data API v3</span>
                          </div>
                        </div>
                        {!acc ? (
                          <span className="badge badge-gray">Not Connected</span>
                        ) : isSyncing ? (
                          <span className="badge badge-blue">Syncing...</span>
                        ) : isFailed ? (
                          <span className="badge badge-red">Sync Failed</span>
                        ) : isExpired ? (
                          <span className="badge badge-amber">Token Expired</span>
                        ) : (
                          <span className="badge badge-green">Connected</span>
                        )}
                      </div>

                      {acc ? (
                        <div>
                          <div style={connectedAccountBoxStyle}>
                            <img src={acc.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80"} alt={acc.displayName} style={miniAvatarStyle} />
                            <div style={{ overflow: "hidden" }}>
                              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{acc.displayName}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>@{acc.username}</div>
                            </div>
                          </div>

                          {acc.syncError && (
                            <div style={{
                              margin: "10px 0",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "var(--color-red)",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "6px"
                            }}>
                              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                              <span><strong>Sync Error:</strong> {acc.syncError}</span>
                            </div>
                          )}

                          {isExpired && (
                            <div style={{
                              margin: "10px 0",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              backgroundColor: "rgba(245, 158, 11, 0.1)",
                              border: "1px solid rgba(245, 158, 11, 0.25)",
                              color: "var(--color-amber)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}>
                              <AlertCircle size={14} style={{ flexShrink: 0 }} />
                              <span>OAuth grant has expired. Please reconnect your account.</span>
                            </div>
                          )}

                          <div style={{ fontSize: "12px", color: "var(--text-muted)", margin: "10px 0" }}>
                            Last Synced: {acc.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleString() : "Never"}
                          </div>

                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {isExpired ? (
                              <button onClick={() => handleConnectOAuth("youtube")} disabled={actionLoading} style={btnSmallPrimaryStyle}>
                                <Zap size={12} /> Reconnect Channel
                              </button>
                            ) : (
                              <button onClick={() => handleSyncAccount(acc.id)} disabled={actionLoading || isSyncing} style={btnSmallOutlineStyle}>
                                <RefreshCw size={12} style={isSyncing ? { animation: "spin 1s linear infinite" } : {}} />
                                {isSyncing ? "Syncing..." : "Re-Sync"}
                              </button>
                            )}
                            <button onClick={() => handleDisconnectAccount(acc.id)} disabled={actionLoading} style={btnSmallDangerStyle}>
                              <Unlink size={12} /> Disconnect
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
                            Import your YouTube subscriber counts, video library, and lifetime analytics with official Google authorization.
                          </p>
                          <button onClick={() => handleConnectOAuth("youtube")} style={connectBtnStyle}>
                            Connect YouTube Channel →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Instagram */}
                {(() => {
                  const acc = integrations.find((a) => a.platform === "INSTAGRAM");
                  const isSyncing = syncingAccountId === acc?.id || acc?.status === "SYNC_PENDING";
                  const isFailed = acc?.status === "SYNC_FAILED" || Boolean(acc?.syncError);
                  const isExpired = acc?.status === "EXPIRED" || acc?.status === "REVOKED";

                  return (
                    <div style={integrationCardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ ...providerIconStyle, background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", color: "#ffffff" }}>
                            <Film size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Instagram</h4>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Meta Graph API (Professional)</span>
                          </div>
                        </div>
                        {!acc ? (
                          <span className="badge badge-gray">Not Connected</span>
                        ) : isSyncing ? (
                          <span className="badge badge-blue">Syncing...</span>
                        ) : isFailed ? (
                          <span className="badge badge-red">Sync Failed</span>
                        ) : isExpired ? (
                          <span className="badge badge-amber">Token Expired</span>
                        ) : (
                          <span className="badge badge-green">Connected</span>
                        )}
                      </div>

                      {acc ? (
                        <div>
                          <div style={connectedAccountBoxStyle}>
                            <img src={acc.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80"} alt={acc.displayName} style={miniAvatarStyle} />
                            <div style={{ overflow: "hidden" }}>
                              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{acc.displayName}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>@{acc.username}</div>
                            </div>
                          </div>

                          {acc.syncError && (
                            <div style={{
                              margin: "10px 0",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "var(--color-red)",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "6px"
                            }}>
                              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                              <span><strong>Sync Error:</strong> {acc.syncError}</span>
                            </div>
                          )}

                          {isExpired && (
                            <div style={{
                              margin: "10px 0",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              backgroundColor: "rgba(245, 158, 11, 0.1)",
                              border: "1px solid rgba(245, 158, 11, 0.25)",
                              color: "var(--color-amber)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}>
                              <AlertCircle size={14} style={{ flexShrink: 0 }} />
                              <span>OAuth grant has expired. Please reconnect your account.</span>
                            </div>
                          )}

                          <div style={{ fontSize: "12px", color: "var(--text-muted)", margin: "10px 0" }}>
                            Last Synced: {acc.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleString() : "Never"}
                          </div>

                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {isExpired ? (
                              <button onClick={() => handleConnectOAuth("instagram")} disabled={actionLoading} style={btnSmallPrimaryStyle}>
                                <Zap size={12} /> Reconnect Account
                              </button>
                            ) : (
                              <button onClick={() => handleSyncAccount(acc.id)} disabled={actionLoading || isSyncing} style={btnSmallOutlineStyle}>
                                <RefreshCw size={12} style={isSyncing ? { animation: "spin 1s linear infinite" } : {}} />
                                {isSyncing ? "Syncing..." : "Re-Sync"}
                              </button>
                            )}
                            <button onClick={() => handleDisconnectAccount(acc.id)} disabled={actionLoading} style={btnSmallDangerStyle}>
                              <Unlink size={12} /> Disconnect
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
                            Authorize your Instagram Creator or Business account via Meta to verify followers, reels, and engagement rates.
                          </p>
                          <button onClick={() => handleConnectOAuth("instagram")} style={connectBtnStyle}>
                            Connect Instagram →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Twitch */}
                {(() => {
                  const acc = integrations.find((a) => a.platform === "TWITCH");
                  const isSyncing = syncingAccountId === acc?.id || acc?.status === "SYNC_PENDING";
                  const isFailed = acc?.status === "SYNC_FAILED" || Boolean(acc?.syncError);
                  const isExpired = acc?.status === "EXPIRED" || acc?.status === "REVOKED";

                  return (
                    <div style={integrationCardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ ...providerIconStyle, backgroundColor: "#9146ff", color: "#ffffff" }}>
                            <Film size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>Twitch</h4>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Twitch OAuth & Helix API</span>
                          </div>
                        </div>
                        {!acc ? (
                          <span className="badge badge-gray">Not Connected</span>
                        ) : isSyncing ? (
                          <span className="badge badge-blue">Syncing...</span>
                        ) : isFailed ? (
                          <span className="badge badge-red">Sync Failed</span>
                        ) : isExpired ? (
                          <span className="badge badge-amber">Token Expired</span>
                        ) : (
                          <span className="badge badge-green">Connected</span>
                        )}
                      </div>

                      {acc ? (
                        <div>
                          <div style={connectedAccountBoxStyle}>
                            <img src={acc.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80"} alt={acc.displayName} style={miniAvatarStyle} />
                            <div style={{ overflow: "hidden" }}>
                              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{acc.displayName}</div>
                              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>@{acc.username}</div>
                            </div>
                          </div>

                          {acc.syncError && (
                            <div style={{
                              margin: "10px 0",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.25)",
                              color: "var(--color-red)",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "6px"
                            }}>
                              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                              <span><strong>Sync Error:</strong> {acc.syncError}</span>
                            </div>
                          )}

                          {isExpired && (
                            <div style={{
                              margin: "10px 0",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              backgroundColor: "rgba(245, 158, 11, 0.1)",
                              border: "1px solid rgba(245, 158, 11, 0.25)",
                              color: "var(--color-amber)",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}>
                              <AlertCircle size={14} style={{ flexShrink: 0 }} />
                              <span>OAuth grant has expired. Please reconnect your account.</span>
                            </div>
                          )}

                          <div style={{ fontSize: "12px", color: "var(--text-muted)", margin: "10px 0" }}>
                            Last Synced: {acc.lastSyncedAt ? new Date(acc.lastSyncedAt).toLocaleString() : "Never"}
                          </div>

                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {isExpired ? (
                              <button onClick={() => handleConnectOAuth("twitch")} disabled={actionLoading} style={btnSmallPrimaryStyle}>
                                <Zap size={12} /> Reconnect Channel
                              </button>
                            ) : (
                              <button onClick={() => handleSyncAccount(acc.id)} disabled={actionLoading || isSyncing} style={btnSmallOutlineStyle}>
                                <RefreshCw size={12} style={isSyncing ? { animation: "spin 1s linear infinite" } : {}} />
                                {isSyncing ? "Syncing..." : "Re-Sync"}
                              </button>
                            )}
                            <button onClick={() => handleDisconnectAccount(acc.id)} disabled={actionLoading} style={btnSmallDangerStyle}>
                              <Unlink size={12} /> Disconnect
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
                            Authorize your Twitch channel to verify live broadcast history, follower metrics, and VOD statistics.
                          </p>
                          <button onClick={() => handleConnectOAuth("twitch")} style={connectBtnStyle}>
                            Connect Twitch →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Developer / Testing Notice & Quick Mock Connect */}
              <div style={testFixtureBoxStyle}>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <ShieldCheck size={18} style={{ color: "var(--brand-primary)" }} />
                    Development & Evaluation Sandboxing
                  </h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", margin: 0 }}>
                    If you do not have live Google/Meta OAuth client secrets configured, you can connect official mock fixtures to ingest verified channels, videos, and metrics directly into Neon PostgreSQL.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleConnectMock("YOUTUBE")} disabled={actionLoading} style={mockBtnStyle}>
                    <Zap size={14} /> Connect Verified YouTube Channel
                  </button>
                  <button onClick={() => handleConnectMock("INSTAGRAM")} disabled={actionLoading} style={mockBtnStyle}>
                    <Zap size={14} /> Connect Verified Instagram Profile
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
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  Verified Cross-Platform Analytics
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Data snapshot trends calculated directly from connected platform APIs.
                </p>
              </div>

              {/* Interactive Recharts Graph */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingUp size={18} style={{ color: "var(--brand-primary)" }} />
                  Audience Growth & Performance Snapshots
                </h3>

                {analytics?.historicalTrends && analytics.historicalTrends.length > 0 ? (
                  <div style={{ width: "100%", height: 300, marginTop: "16px" }}>
                    <ResponsiveContainer>
                      <LineChart data={analytics.historicalTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                        <XAxis dataKey="date" stroke={axisStroke} />
                        <YAxis stroke={axisStroke} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: tooltipBg,
                            border: `1px solid ${tooltipBorder}`,
                            borderRadius: "8px",
                            color: tooltipText
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="followers"
                          name="Audience Reach"
                          stroke={chartStroke}
                          strokeWidth={2}
                          dot={{ fill: chartStroke }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    Connect accounts and perform a sync to build historical growth curves.
                  </div>
                )}
              </div>

              {/* Platform Breakdown Table */}
              <div style={{ ...cardStyle, marginTop: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", margin: 0 }}>
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
                            <td style={{ ...tdStyle, color: "var(--brand-primary)", fontWeight: "600" }}>{p.engagementRate}%</td>
                            <td style={tdStyle}><span className="badge badge-green">Synced</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                    Unified Content Library
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
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
                        backgroundColor: contentPlatform === p ? "var(--brand-primary)" : "var(--bg-surface-raised)",
                        color: contentPlatform === p ? "#ffffff" : "var(--text-secondary)",
                        borderColor: contentPlatform === p ? "var(--brand-primary)" : "var(--border-subtle)"
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {contents.length === 0 ? (
                <div style={emptyCardStyle}>
                  <Film size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No content records found for platform: {contentPlatform}</p>
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
                          Open on Platform <ExternalLink size={12} />
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
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  Explainable Opportunity Finder
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Brand campaigns ranked deterministically based on your verified audience reach, connected platforms, and content niches.
                </p>
              </div>

              {opportunities.length === 0 ? (
                <div style={emptyCardStyle}>
                  <Target size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No open brand campaigns match your profile currently.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {opportunities.map((opp) => (
                    <div key={opp.id} style={opportunityCardStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>
                              {opp.brandName}
                            </span>
                            {opp.isBrandVerified && <span className="badge badge-blue">Verified Brand</span>}
                          </div>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginTop: "4px", margin: "4px 0 0" }}>
                            {opp.title}
                          </h3>
                        </div>

                        {/* Match Score Badge */}
                        <div style={matchScoreContainerStyle}>
                          <div style={{ fontSize: "24px", fontWeight: "800", color: opp.matchScore >= 80 ? "var(--brand-primary)" : opp.matchScore >= 60 ? "var(--color-amber)" : "var(--text-muted)" }}>
                            {opp.matchScore}%
                          </div>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "700", letterSpacing: "0.04em" }}>
                            MATCH SCORE
                          </span>
                        </div>
                      </div>

                      {/* Explainable Rationale */}
                      <div style={explanationBannerStyle}>
                        <Sparkles size={14} style={{ flexShrink: 0 }} />
                        <span><strong>Recommendation Rationale:</strong> {opp.explanation}</span>
                      </div>

                      <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "14px 0", lineHeight: 1.5 }}>
                        {opp.description}
                      </p>

                      <div style={opportunityMetaGridStyle}>
                        <div>
                          <span style={oppMetaLabelStyle}>COMPENSATION</span>
                          <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--brand-primary)" }}>
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
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Any Platform</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span style={oppMetaLabelStyle}>DELIVERABLES</span>
                          <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
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
                                Open Collaboration Deal <ArrowRight size={14} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => { setApplyingCampaign(opp); setPitchText(""); }}
                            style={applyBtnStyle}
                          >
                            Apply to Opportunity <ArrowRight size={14} />
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                    Automated Creator Media Kit
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Dynamic, shareable portfolio verified continuously against official platform APIs.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={copyMediaKitLink} style={btnSecondaryStyle}>
                    {copySuccess ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--brand-primary)" }}>
                        <Check size={14} /> Link Copied!
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <Copy size={14} /> Copy Shareable Link
                      </span>
                    )}
                  </button>
                  <a
                    href={`/media-kit/${profile?.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={btnPrimaryStyle}
                  >
                    Open Public View <ExternalLink size={14} style={{ marginLeft: "4px" }} />
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
                        <h1 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                          {mediaKit.name}
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px", margin: "4px 0 0" }}>
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
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
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
                      <div style={{ ...statNumberStyle, color: "var(--brand-primary)" }}>{mediaKit.engagementRate}%</div>
                    </div>
                  </div>

                  {/* Top Content Showcase */}
                  <div style={{ marginTop: "32px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", margin: 0 }}>
                      Top Performing Content
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "16px" }}>
                      {mediaKit.topPerformingContent.map((c) => (
                        <div key={c.id} style={mediaKitContentCardStyle}>
                          <img src={c.thumbnailUrl} alt={c.title} style={{ width: "100%", height: "140px", objectFit: "cover" }} />
                          <div style={{ padding: "12px" }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {c.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--brand-primary)", fontWeight: "600", marginTop: "4px" }}>
                              {c.viewCount.toLocaleString()} views
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)" }}>Generating media kit...</p>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 7: COLLABORATIONS & DEALS
          ========================================================== */}
          {activeTab === "collaborations" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                  Brand Collaborations & Deals
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Track deliverable submissions, revisions, and approval milestones for all active sponsorships.
                </p>
              </div>

              {collaborations.length === 0 ? (
                <div style={emptyCardStyle}>
                  <Handshake size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No active collaborations yet. Explore the Opportunity Finder to apply to open campaigns!</p>
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
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                            BRAND: {collab.campaign?.brandProfile?.companyName || "Brand Partner"}
                          </span>
                          <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginTop: "2px", margin: "2px 0 0" }}>
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
                          <span style={statLabelStyle}>UPDATED</span>
                          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                            {new Date(collab.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                        <button
                          onClick={() => navigate(`/collaborations/${collab.id}`)}
                          style={openCollabBtnStyle}
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
          MODAL: APPLY TO CAMPAIGN
      ========================================================== */}
      {applyingCampaign && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                Apply to {applyingCampaign.brandName}
              </h3>
              <button
                onClick={() => setApplyingCampaign(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Campaign: <strong style={{ color: "var(--text-primary)" }}>{applyingCampaign.title}</strong> (Budget: ₹{applyingCampaign.budget.toLocaleString()})
            </p>

            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Your Collaboration Pitch & Deliverable Plan
            </label>
            <textarea
              rows={5}
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              placeholder="Explain how you will integrate the sponsor's brand, your proposed format (e.g. dedicated review, shoutout), and timeline..."
              style={{
                width: "100%",
                padding: "10px 14px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "13.5px",
                outline: "none",
                marginBottom: "20px"
              }}
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
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                Sign Creator MOU Agreement
              </h3>
              <button
                onClick={() => setShowMouModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: 1.5 }}>
              By signing below, you acknowledge the terms of the Lazarus Creator Network, agreeing to provide authentic deliverable metrics and uphold brand collaboration guidelines.
            </p>

            <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", backgroundColor: "#ffffff" }}>
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
                style={{ fontSize: "12px", color: "var(--color-red)", background: "none", border: "none", cursor: "pointer" }}
              >
                Clear Signature
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowMouModal(false)} style={btnSecondaryStyle}>
                  Cancel
                </button>
                <button onClick={handleSaveSignature} disabled={actionLoading} style={btnPrimaryStyle}>
                  {actionLoading ? "Saving..." : "Sign & Register Agreement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// Styling Constants using Tokens
const mouAlertBannerStyle = {
  backgroundColor: "var(--color-amber-light)",
  border: "1px solid rgba(245, 158, 11, 0.3)",
  borderRadius: "var(--radius-md)",
  padding: "14px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
  flexWrap: "wrap",
  gap: "12px"
};

const signMouBtnStyle = {
  background: "var(--color-amber)",
  color: "#000000",
  fontWeight: "700",
  fontSize: "12px",
  padding: "8px 14px",
  borderRadius: "var(--radius-sm)",
  border: "none",
  cursor: "pointer"
};

const statGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px"
};

const statCardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "20px",
  boxShadow: "var(--shadow-sm)"
};

const statIconStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "var(--radius-md)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const statLabelStyle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "var(--text-muted)",
  letterSpacing: "0.05em"
};

const statNumberStyle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "var(--text-primary)",
  margin: "8px 0"
};

const platformTagStyle = {
  fontSize: "11px",
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-secondary)",
  padding: "2px 8px",
  borderRadius: "var(--radius-sm)"
};

const cardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  boxShadow: "var(--shadow-sm)"
};

const emptyCardStyle = {
  padding: "40px 20px",
  textAlign: "center",
  color: "var(--text-muted)",
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "var(--radius-md)",
  border: "1px dashed var(--border-subtle)"
};

const primaryBtnSmallStyle = {
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "8px 16px",
  borderRadius: "var(--radius-md)",
  marginTop: "12px",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 2px 8px var(--brand-glow)"
};

const viewAllBtnStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "var(--brand-primary)",
  background: "none",
  border: "none",
  cursor: "pointer"
};

const contentRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "10px",
  borderRadius: "var(--radius-md)",
  backgroundColor: "var(--bg-surface-raised)",
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
  color: "var(--brand-primary)",
  fontWeight: "600",
  padding: "6px 10px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-subtle)",
  backgroundColor: "var(--bg-surface)",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  textDecoration: "none"
};

const quickLinkItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 14px",
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  fontSize: "13px",
  color: "var(--text-primary)",
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const integrationCardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  boxShadow: "var(--shadow-sm)"
};

const providerIconStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  flexShrink: 0
};

const connectedAccountBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 12px",
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)"
};

const miniAvatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  objectFit: "cover"
};

const connectBtnStyle = {
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "10px 16px",
  borderRadius: "var(--radius-md)",
  width: "100%",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 2px 8px var(--brand-glow)"
};

const btnSmallOutlineStyle = {
  border: "1px solid var(--border-subtle)",
  backgroundColor: "var(--bg-surface)",
  color: "var(--text-secondary)",
  fontSize: "12px",
  padding: "6px 12px",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px"
};

const btnSmallDangerStyle = {
  border: "1px solid rgba(239, 68, 68, 0.3)",
  backgroundColor: "var(--bg-surface)",
  color: "var(--color-red)",
  fontSize: "12px",
  padding: "6px 12px",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px"
};

const btnSmallPrimaryStyle = {
  backgroundColor: "var(--brand-primary)",
  color: "#ffffff",
  border: "none",
  fontSize: "12px",
  fontWeight: "600",
  padding: "6px 12px",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px"
};

const testFixtureBoxStyle = {
  marginTop: "32px",
  padding: "24px",
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px dashed var(--border-medium)",
  borderRadius: "var(--radius-lg)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "16px"
};

const mockBtnStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  color: "var(--color-blue)",
  fontWeight: "600",
  fontSize: "13px",
  padding: "10px 16px",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px"
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  color: "var(--text-muted)",
  borderBottom: "1px solid var(--border-subtle)",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.04em"
};

const trStyle = {
  borderBottom: "1px solid var(--border-subtle)"
};

const tdStyle = {
  padding: "14px 12px",
  color: "var(--text-primary)"
};

const filterPillStyle = {
  padding: "6px 14px",
  borderRadius: "var(--radius-full)",
  fontSize: "12px",
  fontWeight: "600",
  border: "1px solid var(--border-subtle)",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const contentCardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  overflow: "hidden",
  boxShadow: "var(--shadow-sm)"
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
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  color: "#ffffff",
  fontSize: "10px",
  fontWeight: "700",
  padding: "2px 8px",
  borderRadius: "4px"
};

const contentCardTitleStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "var(--text-primary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  margin: 0
};

const contentMetricsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "8px",
  marginTop: "12px",
  padding: "8px",
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "6px"
};

const metricLabelStyle = {
  fontSize: "9px",
  color: "var(--text-muted)",
  fontWeight: "700"
};

const metricValStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "var(--text-primary)",
  marginTop: "2px"
};

const watchOnPlatformBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  marginTop: "14px",
  fontSize: "12px",
  fontWeight: "600",
  color: "var(--brand-primary)",
  padding: "8px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-subtle)",
  backgroundColor: "var(--bg-surface-raised)",
  textDecoration: "none"
};

const opportunityCardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  boxShadow: "var(--shadow-sm)"
};

const matchScoreContainerStyle = {
  textAlign: "center",
  padding: "8px 16px",
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)"
};

const explanationBannerStyle = {
  marginTop: "12px",
  padding: "10px 14px",
  backgroundColor: "var(--brand-light)",
  border: "1px solid rgba(16, 185, 129, 0.25)",
  borderRadius: "var(--radius-sm)",
  fontSize: "13px",
  color: "var(--brand-primary)",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const opportunityMetaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "16px",
  padding: "14px",
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)"
};

const oppMetaLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "var(--text-muted)",
  letterSpacing: "0.04em"
};

const nicheBadgeStyle = {
  fontSize: "11px",
  padding: "2px 8px",
  borderRadius: "4px",
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-secondary)"
};

const applyBtnStyle = {
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "10px 18px",
  borderRadius: "var(--radius-md)",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  boxShadow: "0 2px 8px var(--brand-glow)"
};

const openCollabBtnStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  color: "var(--color-blue)",
  fontWeight: "600",
  fontSize: "13px",
  padding: "8px 14px",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px"
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

const btnPrimaryStyle = {
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "var(--radius-md)",
  display: "inline-flex",
  alignItems: "center",
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  boxShadow: "0 2px 8px var(--brand-glow)"
};

const mediaKitContainerStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "32px",
  boxShadow: "var(--shadow-md)"
};

const mediaKitHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "24px",
  borderBottom: "1px solid var(--border-subtle)",
  flexWrap: "wrap",
  gap: "16px"
};

const mediaKitAvatarStyle = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--color-blue) 100%)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: "800",
  flexShrink: 0
};

const mediaKitStatsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "20px",
  marginTop: "24px"
};

const mediaKitStatItemStyle = {
  padding: "16px",
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)"
};

const mediaKitContentCardStyle = {
  backgroundColor: "var(--bg-surface-raised)",
  borderRadius: "var(--radius-md)",
  overflow: "hidden",
  border: "1px solid var(--border-subtle)"
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
  maxWidth: "560px",
  padding: "28px",
  boxShadow: "var(--shadow-xl)"
};
