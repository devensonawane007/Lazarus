import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);

  // 🤖 AGENTIC AI (REAL GEMINI)
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

    } catch (err) {
      alert("AI error");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h1>🏠 Lazarus Creator Home</h1>

      <p>
        Welcome <strong>{user?.name}</strong> 👋
        <br />
        Your AI co-pilot for content creation & funding
      </p>

      <hr />

      {/* 🔍 IDEA SEARCH */}
      <h3>🔍 Ask the Agentic AI</h3>

      <input
        type="text"
        placeholder="Eg: travel vlogging, fitness, personal finance"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "10px" }}
      />

      <br /><br />

      <button onClick={runAgent}>
        🤖 Generate Content Ideas
      </button>

      <br /><br />

      {loading && <p>🧠 Agent thinking...</p>}

      {/* 💡 AI RESULTS */}
      {aiResult && (
        <>
          <h3>💡 AI-Generated Strategy</h3>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f9f9f9",
              padding: "20px",
              borderRadius: "8px",
              lineHeight: "1.5",
              border: "1px solid #ddd"
            }}
          >
            {aiResult}
          </pre>

          <br />

          <button onClick={() => navigate("/create-project")}>
            🚀 Create Project from AI Insight
          </button>
        </>
      )}

      <hr />

      {/* 🎯 GUIDED ACTIONS */}
      <h3>🎯 What would you like to do?</h3>

      <button onClick={() => navigate("/creator")}>
        Go to Creator Dashboard
      </button>

      <br /><br />

      <button onClick={() => navigate("/creator-profile")}>
        View Public Profile
      </button>
    </div>
  );
}
