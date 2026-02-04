import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    role: "creator"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Save user info (hackathon shortcut)
    localStorage.setItem("user", JSON.stringify(form));

    // Redirect based on role
    if (form.role === "creator") navigate("/creator");
    if (form.role === "brand") navigate("/brand");
    if (form.role === "investor") navigate("/investor");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Lazarus Login</h2>

      <form onSubmit={handleLogin}>
        <input
          name="name"
          placeholder="Your Name"
          onChange={handleChange}
          required
        />
        <br /><br />

        <select name="role" onChange={handleChange}>
          <option value="creator">Creator</option>
          <option value="brand">Brand</option>
          <option value="investor">Investor</option>
        </select>

        <br /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
