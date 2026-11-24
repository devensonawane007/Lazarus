import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = searchParams.get("mode") === "register";
  const initialRole = searchParams.get("role") || "creator";

  const [isRegistering, setIsRegistering] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole.toLowerCase(),
    companyName: ""
  });

  const handleChange = (e) => {
    setErrorMessage("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setRole = (role) => {
    setForm({ ...form, role });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      let res;
      if (isRegistering) {
        if (!form.email || !form.password || !form.name) {
          throw new Error("Please fill in all required fields");
        }
        res = await api.auth.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          companyName: form.companyName || undefined
        });
      } else {
        if (!form.email || !form.password) {
          throw new Error("Please enter your email and password");
        }
        res = await api.auth.login({
          email: form.email,
          password: form.password
        });
      }

      const userRole = (res.user?.role || form.role).toLowerCase();

      if (userRole === "brand") {
        navigate("/brand");
      } else if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/creator");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMessage(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Back to Home Link */}
      <div style={{ position: "absolute", top: "24px", left: "32px" }}>
        <button
          onClick={() => navigate("/")}
          style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}
        >
          ← Back to Lazarus Home
        </button>
      </div>

      <div style={cardStyle}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={logoIconStyle}>⚡</div>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc", marginTop: "12px", letterSpacing: "-0.02em" }}>
            Lazarus <span style={{ color: "#10b981" }}>V3</span>
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
            {isRegistering
              ? "Create your account to unlock verified analytics & brand deals"
              : "Sign in to access your Creator or Brand Studio"}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div style={tabContainerStyle}>
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setErrorMessage(""); }}
            style={{
              ...tabButtonStyle,
              backgroundColor: !isRegistering ? "var(--bg-card)" : "transparent",
              color: !isRegistering ? "#f8fafc" : "#94a3b8",
              fontWeight: !isRegistering ? "700" : "500"
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setErrorMessage(""); }}
            style={{
              ...tabButtonStyle,
              backgroundColor: isRegistering ? "var(--bg-card)" : "transparent",
              color: isRegistering ? "#f8fafc" : "#94a3b8",
              fontWeight: isRegistering ? "700" : "500"
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={errorBannerStyle}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Role Picker (if Registering) */}
          {isRegistering && (
            <div>
              <label style={labelStyle}>Select Account Role</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setRole("creator")}
                  style={{
                    ...roleBtnStyle,
                    borderColor: form.role === "creator" ? "#10b981" : "var(--border-subtle)",
                    backgroundColor: form.role === "creator" ? "var(--primary-light)" : "var(--bg-input)",
                    color: form.role === "creator" ? "#10b981" : "#94a3b8"
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🎨</span> Creator
                </button>
                <button
                  type="button"
                  onClick={() => setRole("brand")}
                  style={{
                    ...roleBtnStyle,
                    borderColor: form.role === "brand" ? "#10b981" : "var(--border-subtle)",
                    backgroundColor: form.role === "brand" ? "var(--primary-light)" : "var(--bg-input)",
                    color: form.role === "brand" ? "#10b981" : "#94a3b8"
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🏢</span> Brand Partner
                </button>
              </div>
            </div>
          )}

          {isRegistering && (
            <div>
              <label style={labelStyle}>Full Name / Creator Handle</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Alex Rivera"
                required
              />
            </div>
          )}

          {isRegistering && form.role === "brand" && (
            <div>
              <label style={labelStyle}>Company / Brand Name</label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="e.g. NextGen Software Inc"
                required
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="creator@lazarus.io"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitBtnStyle,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading
              ? "Authenticating with Neon PostgreSQL..."
              : isRegistering
              ? "Create Lazarus Account 🚀"
              : "Sign In to Studio →"}
          </button>
        </form>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  backgroundColor: "var(--bg-canvas)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  position: "relative"
};

const cardStyle = {
  width: "100%",
  maxWidth: "460px",
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-lg)",
  padding: "36px 32px",
  boxShadow: "var(--shadow-lg)"
};

const logoIconStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "12px",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)"
};

const tabContainerStyle = {
  display: "flex",
  backgroundColor: "var(--bg-input)",
  borderRadius: "var(--radius-md)",
  padding: "4px",
  border: "1px solid var(--border-subtle)",
  marginBottom: "20px"
};

const tabButtonStyle = {
  flex: 1,
  padding: "8px",
  borderRadius: "6px",
  fontSize: "13px",
  transition: "all 0.15s ease"
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "#cbd5e1",
  marginBottom: "6px"
};

const roleBtnStyle = {
  padding: "10px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-subtle)",
  fontSize: "13px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "all 0.15s ease"
};

const submitBtnStyle = {
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "14px",
  padding: "12px",
  borderRadius: "var(--radius-md)",
  marginTop: "12px",
  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)"
};

const errorBannerStyle = {
  backgroundColor: "rgba(239, 68, 68, 0.12)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "#ef4444",
  padding: "10px 14px",
  borderRadius: "var(--radius-md)",
  fontSize: "13px",
  marginBottom: "16px"
};
