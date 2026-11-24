import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import ThemeToggle from "../components/ui/ThemeToggle";
import {
  ArrowLeft,
  Zap,
  AlertCircle,
  Palette,
  Building2,
  ArrowRight,
  User,
  Mail,
  Lock,
  Building
} from "lucide-react";

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
      {/* Top Navigation Bar */}
      <div style={topNavStyle}>
        <button
          onClick={() => navigate("/")}
          style={backBtnStyle}
        >
          <ArrowLeft size={16} />
          <span>Back to Lazarus Home</span>
        </button>
        <ThemeToggle />
      </div>

      <div style={cardStyle}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <div style={logoIconStyle}>
            <Zap size={22} color="#ffffff" />
          </div>
          <h2 style={cardHeadingStyle}>
            Lazarus <span style={{ color: "var(--brand-primary)" }}>V3</span>
          </h2>
          <p style={cardSubtitleStyle}>
            {isRegistering
              ? "Create your account to unlock verified analytics & brand opportunities"
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
              backgroundColor: !isRegistering ? "var(--bg-surface)" : "transparent",
              color: !isRegistering ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: !isRegistering ? "700" : "500",
              boxShadow: !isRegistering ? "var(--shadow-sm)" : "none"
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setErrorMessage(""); }}
            style={{
              ...tabButtonStyle,
              backgroundColor: isRegistering ? "var(--bg-surface)" : "transparent",
              color: isRegistering ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: isRegistering ? "700" : "500",
              boxShadow: isRegistering ? "var(--shadow-sm)" : "none"
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={errorBannerStyle}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
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
                    borderColor: form.role === "creator" ? "var(--brand-primary)" : "var(--border-subtle)",
                    backgroundColor: form.role === "creator" ? "var(--brand-light)" : "var(--bg-surface-raised)",
                    color: form.role === "creator" ? "var(--brand-primary)" : "var(--text-secondary)"
                  }}
                >
                  <Palette size={16} />
                  <span>Creator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("brand")}
                  style={{
                    ...roleBtnStyle,
                    borderColor: form.role === "brand" ? "var(--brand-primary)" : "var(--border-subtle)",
                    backgroundColor: form.role === "brand" ? "var(--brand-light)" : "var(--bg-surface-raised)",
                    color: form.role === "brand" ? "var(--brand-primary)" : "var(--text-secondary)"
                  }}
                >
                  <Building2 size={16} />
                  <span>Brand Partner</span>
                </button>
              </div>
            </div>
          )}

          {isRegistering && (
            <div>
              <label style={labelStyle}>Full Name / Creator Handle</label>
              <div style={inputWrapperStyle}>
                <User size={16} style={inputIconStyle} />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Rivera"
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {isRegistering && form.role === "brand" && (
            <div>
              <label style={labelStyle}>Company / Brand Name</label>
              <div style={inputWrapperStyle}>
                <Building size={16} style={inputIconStyle} />
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="e.g. NextGen Software Inc"
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={inputWrapperStyle}>
              <Mail size={16} style={inputIconStyle} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="creator@lazarus.io"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={inputWrapperStyle}>
              <Lock size={16} style={inputIconStyle} />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitBtnStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? (
              <span>Authenticating with Neon PostgreSQL...</span>
            ) : isRegistering ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Create Lazarus Account <ArrowRight size={16} />
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Sign In to Studio <ArrowRight size={16} />
              </span>
            )}
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
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  position: "relative"
};

const topNavStyle = {
  position: "absolute",
  top: "24px",
  left: "32px",
  right: "32px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const backBtnStyle = {
  color: "var(--text-secondary)",
  fontSize: "13.5px",
  fontWeight: "600",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "6px 0",
  transition: "color 0.15s ease"
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
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px var(--brand-glow)"
};

const cardHeadingStyle = {
  fontSize: "24px",
  fontWeight: "800",
  color: "var(--text-primary)",
  marginTop: "12px",
  letterSpacing: "-0.02em"
};

const cardSubtitleStyle = {
  fontSize: "13px",
  color: "var(--text-muted)",
  marginTop: "4px",
  lineHeight: 1.45
};

const tabContainerStyle = {
  display: "flex",
  backgroundColor: "var(--bg-surface-raised)",
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
  border: "none",
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "var(--text-secondary)",
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
  cursor: "pointer",
  transition: "all 0.15s ease"
};

const inputWrapperStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center"
};

const inputIconStyle = {
  position: "absolute",
  left: "12px",
  color: "var(--text-muted)",
  pointerEvents: "none"
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px 10px 38px",
  backgroundColor: "var(--bg-input)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-primary)",
  fontSize: "13.5px",
  outline: "none",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease"
};

const submitBtnStyle = {
  background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "14px",
  padding: "12px",
  borderRadius: "var(--radius-md)",
  marginTop: "12px",
  boxShadow: "0 4px 14px var(--brand-glow)",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const errorBannerStyle = {
  backgroundColor: "var(--color-red-light)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "var(--color-red)",
  padding: "10px 14px",
  borderRadius: "var(--radius-md)",
  fontSize: "13px",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};
