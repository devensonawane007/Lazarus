import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import heroImg from "../assets/creator-hero.jpg";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runAgent = async () => {
    if (!query) return alert("Enter a creator niche");

    setLoading(true);
    setAiResult("");

    try {
      const data = await api.ai.generateIdeas(query);
      setAiResult(data.ai_output);
    } catch {
      alert("AI generation service encountered an error.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    navigate("/");
  };

  return (
    <div style={page}>

      {/* NAVBAR */}
      <nav style={nav}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3 style={{ fontWeight: 800, margin: 0, fontSize: "20px", color: "#111827" }}>
            Lazarus <span style={{ color: "#059669" }}>V2</span>
          </h3>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>👋 {user?.name || "Creator"}</span>
          <button style={ghostBtn} onClick={() => navigate("/creator")}>
            Dashboard
          </button>
          <button style={logoutNavBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={hero}>
        <div>
          <h1 style={heroTitle}>
            Build content.<br />Get funded.<br />Scale faster.
          </h1>

          <p style={heroText}>
            Lazarus is your AI co-pilot for viral content ideas, monetization strategy, and milestone-backed escrow creator funding.
          </p>

          <div style={{ marginTop: "28px" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. AI tools, fitness, urban exploration, crypto"
              style={input}
            />

            <br /><br />

            <button style={primaryBtn} onClick={runAgent} disabled={loading}>
              {loading ? "Thinking..." : "✨ Generate with Gemini AI"}
            </button>
          </div>
        </div>

        <img
          src={heroImg}
          alt="Creator workspace"
          style={heroImage}
        />
      </section>

      {/* AI RESULT */}
      {aiResult && (
        <section style={resultSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "22px", color: "#111827" }}>🤖 Gemini Content Blueprint</h2>
            <span style={{ fontSize: "12px", backgroundColor: "#ecfdf5", color: "#059669", padding: "4px 10px", borderRadius: "12px", fontWeight: "600" }}>
              Niche: {query}
            </span>
          </div>

          <div style={resultCard}>
            <pre style={resultText}>{aiResult}</pre>
          </div>

          <button
            style={{ ...primaryBtn, marginTop: "24px" }}
            onClick={() => navigate("/create-project")}
          >
            🎬 Launch Project from this Blueprint →
          </button>
        </section>
      )}

      {/* FOOTER */}
      <footer style={footer}>
        <p>© 2026 Lazarus Creator Escrow Platform. Built with React, Vite, Express, Prisma & Neon PostgreSQL.</p>
      </footer>
    </div>
  );
}

const page = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  backgroundColor: "#f9fafb",
  minHeight: "100vh",
  color: "#1d1d1f"
};

const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 40px",
  backgroundColor: "#ffffff",
  borderBottom: "1px solid #e5e7eb"
};

const ghostBtn = {
  background: "transparent",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  padding: "8px 16px",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "14px",
  color: "#374151"
};

const logoutNavBtn = {
  background: "none",
  border: "none",
  color: "#dc2626",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500"
};

const hero = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "60px 20px 40px 20px",
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: "40px",
  alignItems: "center"
};

const heroTitle = {
  fontSize: "52px",
  fontWeight: "800",
  lineHeight: "1.1",
  letterSpacing: "-0.03em",
  color: "#111827",
  margin: "0 0 16px 0"
};

const heroText = {
  fontSize: "18px",
  color: "#4b5563",
  lineHeight: "1.5",
  margin: 0
};

const heroImage = {
  width: "100%",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
  objectFit: "cover",
  maxHeight: "380px"
};

const input = {
  width: "100%",
  maxWidth: "420px",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box"
};

const primaryBtn = {
  backgroundColor: "#059669",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  padding: "14px 24px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(5,150,105,0.25)"
};

const resultSection = {
  maxWidth: "800px",
  margin: "40px auto 60px auto",
  padding: "0 20px"
};

const resultCard = {
  background: "#ffffff",
  padding: "24px",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
};

const resultText = {
  whiteSpace: "pre-wrap",
  fontFamily: "inherit",
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#374151",
  margin: 0
};

const footer = {
  textAlign: "center",
  padding: "30px 20px",
  borderTop: "1px solid #e5e7eb",
  color: "#9ca3af",
  fontSize: "13px"
};
