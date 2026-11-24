import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      {/* Navigation */}
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={logoIconStyle}>⚡</div>
          <span style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.02em" }}>
            LAZARUS <span style={{ color: "#10b981", fontSize: "14px", fontWeight: "700" }}>V3</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <button onClick={() => navigate("/login")} style={ghostBtnStyle}>
            Sign In
          </button>
          <button onClick={() => navigate("/login?mode=register")} style={primaryBtnStyle}>
            Get Started Free →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={heroSectionStyle}>
        <div style={pillAnnouncementStyle}>
          🚀 The Creator Economy Operating System & Verified Brand Network
        </div>

        <h1 style={heroHeadlineStyle}>
          Stop pitching with static PDFs.<br />
          <span style={gradientTextStyle}>Run your creator business on live verified data.</span>
        </h1>

        <p style={heroSubtextStyle}>
          Connect your official YouTube, Instagram, and Twitch channels. Lazarus ingests verified metrics, generates dynamic media kits, matches you with high-paying brand campaigns, and manages collaboration deliverables in one workspace.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "32px", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/login?role=creator&mode=register")} style={heroCtaStyle}>
            🎨 Join as Creator
          </button>
          <button onClick={() => navigate("/login?role=brand&mode=register")} style={heroSecondaryCtaStyle}>
            🏢 Launch as Brand Partner
          </button>
        </div>

        {/* Integration Badges */}
        <div style={integrationBannerStyle}>
          <span style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>
            OFFICIAL PLATFORM API CONNECTORS
          </span>
          <div style={{ display: "flex", gap: "32px", alignItems: "center", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={platformBadgeStyle}>▶️ YouTube Data & Analytics API</div>
            <div style={platformBadgeStyle}>📸 Instagram Meta Graph API</div>
            <div style={platformBadgeStyle}>🟣 Twitch Helix API</div>
          </div>
        </div>
      </header>

      {/* Feature Grid */}
      <section style={featureGridSectionStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#f8fafc" }}>
            Engineered for Creators & Professional Brands
          </h2>
          <p style={{ color: "#94a3b8", marginTop: "8px" }}>
            Zero fake numbers. Zero manual spreadsheets. Pure verified execution.
          </p>
        </div>

        <div style={gridStyle}>
          <div style={featureCardStyle}>
            <div style={featureIconStyle}>📊</div>
            <h3 style={featureTitleStyle}>Unified Performance Analytics</h3>
            <p style={featureTextStyle}>
              Aggregates audience reach, video views, and real engagement rates across connected accounts with historical trend snapshots.
            </p>
          </div>

          <div style={featureCardStyle}>
            <div style={featureIconStyle}>📄</div>
            <h3 style={featureTitleStyle}>Auto-Generated Media Kit</h3>
            <p style={featureTextStyle}>
              Never manually update follower counts again. Shareable, live media kits with verified badges and top-performing content showcases.
            </p>
          </div>

          <div style={featureCardStyle}>
            <div style={featureIconStyle}>🎯</div>
            <h3 style={featureTitleStyle}>Explainable Opportunity Finder</h3>
            <p style={featureTextStyle}>
              Deterministic matching engine scoring campaigns on niche compatibility, required platforms, reach tier, and engagement quality.
            </p>
          </div>

          <div style={featureCardStyle}>
            <div style={featureIconStyle}>🤝</div>
            <h3 style={featureTitleStyle}>10-Stage Collaboration Lifecycle</h3>
            <p style={featureTextStyle}>
              From discovery and application through deliverable submission, revision requests, approvals, and contract fulfillment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={{ color: "#64748b", fontSize: "13px" }}>
          © 2026 Lazarus Creator Studio & Opportunity Network. Connected to Neon Hosted PostgreSQL & Official Platform APIs.
        </div>
      </footer>
    </div>
  );
}

// Styles
const containerStyle = {
  backgroundColor: "var(--bg-canvas)",
  minHeight: "100vh",
  color: "var(--text-main)"
};

const navStyle = {
  height: "80px",
  padding: "0 40px",
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
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px"
};

const ghostBtnStyle = {
  color: "#94a3b8",
  fontWeight: "600",
  fontSize: "14px",
  padding: "8px 16px"
};

const primaryBtnStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "14px",
  padding: "10px 20px",
  borderRadius: "var(--radius-md)",
  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)"
};

const heroSectionStyle = {
  padding: "100px 24px 60px",
  textAlign: "center",
  maxWidth: "960px",
  margin: "0 auto"
};

const pillAnnouncementStyle = {
  display: "inline-block",
  padding: "6px 16px",
  borderRadius: "var(--radius-full)",
  backgroundColor: "rgba(16, 185, 129, 0.1)",
  border: "1px solid rgba(16, 185, 129, 0.25)",
  color: "#10b981",
  fontSize: "12px",
  fontWeight: "700",
  marginBottom: "24px",
  letterSpacing: "0.02em"
};

const heroHeadlineStyle = {
  fontSize: "46px",
  fontWeight: "800",
  lineHeight: 1.15,
  letterSpacing: "-0.03em",
  color: "#f8fafc"
};

const gradientTextStyle = {
  background: "linear-gradient(135deg, #34d399 0%, #10b981 50%, #38bdf8 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent"
};

const heroSubtextStyle = {
  fontSize: "17px",
  color: "#94a3b8",
  marginTop: "20px",
  lineHeight: 1.6,
  maxWidth: "760px",
  margin: "20px auto 0"
};

const heroCtaStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "16px",
  padding: "14px 28px",
  borderRadius: "var(--radius-md)",
  boxShadow: "0 8px 24px rgba(16, 185, 129, 0.4)"
};

const heroSecondaryCtaStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  color: "#f8fafc",
  fontWeight: "700",
  fontSize: "16px",
  padding: "14px 28px",
  borderRadius: "var(--radius-md)"
};

const integrationBannerStyle = {
  marginTop: "60px",
  padding: "32px",
  backgroundColor: "rgba(19, 29, 53, 0.4)",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--border-subtle)"
};

const platformBadgeStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#cbd5e1",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const featureGridSectionStyle = {
  padding: "80px 32px",
  maxWidth: "1140px",
  margin: "0 auto"
};

const sectionHeaderStyle = {
  textAlign: "center",
  marginBottom: "48px"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "24px"
};

const featureCardStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "28px"
};

const featureIconStyle = {
  fontSize: "28px",
  marginBottom: "16px"
};

const featureTitleStyle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#f8fafc",
  marginBottom: "8px"
};

const featureTextStyle = {
  fontSize: "14px",
  color: "#94a3b8",
  lineHeight: 1.5
};

const footerStyle = {
  padding: "40px",
  borderTop: "1px solid var(--border-subtle)",
  textAlign: "center"
};
