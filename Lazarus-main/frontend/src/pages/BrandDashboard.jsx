import { useState } from "react";

export default function BrandDashboard() {
  const [form, setForm] = useState({
    brandName: "",
    industry: "",
    objective: "",
    audienceAge: "",
    audienceLocation: "",
    audienceType: "",
    platform: "",
    budget: "",
    risk: "",
    collaborationType: "",
    successMetric: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Brand Campaign Data:", form);
    alert("Campaign submitted! AI matching coming next 🚀");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
      <h1>🏷 Brand Campaign Dashboard</h1>
      <p>
        Tell us your business goal — Lazarus will match you with
        high-ROI creators.
      </p>

      <form onSubmit={handleSubmit}>

        {/* 1️⃣ BRAND IDENTITY */}
        <section style={sectionStyle}>
          <h3>1️⃣ Brand Identity</h3>

          <input
            name="brandName"
            placeholder="Brand Name"
            value={form.brandName}
            onChange={handleChange}
            required
          />

          <select name="industry" onChange={handleChange} required>
            <option value="">Select Industry</option>
            <option>Technology</option>
            <option>Fashion</option>
            <option>Finance</option>
            <option>FMCG</option>
            <option>Education</option>
            <option>Gaming</option>
            <option>Travel</option>
          </select>
        </section>

        {/* 2️⃣ CAMPAIGN OBJECTIVE */}
        <section style={sectionStyle}>
          <h3>2️⃣ Campaign Objective</h3>

          <select name="objective" onChange={handleChange} required>
            <option value="">Select Goal</option>
            <option>Increase Brand Awareness</option>
            <option>Drive Product Sales</option>
            <option>App Installs</option>
            <option>Lead Generation</option>
            <option>Build Brand Trust</option>
          </select>
        </section>

        {/* 3️⃣ TARGET AUDIENCE */}
        <section style={sectionStyle}>
          <h3>3️⃣ Target Audience</h3>

          <select name="audienceAge" onChange={handleChange}>
            <option value="">Age Group</option>
            <option>13–18</option>
            <option>18–24</option>
            <option>25–34</option>
            <option>35+</option>
          </select>

          <select name="audienceLocation" onChange={handleChange}>
            <option value="">Location</option>
            <option>India</option>
            <option>Tier-1 Cities</option>
            <option>Global</option>
          </select>

          <select name="audienceType" onChange={handleChange}>
            <option value="">Audience Type</option>
            <option>Students</option>
            <option>Working Professionals</option>
            <option>Founders</option>
            <option>Gamers</option>
            <option>Online Shoppers</option>
          </select>
        </section>

        {/* 4️⃣ PLATFORM */}
        <section style={sectionStyle}>
          <h3>4️⃣ Preferred Platform</h3>

          <select name="platform" onChange={handleChange}>
            <option value="">Select Platform</option>
            <option>YouTube</option>
            <option>Instagram</option>
            <option>YouTube Shorts</option>
            <option>Reels</option>
            <option>Podcast</option>
            <option>Let AI Decide</option>
          </select>
        </section>

        {/* 5️⃣ BUDGET & RISK */}
        <section style={sectionStyle}>
          <h3>5️⃣ Budget & Risk Appetite</h3>

          <select name="budget" onChange={handleChange}>
            <option value="">Budget Range</option>
            <option>₹5k – ₹10k</option>
            <option>₹10k – ₹50k</option>
            <option>₹50k+</option>
          </select>

          <select name="risk" onChange={handleChange}>
            <option value="">Risk Preference</option>
            <option>Safe & Proven Creators</option>
            <option>Balanced</option>
            <option>High-Risk / High-Reward</option>
          </select>
        </section>

        {/* 6️⃣ COLLAB TYPE */}
        <section style={sectionStyle}>
          <h3>6️⃣ Collaboration Type</h3>

          <select name="collaborationType" onChange={handleChange}>
            <option value="">Select Type</option>
            <option>Sponsored Post</option>
            <option>Dedicated Video</option>
            <option>Story + Link</option>
            <option>Long-Term Partnership</option>
            <option>Affiliate / Revenue Share</option>
          </select>
        </section>

        {/* 7️⃣ SUCCESS METRIC */}
        <section style={sectionStyle}>
          <h3>7️⃣ Success Metric</h3>

          <select name="successMetric" onChange={handleChange}>
            <option value="">Measure Success By</option>
            <option>Views</option>
            <option>Engagement Rate</option>
            <option>Clicks</option>
            <option>Conversions</option>
            <option>Revenue</option>
          </select>
        </section>

        <button style={ctaStyle} type="submit">
          🔍 Find High-ROI Creators
        </button>
      </form>
    </div>
  );
}

/* ===============================
   STYLES
================================ */
const sectionStyle = {
  background: "#f5f5f7",
  padding: "20px",
  borderRadius: "14px",
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const ctaStyle = {
  marginTop: "20px",
  padding: "14px",
  fontSize: "16px",
  borderRadius: "12px",
  border: "none",
  background: "#0071e3",
  color: "#fff",
  cursor: "pointer"
};
