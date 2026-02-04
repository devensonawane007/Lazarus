import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    video_type: "",
    funding_target: "",
    allowed_expenses: []
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    let updatedExpenses = [...form.allowed_expenses];

    if (checked) {
      updatedExpenses.push(value);
    } else {
      updatedExpenses = updatedExpenses.filter(
        (item) => item !== value
      );
    }

    setForm({
      ...form,
      allowed_expenses: updatedExpenses
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      // Redirect to Project Page with project data
      navigate("/project", { state: data });

    } catch (error) {
      console.error("Error creating project:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Video Project</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Project Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <br /><br />

        <textarea
          name="description"
          placeholder="Project Description"
          value={form.description}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="text"
          name="video_type"
          placeholder="Video Type (Documentary / Short Film)"
          value={form.video_type}
          onChange={handleChange}
        />
        <br /><br />

        <input
          type="number"
          name="funding_target"
          placeholder="Funding Target (₹)"
          value={form.funding_target}
          onChange={handleChange}
          required
        />
        <br /><br />

        <h4>Allowed Expenses</h4>

        <label>
          <input
            type="checkbox"
            value="camera"
            onChange={handleCheckbox}
          />
          Camera
        </label>
        <br />

        <label>
          <input
            type="checkbox"
            value="travel"
            onChange={handleCheckbox}
          />
          Travel
        </label>
        <br />

        <label>
          <input
            type="checkbox"
            value="editing"
            onChange={handleCheckbox}
          />
          Editing
        </label>
        <br />

        <label>
          <input
            type="checkbox"
            value="marketing"
            onChange={handleCheckbox}
          />
          Marketing
        </label>

        <br /><br />

        <button type="submit">Create Project</button>
      </form>
    </div>
  );
}
