import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import CreatorDashboard from "./pages/CreatorDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import InvestorDashboard from "./pages/InvestorDashboard";
import CreateProject from "./pages/CreateProject";
import ProjectPage from "./pages/ProjectPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/creator" element={<CreatorDashboard />} />
      <Route path="/brand" element={<BrandDashboard />} />
      <Route path="/investor" element={<InvestorDashboard />} />

      {/* Existing routes */}
      <Route path="/create-project" element={<CreateProject />} />
      <Route path="/project" element={<ProjectPage />} />
    </Routes>
  );
}

export default App;
