import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import ThemeToggle from "../components/ui/ThemeToggle";
import {
  Zap,
  Users,
  Eye,
  Film,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Handshake,
  Sparkles
} from "lucide-react";

export default function PublicMediaKit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mediaKit, setMediaKit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMediaKit();
  }, [id]);

  const loadMediaKit = async () => {
    setLoading(true);
    try {
      const data = await api.creator.getPublicMediaKit(id);
      setMediaKit(data?.mediaKit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainerStyle}>
      {/* Top Navbar */}
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={logoIconStyle}>
            <Zap size={18} color="#ffffff" />
          </div>
          <span style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            LAZARUS <span style={{ color: "var(--brand-primary)", fontSize: "11px", fontWeight: "700", marginLeft: "4px" }}>VERIFIED MEDIA KIT</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ThemeToggle />
          <button onClick={() => navigate("/login?role=brand&mode=register")} style={brandJoinBtnStyle}>
            Work with Creators <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main style={mainContentStyle}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)" }}>
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
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}>Loading verified creator media kit...</p>
          </div>
        ) : !mediaKit ? (
          <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
            <h2 style={{ color: "var(--text-primary)", fontSize: "22px" }}>Media Kit Not Found</h2>
            <p style={{ marginTop: "8px", fontSize: "14px" }}>The requested creator profile does not exist or has not verified any social accounts yet.</p>
          </div>
        ) : (
          <div>
            {/* Creator Header Card */}
            <div style={headerCardStyle}>
              <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={avatarStyle}>
                  {mediaKit.name[0].toUpperCase()}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                      {mediaKit.name}
                    </h1>
                    <span className="badge badge-green">Verified Creator</span>
                  </div>

                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px", maxWidth: "600px", lineHeight: 1.5, margin: "6px 0 0" }}>
                    {mediaKit.bio}
                  </p>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
                    {mediaKit.niches.map((n) => (
                      <span key={n} style={nicheBadgeStyle}>{n}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verified Platforms */}
              <div style={verifiedPlatformsBoxStyle}>
                <span style={statLabelStyle}>CONNECTED & VERIFIED CHANNELS</span>
                <div style={{ display: "flex", gap: "12px", marginTop: "10px", flexWrap: "wrap" }}>
                  {mediaKit.verifiedPlatforms.map((p, idx) => (
                    <a
                      key={idx}
                      href={p.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={platformLinkCardStyle}
                    >
                      <Film size={18} style={{ color: "var(--brand-primary)" }} />
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-primary)" }}>{p.displayName}</div>
                        <div style={{ fontSize: "11px", color: "var(--brand-primary)", fontWeight: "600" }}>{p.followerCount.toLocaleString()} {p.platform === "YOUTUBE" ? "subs" : "followers"}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Summary Metrics */}
            <div style={statsGridStyle}>
              <div style={statCardStyle}>
                <span style={statLabelStyle}>TOTAL VERIFIED AUDIENCE</span>
                <div style={statNumberStyle}>{mediaKit.totalAudience.toLocaleString()}</div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Cross-platform authorized total</span>
              </div>

              <div style={statCardStyle}>
                <span style={statLabelStyle}>LIFETIME VIDEO VIEWS</span>
                <div style={statNumberStyle}>{Number(mediaKit.totalLifetimeViews).toLocaleString()}</div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Across all published media</span>
              </div>

              <div style={statCardStyle}>
                <span style={statLabelStyle}>AVG VIEWS / VIDEO</span>
                <div style={{ ...statNumberStyle, color: "var(--color-blue)" }}>{mediaKit.avgViewsPerVideo.toLocaleString()}</div>
                <span style={{ fontSize: "12px", color: "var(--color-blue)" }}>Calculated on recent uploads</span>
              </div>

              <div style={statCardStyle}>
                <span style={statLabelStyle}>ENGAGEMENT RATE</span>
                <div style={{ ...statNumberStyle, color: "var(--brand-primary)" }}>{mediaKit.engagementRate}%</div>
                <span style={{ fontSize: "12px", color: "var(--brand-primary)" }}>Audience interaction velocity</span>
              </div>
            </div>

            {/* Top Performing Showcase */}
            <div style={{ marginTop: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px" }}>
                Featured Content & Videos
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                {mediaKit.topPerformingContent.map((c) => (
                  <div key={c.id} style={contentCardStyle}>
                    <img src={c.thumbnailUrl} alt={c.title} style={thumbnailStyle} />
                    <div style={{ padding: "16px" }}>
                      <h4 style={contentTitleStyle} title={c.title}>
                        {c.title}
                      </h4>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--brand-primary)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Eye size={14} /> {c.viewCount.toLocaleString()} views
                        </span>
                        <a
                          href={c.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={watchLinkStyle}
                        >
                          Watch <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Collaborations if any */}
            {mediaKit.pastCollaborations && mediaKit.pastCollaborations.length > 0 && (
              <div style={{ marginTop: "40px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px", margin: "0 0 16px" }}>
                  Verified Sponsor Collaborations
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {mediaKit.pastCollaborations.map((collab, idx) => (
                    <div key={idx} style={collabCardStyle}>
                      <div>
                        <strong style={{ color: "var(--text-primary)" }}>{collab.brandName}</strong>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{collab.campaignTitle}</div>
                      </div>
                      <span className="badge badge-green">Fulfillment Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Styles
const pageContainerStyle = {
  backgroundColor: "var(--bg-canvas)",
  minHeight: "100vh",
  color: "var(--text-primary)"
};

const navStyle = {
  height: "70px",
  padding: "0 36px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid var(--border-subtle)",
  backgroundColor: "var(--bg-surface)",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const logoIconStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "var(--radius-sm)",
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px var(--brand-glow)"
};

const brandJoinBtnStyle = {
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "8px 16px",
  borderRadius: "var(--radius-md)",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  boxShadow: "0 2px 8px var(--brand-glow)"
};

const mainContentStyle = {
  maxWidth: "1080px",
  margin: "0 auto",
  padding: "40px 24px"
};

const headerCardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "32px",
  boxShadow: "var(--shadow-sm)"
};

const avatarStyle = {
  width: "76px",
  height: "76px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--color-blue) 100%)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  fontWeight: "800",
  flexShrink: 0
};

const nicheBadgeStyle = {
  fontSize: "11px",
  padding: "3px 10px",
  borderRadius: "var(--radius-full)",
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-secondary)"
};

const verifiedPlatformsBoxStyle = {
  marginTop: "24px",
  paddingTop: "20px",
  borderTop: "1px solid var(--border-subtle)"
};

const platformLinkCardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "8px 14px",
  backgroundColor: "var(--bg-surface-raised)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  textDecoration: "none"
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginTop: "24px"
};

const statCardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "20px",
  boxShadow: "var(--shadow-sm)"
};

const statLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "var(--text-muted)",
  letterSpacing: "0.06em"
};

const statNumberStyle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "var(--text-primary)",
  margin: "6px 0"
};

const contentCardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  overflow: "hidden",
  boxShadow: "var(--shadow-sm)"
};

const thumbnailStyle = {
  width: "100%",
  height: "150px",
  objectFit: "cover"
};

const contentTitleStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "var(--text-primary)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  margin: 0
};

const watchLinkStyle = {
  fontSize: "12px",
  color: "var(--brand-primary)",
  fontWeight: "600",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  textDecoration: "none"
};

const collabCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 18px",
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-sm)"
};
