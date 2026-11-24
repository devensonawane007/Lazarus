import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

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
          <div style={logoIconStyle}>⚡</div>
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.02em" }}>
            LAZARUS <span style={{ color: "#10b981", fontSize: "12px" }}>VERIFIED MEDIA KIT</span>
          </span>
        </div>

        <button onClick={() => navigate("/login?role=brand&mode=register")} style={brandJoinBtnStyle}>
          Work with Creators →
        </button>
      </nav>

      {/* Main Container */}
      <main style={mainContentStyle}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#94a3b8" }}>
            Loading verified creator media kit...
          </div>
        ) : !mediaKit ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#64748b" }}>
            <h2>Media Kit Not Found</h2>
            <p style={{ marginTop: "8px" }}>The requested creator profile does not exist or has not verified any social accounts yet.</p>
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
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#f8fafc" }}>
                      {mediaKit.name}
                    </h1>
                    <span className="badge badge-green">Verified Creator</span>
                  </div>

                  <p style={{ color: "#cbd5e1", fontSize: "15px", marginTop: "6px", maxWidth: "600px", lineHeight: 1.5 }}>
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
                <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                  {mediaKit.verifiedPlatforms.map((p, idx) => (
                    <a
                      key={idx}
                      href={p.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={platformLinkCardStyle}
                    >
                      <span style={{ fontSize: "16px" }}>{p.platform === "YOUTUBE" ? "▶️" : p.platform === "INSTAGRAM" ? "📸" : "🟣"}</span>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#f8fafc" }}>{p.displayName}</div>
                        <div style={{ fontSize: "11px", color: "#10b981" }}>{p.followerCount.toLocaleString()} {p.platform === "YOUTUBE" ? "subs" : "followers"}</div>
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
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Cross-platform authorized total</span>
              </div>

              <div style={statCardStyle}>
                <span style={statLabelStyle}>LIFETIME VIDEO VIEWS</span>
                <div style={statNumberStyle}>{Number(mediaKit.totalLifetimeViews).toLocaleString()}</div>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Across all published media</span>
              </div>

              <div style={statCardStyle}>
                <span style={statLabelStyle}>AVG VIEWS / VIDEO</span>
                <div style={{ ...statNumberStyle, color: "#38bdf8" }}>{mediaKit.avgViewsPerVideo.toLocaleString()}</div>
                <span style={{ fontSize: "12px", color: "#38bdf8" }}>Calculated on recent uploads</span>
              </div>

              <div style={statCardStyle}>
                <span style={statLabelStyle}>ENGAGEMENT RATE</span>
                <div style={{ ...statNumberStyle, color: "#10b981" }}>{mediaKit.engagementRate}%</div>
                <span style={{ fontSize: "12px", color: "#10b981" }}>Audience interaction velocity</span>
              </div>
            </div>

            {/* Top Performing Showcase */}
            <div style={{ marginTop: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                🔥 Featured Content & Videos
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
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#10b981" }}>
                          👁️ {c.viewCount.toLocaleString()} views
                        </span>
                        <a
                          href={c.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={watchLinkStyle}
                        >
                          Watch ↗
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
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>
                  🤝 Verified Sponsor Collaborations
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {mediaKit.pastCollaborations.map((collab, idx) => (
                    <div key={idx} style={collabCardStyle}>
                      <div>
                        <strong>{collab.brandName}</strong>
                        <div style={{ fontSize: "13px", color: "#94a3b8" }}>{collab.campaignTitle}</div>
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
  color: "var(--text-main)"
};

const navStyle = {
  height: "72px",
  padding: "0 36px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid var(--border-subtle)",
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  backdropFilter: "blur(12px)",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const logoIconStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px"
};

const brandJoinBtnStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "13px",
  padding: "8px 16px",
  borderRadius: "var(--radius-md)"
};

const mainContentStyle = {
  maxWidth: "1080px",
  margin: "0 auto",
  padding: "40px 24px"
};

const headerCardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "32px"
};

const avatarStyle = {
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #10b981 0%, #38bdf8 100%)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "32px",
  fontWeight: "800"
};

const nicheBadgeStyle = {
  fontSize: "11px",
  padding: "3px 10px",
  borderRadius: "var(--radius-full)",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  color: "#cbd5e1"
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
  backgroundColor: "rgba(10, 17, 34, 0.5)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "8px"
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginTop: "24px"
};

const statCardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "20px"
};

const statLabelStyle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "var(--text-dim)",
  letterSpacing: "0.06em"
};

const statNumberStyle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#f8fafc",
  margin: "6px 0"
};

const contentCardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  overflow: "hidden"
};

const thumbnailStyle = {
  width: "100%",
  height: "150px",
  objectFit: "cover"
};

const contentTitleStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#f8fafc",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const watchLinkStyle = {
  fontSize: "12px",
  color: "#10b981",
  fontWeight: "600"
};

const collabCardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 18px",
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "8px"
};
