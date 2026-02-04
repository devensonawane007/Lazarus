import { useEffect, useState } from "react";
import AgenticAIMOU from "../components/AgenticAIMOU";

const API = "http://localhost:5000";

export default function InvestorDashboard() {
  const [projects, setProjects] = useState([]);
  const [amount, setAmount] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const mouSigned =
    localStorage.getItem(`mou_signed_${user?.role}`) === "true";

  // Load all projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API}/api/projects`);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      alert("Failed to load projects");
    }
  };

  const invest = async (projectId) => {
    if (!mouSigned) {
      alert("You must sign the Agentic AI MOU before investing");
      return;
    }

    if (!amount) return alert("Enter amount");

    try {
      const res = await fetch(`${API}/api/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          amount,
        }),
      });

      const data = await res.json();
      alert(`Investment successful! Total raised: ₹${data.totalRaised}`);
      setAmount("");
    } catch (err) {
      alert("Investment failed");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>💰 Investor Dashboard</h2>

      {/* =====================
          Agentic AI + MOU
      ====================== */}
      <AgenticAIMOU />

      <hr />

      {/* =====================
          Projects
      ====================== */}
      {projects.length === 0 && <p>No projects available</p>}

      {projects.map((project) => (
        <div
          key={project.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            opacity: mouSigned ? 1 : 0.5,
          }}
        >
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p>
            <strong>Target:</strong> ₹{project.funding_target}
          </p>

          <input
            type="number"
            placeholder="Investment Amount"
            value={amount}
            disabled={!mouSigned}
            onChange={(e) => setAmount(e.target.value)}
          />

          <br />
          <br />

          <button
            onClick={() => invest(project.id)}
            disabled={!mouSigned}
          >
            Invest
          </button>

          {!mouSigned && (
            <p style={{ color: "red", marginTop: "10px" }}>
              ⚠ Sign MOU to enable investing
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
