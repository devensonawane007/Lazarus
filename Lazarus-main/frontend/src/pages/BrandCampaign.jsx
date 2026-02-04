import { useState } from "react";

const API = "http://localhost:5000";

/**
 * UI labels (pretty)
 * Stored values (lowercase) → for matching
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

  // ✅ STORED AS LOWERCASE VALUES
  const [selectedNiches, setSelectedNiches] = useState([]);

  const toggleNiche = (value) => {
    setSelectedNiches((prev) =>
      prev.includes(value)
        ? prev.filter((n) => n !== value)
        : [...prev, value]
    );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createCampaign = async () => {
    if (selectedNiches.length === 0) {
      alert("Select at least one niche");
      return;
    }

    try {
      const res = await fetch(`${API}/api/brand/campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          niches: selectedNiches // ✅ lowercase → matches creator
        })
      });

      const data = await res.json();
      alert("Campaign created ✅");
      console.log(data);

      // optional reset
      setForm({
        brandName: "",
        title: "",
        description: "",
        budget: "",
        deliverables: ""
      });
      setSelectedNiches([]);

    } catch {
      alert("Failed to create campaign ❌");
    }
  };

  return (
    <div style={container}>
      <h2>🏷 Create Brand Campaign</h2>

      <input
        name="brandName"
        placeholder="Brand name"
        value={form.brandName}
        onChange={handleChange}
        style={input}
      />

      <input
        name="title"
        placeholder="Campaign title"
        value={form.title}
        onChange={handleChange}
        style={input}
      />

      <textarea
        name="description"
        placeholder="Campaign description"
        value={form.description}
        onChange={handleChange}
        style={input}
      />

      <input
        name="budget"
        placeholder="Budget (₹)"
        value={form.budget}
        onChange={handleChange}
        style={input}
      />

      <input
        name="deliverables"
        placeholder="Deliverables (eg: 1 Reel + 1 Story)"
        value={form.deliverables}
        onChange={handleChange}
        style={input}
      />

      <h3>Select Niches</h3>

      <div style={grid}>
        {NICHES.map((niche) => (
          <div
            key={niche.value}
            onClick={() => toggleNiche(niche.value)}
            style={{
              ...card,
              background: selectedNiches.includes(niche.value)
                ? "#000"
                : "#fff",
              color: selectedNiches.includes(niche.value)
                ? "#fff"
                : "#000"
            }}
          >
            {niche.label}
          </div>
        ))}
      </div>

      <button onClick={createCampaign} style={btn}>
        🚀 Publish Campaign
      </button>
    </div>
  );
}

/* ===============================
   STYLES
================================ */
const container = {
  padding: "40px",
  maxWidth: "800px",
  margin: "auto"
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "12px",
  border: "1px solid #ddd"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "10px",
  marginBottom: "20px"
};

const card = {
  padding: "10px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  textAlign: "center",
  cursor: "pointer",
  userSelect: "none"
};

const btn = {
  padding: "12px 20px",
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer"
};
