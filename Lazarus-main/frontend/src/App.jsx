import { Routes, Route, Link } from "react-router-dom";
import Creator from "./pages/Creator";
import Investor from "./pages/Investor";

import Login from "./pages/Login";
import CreatorDashboard from "./pages/CreatorDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import InvestorDashboard from "./pages/InvestorDashboard";
import CreateProject from "./pages/CreateProject";
import ProjectPage from "./pages/ProjectPage";
import CreatorProfile from "./pages/CreatorProfile";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* Creator Routes */}
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

      {/* Brand Routes */}
      <Route
        path="/brand"
        element={
          <ProtectedRoute role="brand">
            <BrandDashboard />
          </ProtectedRoute>
        }
      />

      {/* Investor Routes */}
      <Route
        path="/investor"
        element={
          <ProtectedRoute role="investor">
            <InvestorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Shared / Authenticated */}
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