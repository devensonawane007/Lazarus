import { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function InvestorDashboard() {
  const [projects, setProjects] = useState([]);
  const [amount, setAmount] = useState("");
  const [revenue, setRevenue] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [myInvestments, setMyInvestments] = useState([]);
  const [investorName, setInvestorName] = useState("John Doe");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchMyInvestments();
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

  const fetchMyInvestments = async () => {
    setMyInvestments([
      { projectName: "AI Music Generator", amount: 50000, date: "2024-01-15" },
      { projectName: "Eco-Friendly App", amount: 30000, date: "2024-02-01" },
      { projectName: "Gaming Platform", amount: 75000, date: "2024-02-03" }
    ]);
  };

  const invest = async (projectId, projectTitle) => {
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
    
    setMyInvestments([
      ...myInvestments,
      { projectName: projectTitle, amount: parseFloat(amount), date: new Date().toISOString().split('T')[0] }
    ]);
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

  const updateInvestment = (index, field, value) => {
    const updated = [...myInvestments];
    if (field === 'amount') {
      updated[index][field] = parseFloat(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setMyInvestments(updated);
  };

  const deleteInvestment = (index) => {
    const updated = myInvestments.filter((_, i) => i !== index);
    setMyInvestments(updated);
  };

  const addInvestment = () => {
    setMyInvestments([
      ...myInvestments,
      { projectName: "New Project", amount: 10000, date: new Date().toISOString().split('T')[0] }
    ]);
  };

  const totalInvested = myInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const maxAmount = Math.max(...myInvestments.map(inv => inv.amount), 1);

  return (
    <div
      style={{
        padding: "40px",
        background: "#f5f5f7",
        minHeight: "100vh"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontWeight: 600, margin: 0 }}>💰 Investor Dashboard</h1>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            Explore creator projects, invest transparently, and simulate returns.
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            background: editMode ? "#34c759" : "#0071e3",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px"
          }}
        >
          {editMode ? "✓ Done Editing" : "✏️ Edit Mode"}
        </button>
      </div>

      {/* INVESTMENT SUMMARY */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "18px",
          padding: "32px",
          marginBottom: "30px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          color: "#fff"
        }}
      >
        <h2 style={{ margin: 0, marginBottom: "8px", fontSize: "24px" }}>
          📊 Your Investment Portfolio
        </h2>
        <p style={{ opacity: 0.9, margin: 0, marginBottom: "24px" }}>
          Track your success across all projects
        </p>
        
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "4px" }}>
              Total Invested
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700" }}>
              ₹{totalInvested.toLocaleString()}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "4px" }}>
              Active Projects
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700" }}>
              {myInvestments.length}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8, marginBottom: "4px" }}>
              Average Investment
            </div>
            <div style={{ fontSize: "36px", fontWeight: "700" }}>
              ₹{myInvestments.length > 0 ? Math.round(totalInvested / myInvestments.length).toLocaleString() : 0}
            </div>
          </div>
        </div>
      </div>

      {/* INVESTMENT GRAPH */}
      {myInvestments.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            padding: "28px",
            marginBottom: "30px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: 0 }}>
              📈 Investment Distribution
            </h2>
            {editMode && (
              <button
                onClick={addInvestment}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "#34c759",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600
                }}
              >
                + Add Investment
              </button>
            )}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {myInvestments.map((inv, idx) => {
              const percentage = (inv.amount / maxAmount) * 100;
              return (
                <div key={idx} style={{ position: "relative" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "14px",
                    alignItems: "center"
                  }}>
                    {editMode ? (
                      <input
                        type="text"
                        value={inv.projectName}
                        onChange={(e) => updateInvestment(idx, 'projectName', e.target.value)}
                        style={{
                          fontWeight: 500,
                          fontSize: "14px",
                          padding: "4px 8px",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          flex: 1,
                          marginRight: "10px"
                        }}
                      />
                    ) : (
                      <span style={{ fontWeight: 500 }}>{inv.projectName}</span>
                    )}
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {editMode ? (
                        <input
                          type="number"
                          value={inv.amount}
                          onChange={(e) => updateInvestment(idx, 'amount', e.target.value)}
                          style={{
                            color: "#666",
                            fontSize: "14px",
                            padding: "4px 8px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            width: "100px"
                          }}
                        />
                      ) : (
                        <span style={{ color: "#666" }}>₹{inv.amount.toLocaleString()}</span>
                      )}
                      
                      {editMode && (
                        <button
                          onClick={() => deleteInvestment(idx)}
                          style={{
                            background: "#ff3b30",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div style={{
                    width: "100%",
                    height: "32px",
                    background: "#f0f0f0",
                    borderRadius: "8px",
                    overflow: "hidden",
                    position: "relative"
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${
                        idx % 3 === 0 ? "#0071e3" : 
                        idx % 3 === 1 ? "#34c759" : "#ff9500"
                      }, ${
                        idx % 3 === 0 ? "#0077ed" : 
                        idx % 3 === 1 ? "#30d158" : "#ff9f0a"
                      })`,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: "12px",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "12px",
                      transition: "width 0.5s ease"
                    }}>
                      {percentage > 15 && `${Math.round((inv.amount / totalInvested) * 100)}%`}
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#999",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    {editMode ? (
                      <>
                        <span>Invested on</span>
                        <input
                          type="date"
                          value={inv.date}
                          onChange={(e) => updateInvestment(idx, 'date', e.target.value)}
                          style={{
                            fontSize: "12px",
                            padding: "2px 6px",
                            border: "1px solid #ddd",
                            borderRadius: "4px"
                          }}
                        />
                      </>
                    ) : (
                      `Invested on ${inv.date}`
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PROJECT LIST */}
      <h2 style={{ marginBottom: "20px", marginTop: "40px" }}>🚀 Available Projects</h2>
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
              onClick={() => invest(project.id, project.title)}
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