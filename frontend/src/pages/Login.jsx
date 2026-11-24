import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "creator"
  });

  const handleChange = (e) => {
    setErrorMessage("");
    setForm({ ...form, [e.target.name]: e.target.value });
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
          role: form.role
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

      // Clear navigation based on actual user role
      if (userRole === "brand") {
        navigate("/brand");
      } else if (userRole === "investor") {
        navigate("/investor");
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>{`
        input, select, button { transition: all 0.2s; }
        input:focus, select:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); outline: none; }
        button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(5,150,105,0.35); }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '44px 38px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)'
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
            Lazarus <span style={{ color: '#059669' }}>V2</span>
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '6px' }}>
            Creator Economy, Brand Campaigns & Escrow Platform
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: '#f3f4f6',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setErrorMessage(""); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              background: !isRegistering ? '#ffffff' : 'transparent',
              color: !isRegistering ? '#111827' : '#6b7280',
              boxShadow: !isRegistering ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setErrorMessage(""); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '9px',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              background: isRegistering ? '#ffffff' : 'transparent',
              color: isRegistering ? '#111827' : '#6b7280',
              boxShadow: isRegistering ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleAuth}>
          {isRegistering && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Full Name / Brand Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. John Doe / Nike Studio"
                value={form.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  backgroundColor: '#fafafa',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="text"
              name="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                backgroundColor: '#fafafa',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                backgroundColor: '#fafafa',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {isRegistering && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Account Persona
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  backgroundColor: '#fafafa',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="creator">🎨 Creator (Build projects & apply to brand campaigns)</option>
                <option value="brand">🏢 Brand (Launch sponsor campaigns & hire creators)</option>
                <option value="investor">💼 Investor (Pledge escrow funding & earn revenue share)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#059669',
              color: '#ffffff',
              fontWeight: '600',
              padding: '15px',
              borderRadius: '12px',
              fontSize: '16px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Processing..." : isRegistering ? "Register Account" : "Sign In to Lazarus"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
            Powered by Neon Hosted PostgreSQL & Smart Escrow State Engine
          </p>
        </div>
      </div>
    </div>
  );
}
