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
    return <h2>No project data found</h2>;
  }

  // Contribute money
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

  // Simulate revenue
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
    <div style={{ padding: "20px" }}>
      <h1>{project.title}</h1>

      <p><b>Description:</b> {project.description}</p>
      <p><b>Funding Target:</b> ₹{project.funding_target}</p>
      <p><b>Total Raised:</b> ₹{totalRaised}</p>

      <hr />

      <h3>Contribute to Project</h3>
      <input
        type="number"
        placeholder="Enter amount ₹"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <br /><br />
      <button onClick={handleContribute}>Contribute ₹</button>

      <hr />

      <h3>Simulate Revenue (YouTube / Platform)</h3>
      <input
        type="number"
        placeholder="Enter revenue ₹"
        value={revenue}
        onChange={(e) => setRevenue(e.target.value)}
      />
      <br /><br />
      <button onClick={handleSimulateRevenue}>
        Simulate Revenue & Auto-Payout
      </button>

      <hr />

      <h3>Payout Distribution</h3>
      {payouts.length === 0 ? (
        <p>No payouts yet</p>
      ) : (
        <table border="1" cellPadding="10">
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
  );
}
