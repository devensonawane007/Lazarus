import { Routes, Route, Link } from "react-router-dom";
import Creator from "./pages/Creator";
import Investor from "./pages/Investor";

export default function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Lazarus Platform</h1>

      <nav style={{ marginBottom: "20px" }}>
        <Link to="/creator" style={{ marginRight: "15px" }}>
          Creator Dashboard
        </Link>
        <Link to="/investor">
          Investor Dashboard
        </Link>
      </nav>

      <Routes>
        <Route path="/creator" element={<Creator />} />
        <Route path="/investor" element={<Investor />} />
      </Routes>
    </div>
  );
}