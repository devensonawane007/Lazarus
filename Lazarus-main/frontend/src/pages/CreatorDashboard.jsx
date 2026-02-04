import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function Creator() {
  const [title, setTitle] = useState("");
  const [fundingTarget, setFundingTarget] = useState("");
  const [projects, setProjects] = useState([]);

  const loadProjects = async () => {
    const res = await axios.get(`${API}/api/projects`);
    setProjects(res.data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async () => {
    if (!title || !fundingTarget) {
      alert("Title and funding target required");
      return;
    }

    await axios.post(`${API}/api/projects`, {
      title,
      funding_target: fundingTarget
    });

    setTitle("");
    setFundingTarget("");
    loadProjects();
  };

  return (
    <div>
      <h2>Creator Dashboard</h2>
      <p>Create opportunities and raise funds.</p>

      <h3>Create Opportunity</h3>
      <input
        placeholder="Project / Opportunity Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br /><br />
      <input
        type="number"
        placeholder="Funding Target"
        value={fundingTarget}
        onChange={(e) => setFundingTarget(e.target.value)}
      />
      <br /><br />
      <button onClick={createProject}>Create</button>

      <hr />

      <h3>Your Opportunities</h3>

      {projects.length === 0 && <p>No opportunities created yet</p>}

      {projects.map((p) => (
        <div
          key={p.id}
          style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}
        >
          <strong>{p.title}</strong>
          <p>Funding Target: ₹{p.funding_target}</p>
          <p>Status: {p.status}</p>
        </div>
      ))}
    </div>
  );
}