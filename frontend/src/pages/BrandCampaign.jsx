import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const NICHES = [
  { label: "Technology", value: "tech" },
  { label: "AI", value: "ai" },
  { label: "Finance", value: "finance" },
  { label: "Crypto", value: "crypto" },
  { label: "Fitness", value: "fitness" },
  { label: "Health", value: "health" },
  { label: "Travel", value: "travel" },
  { label: "Food", value: "food" },
  { label: "Fashion", value: "fashion" },
  { label: "Gaming", value: "gaming" },
  { label: "Education", value: "education" },
  { label: "Comedy", value: "comedy" },
  { label: "Music", value: "music" },
  { label: "Photography", value: "photography" },
  { label: "Startups", value: "startups" }
];

export default function BrandCampaign() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    brandName: "",
    title: "",
    description: "",
    budget: "",
    deliverables: ""
  });

  const [selectedNiches, setSelectedNiches] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleNiche = (value) => {
    setSelectedNiches((prev) =>
      prev.includes(value)
        ? prev.filter((n) => n !== value)
        : [...prev, value]
    );
  };

  const createCampaign = async () => {
    if (!form.brandName || !form.title) {
      alert("Brand name and title are required");
      return;
    }

    if (selectedNiches.length === 0) {
      alert("Select at least one niche");
      return;
    }

    setLoading(true);

    try {
      await api.brand.createCampaign({
        ...form,
        niches: selectedNiches
      });

      alert("Campaign created successfully 🚀");
      navigate("/brand");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageBackground}>
      <div style={container}>
        {/* Back Link */}
        <div style={{ marginBottom: "16px" }}>
          <button
            onClick={() => navigate("/brand")}
            style={{ background: "none", border: "none", color: "#065f46", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}
          >
            ← Back to Brand Dashboard
          </button>
        </div>

        {/* Header Card */}
        <div style={headerCard}>
          <div style={iconWrapper}>
            <span style={icon}>🏷️</span>
          </div>
          <h1 style={title}>Create Brand Campaign</h1>
          <p style={subtitle}>Creators with matching niches will discover this campaign</p>
        </div>

        {/* Campaign Details Card */}
        <div style={card}>
          <h2 style={sectionTitle}>Campaign Details</h2>
          
          <div style={inputGroup}>
            <label style={label}>Brand Name *</label>
            <input
              name="brandName"
              placeholder="e.g. Nike / Gymshark / TechCorp"
              value={form.brandName}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={inputGroup}>
            <label style={label}>Campaign Title *</label>
            <input
              name="title"
              placeholder="e.g. Summer Fitness Gear Reel Campaign"
              value={form.title}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={inputGroup}>
            <label style={label}>Description</label>
            <textarea
              name="description"
              placeholder="Describe campaign goals, messaging, creative brief, and audience target..."
              value={form.description}
              onChange={handleChange}
              style={{...input, ...textarea}}
              rows={4}
            />
          </div>

          <div style={twoColumnGrid}>
            <div style={inputGroup}>
              <label style={label}>Budget (₹) *</label>
              <input
                name="budget"
                placeholder="e.g., 50000"
                value={form.budget}
                onChange={handleChange}
                style={input}
                type="number"
              />
            </div>

            <div style={inputGroup}>
              <label style={label}>Deliverables</label>
              <input
                name="deliverables"
                placeholder="e.g., 1 YouTube Video + 2 Shorts"
                value={form.deliverables}
                onChange={handleChange}
                style={input}
              />
            </div>
          </div>
        </div>

        {/* Niches Selection Card */}
        <div style={card}>
          <h2 style={sectionTitle}>Target Creator Niches *</h2>
          <p style={helperText}>
            Choose the niches that align with your campaign
            {selectedNiches.length > 0 && (
              <span style={selectedCount}> • {selectedNiches.length} selected</span>
            )}
          </p>

          <div style={nichesGrid}>
            {NICHES.map((niche) => {
              const isSelected = selectedNiches.includes(niche.value);
              return (
                <div
                  key={niche.value}
                  onClick={() => toggleNiche(niche.value)}
                  style={{
                    ...nicheCard,
                    background: isSelected ? "#065f46" : "#fff",
                    color: isSelected ? "#fff" : "#333",
                    border: isSelected ? "2px solid #065f46" : "2px solid #e5e5e5",
                    transform: isSelected ? "translateY(-2px)" : "translateY(0)"
                  }}
                >
                  {niche.label}
                  {isSelected && <span style={checkmark}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Card */}
        <div style={actionCard}>
          <button 
            onClick={createCampaign} 
            style={{
              ...publishButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }} 
            disabled={loading}
          >
            {loading ? "Publishing..." : "🚀 Publish Campaign"}
          </button>
          <p style={actionHelperText}>
            Your campaign will be matched with verified creators immediately upon publication
          </p>
        </div>
      </div>
    </div>
  );
}

const pageBackground = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
  padding: "40px 20px",
  fontFamily: "-apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
};

const container = {
  maxWidth: "900px",
  margin: "0 auto"
};

const headerCard = {
  background: "#fff",
  borderRadius: "20px",
  padding: "36px",
  marginBottom: "24px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  textAlign: "center"
};

const iconWrapper = {
  marginBottom: "12px"
};

const icon = {
  fontSize: "44px",
  display: "inline-block"
};

const title = {
  fontSize: "30px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0 0 8px 0"
};

const subtitle = {
  fontSize: "15px",
  color: "#666",
  margin: "0"
};

const card = {
  background: "#fff",
  borderRadius: "20px",
  padding: "32px",
  marginBottom: "24px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
};

const sectionTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 16px 0"
};

const inputGroup = {
  marginBottom: "20px"
};

const label = {
  display: "block",
  fontSize: "14px",
  fontWeight: "600",
  color: "#333",
  marginBottom: "8px"
};

const input = {
  width: "100%",
  padding: "14px 16px",
  fontSize: "15px",
  border: "2px solid #e5e5e5",
  borderRadius: "12px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box"
};

const textarea = {
  resize: "vertical",
  minHeight: "100px",
  lineHeight: "1.5"
};

const twoColumnGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px"
};

const helperText = {
  fontSize: "14px",
  color: "#666",
  marginBottom: "20px"
};

const selectedCount = {
  color: "#065f46",
  fontWeight: "600"
};

const nichesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: "12px"
};

const nicheCard = {
  padding: "12px 16px",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  transition: "all 0.2s ease"
};

const checkmark = {
  fontSize: "14px",
  fontWeight: "bold"
};

const actionCard = {
  textAlign: "center",
  marginTop: "16px"
};

const publishButton = {
  padding: "16px 40px",
  fontSize: "16px",
  fontWeight: "700",
  color: "#fff",
  background: "#065f46",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(6, 95, 70, 0.3)"
};

const actionHelperText = {
  fontSize: "13px",
  color: "#666",
  marginTop: "12px"
};
