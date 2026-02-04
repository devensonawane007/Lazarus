import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import CreatorDashboard from "./pages/CreatorDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import InvestorDashboard from "./pages/InvestorDashboard";
import CreateProject from "./pages/CreateProject";
import ProjectPage from "./pages/ProjectPage";
import CreatorProfile from "./pages/CreatorProfile";
import MOU from "./pages/MOU";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* =====================
          Public Route
      ====================== */}
      <Route path="/" element={<Login />} />

      {/* =====================
          MOU Route (Role-agnostic but authenticated)
      ====================== */}
      <Route
        path="/mou"
        element={
          <ProtectedRoute>
            <MOU />
          </ProtectedRoute>
        }
      />

      {/* =====================
          Creator Routes
      ====================== */}
      <Route
        path="/home"
        element={
          <ProtectedRoute role="creator">
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator"
        element={
          <ProtectedRoute role="creator">
            <CreatorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-project"
        element={
          <ProtectedRoute role="creator">
            <CreateProject />
          </ProtectedRoute>
        }
      />

      <Route
        path="/creator-profile"
        element={
          <ProtectedRoute role="creator">
            <CreatorProfile />
          </ProtectedRoute>
        }
      />

      {/* =====================
          Brand Routes
      ====================== */}
      <Route
        path="/brand"
        element={
          <ProtectedRoute role="brand">
            <BrandDashboard />
          </ProtectedRoute>
        }
      />

      {/* =====================
          Investor Routes
      ====================== */}
      <Route
        path="/investor"
        element={
          <ProtectedRoute role="investor">
            <InvestorDashboard />
          </ProtectedRoute>
        }
      />

      {/* =====================
          Shared / Authenticated
      ====================== */}
      <Route
        path="/project"
        element={
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
