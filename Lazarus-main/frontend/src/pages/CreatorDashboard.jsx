import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CreatorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [portfolio, setPortfolio] = useState({
    platform: "youtube",
    url: "",
    views: ""
  });

  // Load saved portfolio
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("creatorPortfolio"));
    if (saved) setPortfolio(saved);
  }, []);

  const handleChange = (e) => {
    setPortfolio({ ...portfolio, [e.target.name]: e.target.value });
  };

  const savePortfolio = () => {
    localStorage.setItem("creatorPortfolio", JSON.stringify(portfolio));
    alert("Portfolio saved!");
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h2>Creator Dashboard</h2>

      <p><strong>Name:</strong> {user?.name}</p>
      <p><strong>Role:</strong> Creator</p>

      <hr />

      <button onClick={() => navigate("/create-project")}>
        ➕ Create New Project
      </button>

      <hr />

      <h3>Portfolio</h3>

      <select name="platform" value={portfolio.platform} onChange={handleChange}>
        <option value="youtube">YouTube</option>
        <option value="instagram">Instagram</option>
        <option value="shorts">YouTube Shorts</option>
      </select>

      <br /><br />

      <input
        type="url"
        name="url"
        placeholder="Video / Profile URL"
        value={portfolio.url}
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="number"
        name="views"
        placeholder="Most Viewed Video (views)"
        value={portfolio.views}
        onChange={handleChange}
      />

      <br /><br />

      <button onClick={savePortfolio}>Save Portfolio</button>

      <hr />

      <button onClick={() => navigate("/creator-profile")}>
        🌍 View Public Profile
      </button>

      <br /><br />

      <button onClick={logout} style={{ color: "red" }}>
        Logout
      </button>
    </div>
  );
}