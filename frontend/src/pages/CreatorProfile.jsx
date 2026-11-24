import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const NICHE_OPTIONS = [
  "tech", "ai", "finance", "fitness", "travel",
  "fashion", "gaming", "education", "food", "lifestyle"
];

export default function CreatorProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    bio: "",
    platform: "youtube",
    url: "",
    followers: "",
    avgViews: "",
    niches: []
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.creator.getProfile();
      if (data?.profile) {
        setProfile(data.profile);
        setForm({
          bio: data.profile.bio || "",
          platform: data.profile.platform || "youtube",
          url: data.profile.portfolioUrl || "",
          followers: data.profile.followers || "",
          avgViews: data.profile.avgViews || "",
          niches: data.profile.niches || []
        });
      }
    } catch (err) {
      console.error("Load profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleNiche = (niche) => {
    setForm((prev) => ({
      ...prev,
      niches: prev.niches.includes(niche)
        ? prev.niches.filter((n) => n !== niche)
        : [...prev.niches, niche]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await api.creator.updateProfile({
        bio: form.bio,
        platform: form.platform,
        url: form.url,
        followers: form.followers,
        avgViews: form.avgViews,
        niches: form.niches
      });
      setMessage("Profile updated successfully in PostgreSQL! ✅");
      loadProfile();
    } catch (err) {
      setMessage("Failed to update profile: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#6b7280" }}>
        Loading creator profile...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>👤 Creator Profile & Portfolio</h1>
            <p style={styles.subtitle}>
              Manage your verified creator credentials, audience metrics, and niches.
            </p>
          </div>
          <button onClick={() => navigate("/creator")} style={styles.backBtn}>
            ← Dashboard
          </button>
        </div>

        {/* Verification Status */}
        <div style={styles.statusBox}>
          <div>
            <strong>MOU Legal Status: </strong>
            <span style={{
              fontWeight: "700",
              color: profile?.isMouSigned ? "#059669" : "#dc2626"
            }}>
              {profile?.isMouSigned ? "✓ Verified & Digitally Signed" : "⚠️ Pending Signature"}
            </span>
          </div>
          {!profile?.isMouSigned && (
            <button
              onClick={() => navigate("/creator")}
              style={styles.signBtn}
            >
              Sign MOU on Dashboard →
            </button>
          )}
        </div>

        {message && (
          <div style={{
            ...styles.alert,
            backgroundColor: message.includes("Failed") ? "#fee2e2" : "#ecfdf5",
            color: message.includes("Failed") ? "#991b1b" : "#065f46"
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Creator Bio / About You</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell brands and investors about your content style, editing speed, and audience engagement..."
              style={styles.textarea}
            />
          </div>

          <div style={styles.gridTwo}>
            <div style={styles.field}>
              <label style={styles.label}>Primary Content Platform</label>
              <select
                name="platform"
                value={form.platform}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
                <option value="x">X / Twitter</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Portfolio / Channel Link</label>
              <input
                type="url"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://youtube.com/@yourchannel"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.gridTwo}>
            <div style={styles.field}>
              <label style={styles.label}>Total Followers / Subscribers</label>
              <input
                type="text"
                name="followers"
                value={form.followers}
                onChange={handleChange}
                placeholder="e.g. 150K"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Average Views Per Video</label>
              <input
                type="text"
                name="avgViews"
                value={form.avgViews}
                onChange={handleChange}
                placeholder="e.g. 45,000"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Creator Niches</label>
            <div style={styles.nicheGrid}>
              {NICHE_OPTIONS.map((niche) => {
                const isSelected = form.niches.includes(niche);
                return (
                  <button
                    type="button"
                    key={niche}
                    onClick={() => toggleNiche(niche)}
                    style={{
                      ...styles.nicheTag,
                      backgroundColor: isSelected ? "#059669" : "#f3f4f6",
                      color: isSelected ? "#ffffff" : "#374151",
                      border: isSelected ? "1px solid #059669" : "1px solid #e5e7eb"
                    }}
                  >
                    #{niche} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving Changes..." : "Save Profile Updates"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    padding: "40px 20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  card: {
    maxWidth: "800px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "36px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: "20px"
  },
  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: "700",
    color: "#111827"
  },
  subtitle: {
    margin: "6px 0 0 0",
    fontSize: "14px",
    color: "#6b7280"
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#059669",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer"
  },
  statusBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: "14px 20px",
    borderRadius: "12px",
    marginBottom: "24px",
    border: "1px solid #e5e7eb",
    fontSize: "14px"
  },
  signBtn: {
    padding: "6px 12px",
    backgroundColor: "#059669",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer"
  },
  alert: {
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    marginBottom: "20px"
  },
  field: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px"
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    height: "90px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
    resize: "vertical"
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },
  nicheGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px"
  },
  nicheTag: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer"
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#059669",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px"
  }
};
