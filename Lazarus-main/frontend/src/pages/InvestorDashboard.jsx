import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function Investor() {
  const [projects, setProjects] = useState([]);
  const [amount, setAmount] = useState("");

  const loadProjects = async () => {
    const res = await axios.get(`${API}/api/projects`);
    setProjects(res.data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const contribute = async (projectId) => {
    if (!amount) {
      alert("Enter contribution amount");
      return;
    }

    await axios.post(`${API}/api/contribute`, {
      project_id: projectId,
      amount
    });

    alert("Contribution successful");
    setAmount("");
  };

  return (
    <div>
      <h2>Investor Dashboard</h2>
      <p>Explore opportunities and support creators.</p>

      {projects.length === 0 && <p>No opportunities available</p>}

      {projects.map((p) => (
        <div
          key={p.id}
          style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}
        >
          <strong>{p.title}</strong>
          <p>Funding Target: ₹{p.funding_target}</p>

          <input
            type="number"
            placeholder="Investment amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <br /><br />
          <button onClick={() => contribute(p.id)}>
            Invest
          </button>
        </div>
      ))}
    </div>
  );
}