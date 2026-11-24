import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("lazarus_token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Not logged in or no valid token
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Role-based access (case-insensitive check)
  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
