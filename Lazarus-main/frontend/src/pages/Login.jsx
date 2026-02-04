import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", role: "creator" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify(form));
    if (form.role === "creator") navigate("/creator");
    if (form.role === "brand") navigate("/brand");
    if (form.role === "investor") navigate("/investor");
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00ff66, #00dd55, #00bb44)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <style>{`
        input, select, button { transition: all 0.2s; }
        input:focus, select:focus { border-color: #00b96f; box-shadow: 0 0 0 3px rgba(0,217,132,0.1); outline: none; }
        button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,185,111,0.4); }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#fff',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', textAlign: 'center', marginBottom: '32px', color: '#1d1d1f' }}>Sign in</h1>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '16px 18px',
              border: '1px solid #e5e5e5',
              borderRadius: '14px',
              fontSize: '16px',
              backgroundColor: '#fafafa',
              boxSizing: 'border-box',
              marginBottom: '16px'
            }}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '16px 18px',
              border: '1px solid #e5e5e5',
              borderRadius: '14px',
              fontSize: '16px',
              backgroundColor: '#fafafa',
              boxSizing: 'border-box',
              marginBottom: '24px',
              cursor: 'pointer'
            }}
          >
            <option value="creator">Creator</option>
            <option value="brand">Brand</option>
            <option value="investor">Investor</option>
          </select>

          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#00b96f',
              color: '#fff',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '14px',
              fontSize: '17px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="#" style={{ color: '#00b96f', fontSize: '14px', textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, borderTop: '1px solid #e5e5e5' }} />
          <span style={{ padding: '0 16px', fontSize: '13px', color: '#86868b' }}>Don't have an account?</span>
          <div style={{ flex: 1, borderTop: '1px solid #e5e5e5' }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="#" style={{ color: '#00b96f', fontSize: '14px', textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>
            Create yours now
          </a>
        </div>
      </div>
    </div>
  );
}