import { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function InvestorDashboard() {
  const [projects, setProjects] = useState([]);
  const [amount, setAmount] = useState("");
  const [revenue, setRevenue] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API}/api/projects`);
      const data = await res.json();
      setProjects(data);
    } catch {
      alert("Failed to load projects");
    }
  };

  const invest = async (projectId) => {
    if (!amount) return alert("Enter investment amount");

    const res = await fetch(`${API}/api/contribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        amount
      })
    });

    const data = await res.json();
    alert(`Investment successful! Total raised: ₹${data.totalRaised}`);
    setAmount("");
  };

  const simulateRevenue = async () => {
    if (!revenue || !selectedProject) return;

    const res = await fetch(`${API}/api/simulate-revenue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: selectedProject.id,
        revenue_amount: revenue
      })
    });

    const data = await res.json();
    setPayouts(data.payouts || []);
  };

  return (
    <div
      style={{
        padding: "40px",
        background: "#f5f5f7",
        minHeight: "100vh"
      }}
    >
      <h1 style={{ fontWeight: 600 }}>💰 Investor Dashboard</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Explore creator projects, invest transparently, and simulate returns.
      </p>

      {/* PROJECT LIST */}
      {projects.map((project) => (
        <div
          key={project.id}
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
          }}
        >
          <h2>{project.title}</h2>
          <p style={{ color: "#555" }}>{project.description}</p>

          {/* CREATOR INFO */}
          <div
            style={{
              background: "#f5f5f7",
              padding: "14px",
              borderRadius: "12px",
              marginTop: "12px"
            }}
          >
            <strong>👤 Creator</strong>
            <div>Name: {project.creator?.name}</div>
            <div>Role: {project.creator?.role}</div>
          </div>

          <p style={{ marginTop: "12px" }}>
            🎯 Funding Target: <strong>₹{project.funding_target}</strong>
          </p>

          {/* INVEST */}
          <div style={{ marginTop: "12px" }}>
            <input
              type="number"
              placeholder="Investment amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                marginRight: "10px"
              }}
            />

            <button
              onClick={() => invest(project.id)}
              style={{
                padding: "10px 18px",
                borderRadius: "12px",
                background: "#0071e3",
                color: "#fff",
                border: "none",
                cursor: "pointer"
              }}
            >
              Invest
            </button>
          </div>

          {/* SIMULATE */}
          <div style={{ marginTop: "14px" }}>
            <button
              onClick={() => {
                setSelectedProject(project);
                setPayouts([]);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#0071e3",
                cursor: "pointer",
                fontWeight: 500
              }}
            >
              📈 Simulate Revenue
            </button>
          </div>
        </div>
      ))}

      {/* REVENUE SIMULATION */}
      {selectedProject && (
        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "18px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
          }}
        >
          <h2>📊 Revenue Simulation</h2>
          <p>
            Project: <strong>{selectedProject.title}</strong>
          </p>

          <input
            type="number"
            placeholder="Total revenue"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              marginRight: "10px"
            }}
          />

          <button
            onClick={simulateRevenue}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              background: "#34c759",
              color: "#fff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Simulate
          </button>

          {/* PAYOUTS */}
          {payouts.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>💸 Payout Distribution</h3>
              {payouts.map((p, i) => (
                <p key={i}>
                  {p.investor} → Invested ₹{p.invested} → Payout ₹{p.payout}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
