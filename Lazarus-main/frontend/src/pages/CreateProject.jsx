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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      allowed_expenses: checked
        ? [...prev.allowed_expenses, value]
        : prev.allowed_expenses.filter((item) => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      navigate("/project", { state: data });

    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.heading}>🎬 Create Video Project</h2>

        <div style={styles.field}>
          <label>Project Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            style={{ ...styles.input, height: "80px" }}
          />
        </div>

        <div style={styles.field}>
          <label>Video Type</label>
          <input
            type="text"
            name="video_type"
            placeholder="Documentary / Short Film"
            value={form.video_type}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Funding Target (₹)</label>
          <input
            type="number"
            name="funding_target"
            value={form.funding_target}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>Allowed Expenses</label>
          <div style={styles.checkboxGroup}>
            {["camera", "travel", "editing", "marketing"].map((item) => (
              <label key={item} style={styles.checkboxItem}>
                <input
                  type="checkbox"
                  value={item}
                  onChange={handleCheckbox}
                />
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" style={styles.button}>
          🚀 Create Project
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8"
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "450px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px"
  },
  field: {
    marginBottom: "15px"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginTop: "5px"
  },
  checkboxGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "8px"
  },
  checkboxItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px"
  }
};
