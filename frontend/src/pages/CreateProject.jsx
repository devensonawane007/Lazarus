import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    video_type: "",
    funding_target: "",
    allowed_expenses: []
  });

  const handleChange = (e) => {
    setErrorMessage("");
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
    setLoading(true);
    setErrorMessage("");

    try {
      if (!form.title || !form.funding_target) {
        throw new Error("Project Title and Funding Target are required");
      }

      const data = await api.projects.create(form);
      navigate("/project", { state: data });
    } catch (error) {
      console.error("Create project error:", error);
      setErrorMessage(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={styles.heading}>🎬 Create Video Project</h2>
          <button
            type="button"
            onClick={() => navigate("/creator")}
            style={styles.cancelBtn}
          >
            ← Back to Dashboard
          </button>
        </div>

        {errorMessage && (
          <div style={styles.errorBanner}>
            ⚠️ {errorMessage}
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Project Title *</label>
          <input
            type="text"
            name="title"
            placeholder="e.g. AI Revolution Documentary"
            value={form.title}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Description</label>
          <textarea
            name="description"
            placeholder="Describe your vision, story, and execution roadmap..."
            value={form.description}
            onChange={handleChange}
            style={{ ...styles.input, height: "90px", resize: "vertical" }}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Video Format</label>
          <input
            type="text"
            name="video_type"
            placeholder="e.g. 4K Mini-Doc / YouTube Deep Dive / Commercial Short"
            value={form.video_type}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Funding Target (₹) *</label>
          <input
            type="number"
            name="funding_target"
            placeholder="e.g. 50000"
            value={form.funding_target}
            onChange={handleChange}
            required
            min="100"
            style={styles.input}
          />
          <small style={{ color: "#6b7280", marginTop: "4px", display: "block" }}>
            30% will be allocated as upfront production escrow, 70% released upon investor milestone delivery verification.
          </small>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Allowed Escrow Expenses</label>
          <div style={styles.checkboxGrid}>
            {[
              "Camera & Lighting Equipment",
              "Studio / Location Rental",
              "Sound Design & Original Score",
              "Cast, Crew & Talent Compensation",
              "Post-Production & Color Grading",
              "Travel & Accommodation",
              "Marketing & Distribution"
            ].map((item) => (
              <label key={item} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  value={item}
                  checked={form.allowed_expenses.includes(item)}
                  onChange={handleCheckbox}
                  style={styles.checkbox}
                />
                <span style={{ fontSize: "14px", color: "#374151" }}>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating in Escrow..." : "Publish Project for Funding 🚀"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  card: {
    background: "#ffffff",
    padding: "36px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "620px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb"
  },
  heading: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827"
  },
  cancelBtn: {
    background: "none",
    border: "none",
    color: "#059669",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer"
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "18px"
  },
  field: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px"
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none"
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "8px",
    marginTop: "6px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    padding: "6px 8px",
    borderRadius: "8px",
    backgroundColor: "#f9fafb"
  },
  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "#059669"
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#059669",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "10px"
  }
};
