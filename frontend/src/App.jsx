import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import CreatorStudio from "./pages/CreatorStudio";
import BrandStudio from "./pages/BrandStudio";
import AdminStudio from "./pages/AdminStudio";
import CollaborationWorkspace from "./pages/CollaborationWorkspace";
import PublicMediaKit from "./pages/PublicMediaKit";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* =====================
          Public Marketing & Auth Routes
      ====================== */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/media-kit/:id" element={<PublicMediaKit />} />

      {/* =====================
          Creator Studio
      ====================== */}
      <Route
        path="/creator"
        element={
          <ProtectedRoute role="CREATOR">
            <CreatorStudio />
          </ProtectedRoute>
        }
      />

      {/* =====================
          Brand Studio
      ====================== */}
      <Route
        path="/brand"
        element={
          <ProtectedRoute role="BRAND">
            <BrandStudio />
          </ProtectedRoute>
        }
      />

      {/* =====================
          Admin Console
      ====================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminStudio />
          </ProtectedRoute>
        }
      />

      {/* =====================
          Collaboration Deal Room
      ====================== */}
      <Route
        path="/collaborations/:id"
        element={
          <ProtectedRoute>
            <CollaborationWorkspace />
          </ProtectedRoute>
        }
      />

      {/* =====================
          Legacy Route Compatibility Redirects
      ====================== */}
      <Route path="/home" element={<Navigate to="/creator" replace />} />
      <Route path="/creator-profile" element={<Navigate to="/creator" replace />} />
      <Route path="/brand/campaign" element={<Navigate to="/brand" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
