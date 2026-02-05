import { useLocation } from "react-router-dom";
import { useState } from "react";

export default function ProjectPage() {
  const location = useLocation();
  const project = location.state;

  const [amount, setAmount] = useState("");
  const [totalRaised, setTotalRaised] = useState(0);
  const [revenue, setRevenue] = useState("");
  const [payouts, setPayouts] = useState([]);

  if (!project) {
    return <h2 style={{ textAlign: "center" }}>No project data found</h2>;
  }

  const handleContribute = async () => {
    const response = await fetch("http://localhost:5000/api/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: project.id,
        amount
      })
    });

    const data = await response.json();
    setTotalRaised(data.totalRaised);
    setAmount("");
  };

  const handleSimulateRevenue = async () => {
    const response = await fetch("http://localhost:5000/api/simulate-revenue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: project.id,
        revenue_amount: revenue
      })
    });

    const data = await response.json();
    setPayouts(data.payouts);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Project Info */}
        <div style={styles.card}>
          <h1>{project.title}</h1>
          <p style={{ color: "#555" }}>{project.description}</p>

          <div style={styles.stats}>
            <div>
              <h4>🎯 Target</h4>
              <p>₹{project.funding_target}</p>
            </div>
            <div>
              <h4>💰 Raised</h4>
              <p>₹{totalRaised}</p>
            </div>
          </div>
        </div>

        {/* Contribution */}
        <div style={styles.card}>
          <h3>💸 Contribute to Project</h3>
          <input
            type="number"
            placeholder="Enter amount ₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleContribute} style={styles.primaryBtn}>
            Contribute
          </button>
        </div>

        {/* Revenue Simulation */}
        <div style={styles.card}>
          <h3>📈 Simulate Revenue</h3>
          <input
            type="number"
            placeholder="Revenue earned ₹"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSimulateRevenue} style={styles.secondaryBtn}>
            Simulate & Auto-Payout
          </button>
        </div>

        {/* Payout Table */}
        <div style={styles.card}>
          <h3>📊 Payout Distribution</h3>

          {payouts.length === 0 ? (
            <p style={{ color: "#777" }}>No payouts yet</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Contributor</th>
                  <th>Invested</th>
                  <th>Payout</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, index) => (
                  <tr key={index}>
                    <td>{p.contributor}</td>
                    <td>₹{p.invested}</td>
                    <td>₹{p.payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f4f6f8",
    minHeight: "100vh",
    padding: "30px"
  },
  container: {
    maxWidth: "800px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
  },
  stats: {
    display: "flex",
    gap: "40px",
    marginTop: "15px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  primaryBtn: {
    marginTop: "12px",
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
    fontSize: "15px"
  },
  secondaryBtn: {
    marginTop: "12px",
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer",
    fontSize: "15px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px"
  }
};
