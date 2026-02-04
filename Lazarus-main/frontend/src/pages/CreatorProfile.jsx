import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    title: "",
    description: "",
    video_type: "",
    funding_target: "",
    allowed_expenses: []
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        creator: {
          name: user?.name,
          role: user?.role
        }
      })
    });

    const data = await res.json();
    navigate("/project", { state: data });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Create Project</h2>

      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} />
        <br /><br />
        <textarea name="description" placeholder="Description" onChange={handleChange} />
        <br /><br />
        <input name="video_type" placeholder="Video Type" onChange={handleChange} />
        <br /><br />
        <input name="funding_target" type="number" placeholder="Funding Target" onChange={handleChange} />
        <br /><br />
        <button>Create</button>
      </form>
    </div>
  );
}
