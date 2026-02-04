import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/creator-hero.jpg";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runAgent = async () => {
    if (!query) return alert("Enter a niche");

    setLoading(true);
    setAiResult("");

    try {
      const res = await fetch("http://localhost:5000/api/ai/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      setAiResult(data.ai_output);
    } catch {
      alert("AI error");
    }

    setLoading(false);
  };

  return (
    <div style={page}>

      {/* 🍎 NAVBAR */}
      <nav style={nav}>
        <h3 style={{ fontWeight: 600 }}>Lazarus</h3>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ color: "#555" }}>👋 {user?.name}</span>
          <button style={ghostBtn} onClick={() => navigate("/creator")}>
            Dashboard
          </button>
        </div>
      </nav>

      {/* 🍎 HERO SECTION */}
      <section style={hero}>
        <div>
          <h1 style={heroTitle}>
            Build content.<br />Get funded.<br />Scale faster.
          </h1>

          <p style={heroText}>
            Lazarus is your AI co-pilot for content ideas, monetization
            strategy, and creator funding.
          </p>

          <div style={{ marginTop: "30px" }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. travel vlogging, fitness, finance"
              style={input}
            />

            <br /><br />

            <button style={primaryBtn} onClick={runAgent}>
              Generate with AI
            </button>

            {loading && <p style={{ marginTop: 15 }}>Thinking…</p>}
          </div>
        </div>

        <img
          src={heroImg}
          alt="Creator workspace"
          style={heroImage}
        />
      </section>

      {/* 🍎 AI RESULT */}
      {aiResult && (
        <section style={resultSection}>
          <h2 style={{ marginBottom: "20px" }}>AI Strategy</h2>

          <div style={resultCard}>
            <pre style={resultText}>{aiResult}</pre>
          </div>

          <button
            style={{ ...primaryBtn, marginTop: "30px" }}
            onClick={() => navigate("/create-project")}
          >
            Create Project from Insight
          </button>
        </section>
      )}

      {/* 🍎 ACTION CARDS */}
      <section style={actions}>
        <ActionCard
          title="Creator Dashboard"
          desc="Manage projects & funding"
          onClick={() => navigate("/creator")}
        />
        <ActionCard
          title="Public Profile"
          desc="Showcase your portfolio"
          onClick={() => navigate("/creator-profile")}
        />
        <ActionCard
          title="New Project"
          desc="Launch a funded idea"
          onClick={() => navigate("/create-project")}
        />
      </section>

    </div>
  );
}

/* 🔹 COMPONENT */
function ActionCard({ title, desc, onClick }) {
  return (
    <div style={card}>
      <h4>{title}</h4>
      <p style={{ color: "#666" }}>{desc}</p>
      <button style={ghostBtn} onClick={onClick}>
        Open →
      </button>
    </div>
  );
}

/* 🍎 STYLES */

const page = {
  background: "#f5f5f7",
  minHeight: "100vh",
  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif"
};

const nav = {
  display: "flex",
  justifyContent: "space-between",
  padding: "20px 60px",
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(10px)",
  position: "sticky",
  top: 0,
  zIndex: 10
};

const hero = {
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr",
  gap: "60px",
  padding: "80px 60px",
  alignItems: "center"
};

const heroTitle = {
  fontSize: "48px",
  fontWeight: 700,
  lineHeight: 1.1
};

const heroText = {
  fontSize: "18px",
  color: "#555",
  marginTop: "20px",
  maxWidth: "500px"
};

const heroImage = {
  width: "100%",
  borderRadius: "20px",
  boxShadow: "0 30px 60px rgba(0,0,0,0.15)"
};

const input = {
  padding: "14px 16px",
  width: "100%",
  maxWidth: "420px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  fontSize: "16px"
};

const primaryBtn = {
  background: "linear-gradient(180deg,#0071e3,#005ac1)",
  color: "#fff",
  padding: "14px 28px",
  borderRadius: "999px",
  border: "none",
  fontSize: "16px",
  cursor: "pointer"
};

const ghostBtn = {
  background: "transparent",
  border: "1px solid #ccc",
  padding: "10px 18px",
  borderRadius: "999px",
  cursor: "pointer"
};

const resultSection = {
  padding: "80px 60px",
  background: "#fff"
};

const resultCard = {
  background: "#f5f5f7",
  padding: "30px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const resultText = {
  whiteSpace: "pre-wrap",
  fontSize: "15px",
  lineHeight: 1.6
};

const actions = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))",
  gap: "30px",
  padding: "80px 60px"
};

const card = {
  background: "#fff",
  padding: "30px",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};
