import { useState } from "react";

const API = "http://localhost:5000";

/**
 * UI labels (pretty)
 * Stored values (lowercase) → for matching with creators
 */
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
  const [form, setForm] = useState({
    brandName: "",
    title: "",
    description: "",
    budget: "",
    deliverables: ""
  });

  // Stored as lowercase values
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===============================
     HANDLERS
  ================================ */
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

  /* ===============================
     CREATE CAMPAIGN
  ================================ */
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
      const res = await fetch(`${API}/api/brand/campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          niches: selectedNiches // lowercase → matches creator
        })
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Backend error: " + err.message);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("✅ Campaign saved in backend:", data);

      alert("Campaign created successfully 🚀");

      // Reset form
      setForm({
        brandName: "",
        title: "",
        description: "",
        budget: "",
        deliverables: ""
      });
      setSelectedNiches([]);

    } catch (err) {
      console.error(err);
      alert("Network error ❌");
    }

    setLoading(false);
  };

  /* ===============================
     UI
  ================================ */
  return (
    <div style={pageBackground}>
      <div style={container}>
        {/* Header Card */}
        <div style={headerCard}>
          <div style={iconWrapper}>
            <span style={icon}>🏷️</span>
          </div>
          <h1 style={title}>Create Brand Campaign</h1>
          <p style={subtitle}>Creators with matching niches will see this campaign</p>
        </div>

        {/* Campaign Details Card */}
        <div style={card}>
          <h2 style={sectionTitle}>Campaign Details</h2>
          
          <div style={inputGroup}>
            <label style={label}>Brand Name *</label>
            <input
              name="brandName"
              placeholder="Enter your brand name"
              value={form.brandName}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={inputGroup}>
            <label style={label}>Campaign Title *</label>
            <input
              name="title"
              placeholder="Give your campaign a catchy title"
              value={form.title}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div style={inputGroup}>
            <label style={label}>Description</label>
            <textarea
              name="description"
              placeholder="Describe your campaign goals and requirements..."
              value={form.description}
              onChange={handleChange}
              style={{...input, ...textarea}}
              rows={4}
            />
          </div>

          <div style={twoColumnGrid}>
            <div style={inputGroup}>
              <label style={label}>Budget (₹)</label>
              <input
                name="budget"
                placeholder="e.g., 50,000"
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
                placeholder="e.g., 1 Reel + 1 Story"
                value={form.deliverables}
                onChange={handleChange}
                style={input}
              />
            </div>
          </div>
        </div>

        {/* Niches Selection Card */}
        <div style={card}>
          <h2 style={sectionTitle}>Select Target Niches *</h2>
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
                    background: isSelected ? "#000" : "#fff",
                    color: isSelected ? "#fff" : "#333",
                    border: isSelected ? "2px solid #000" : "2px solid #e5e5e5",
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
            {loading ? (
              <>
                <span style={spinner}>⏳</span> Publishing...
              </>
            ) : (
              <>
                <span style={buttonIcon}>🚀</span> Publish Campaign
              </>
            )}
          </button>
          <p style={actionHelperText}>
            Your campaign will be visible to all matching creators immediately
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   STYLES
================================ */
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
  padding: "40px",
  marginBottom: "24px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  textAlign: "center"
};

const iconWrapper = {
  marginBottom: "16px"
};

const icon = {
  fontSize: "48px",
  display: "inline-block",
  animation: "float 3s ease-in-out infinite"
};

const title = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0 0 8px 0",
  letterSpacing: "-0.5px"
};

const subtitle = {
  fontSize: "16px",
  color: "#666",
  margin: "0"
};

const card = {
  background: "#fff",
  borderRadius: "20px",
  padding: "32px",
  marginBottom: "24px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  transition: "box-shadow 0.3s ease"
};

const sectionTitle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 20px 0"
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
  transition: "all 0.3s ease",
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
  color: "#2e7d32",
  fontWeight: "600"
};

const nichesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: "12px"
};

const nicheCard = {
  padding: "16px 12px",
  borderRadius: "12px",
  textAlign: "center",
  cursor: "pointer",
  userSelect: "none",
  fontSize: "14px",
  fontWeight: "500",
  transition: "all 0.2s ease",
  position: "relative",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
};

const checkmark = {
  position: "absolute",
  top: "6px",
  right: "8px",
  fontSize: "12px",
  fontWeight: "bold"
};

const actionCard = {
  background: "#fff",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  textAlign: "center"
};

const publishButton = {
  width: "100%",
  padding: "16px 32px",
  fontSize: "16px",
  fontWeight: "600",
  background: "linear-gradient(135deg, #000 0%, #333 100%)",
  color: "#fff",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px"
};

const buttonIcon = {
  fontSize: "18px"
};

const spinner = {
  fontSize: "18px",
  animation: "spin 1s linear infinite"
};

const actionHelperText = {
  fontSize: "13px",
  color: "#666",
  marginTop: "12px",
  marginBottom: "0"
};