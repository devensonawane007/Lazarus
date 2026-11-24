import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("lazarus_token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Not logged in or no valid token
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access
  if (role) {
    const userRole = (user.role || "").toUpperCase();
    const allowedRoles = Array.isArray(role)
      ? role.map((r) => r.toUpperCase())
      : [role.toUpperCase()];

    // ADMIN can access any workspace
    if (userRole !== "ADMIN" && !allowedRoles.includes(userRole)) {
      if (userRole === "BRAND") return <Navigate to="/brand" replace />;
      if (userRole === "ADMIN") return <Navigate to="/admin" replace />;
      return <Navigate to="/creator" replace />;
    }
  }

  return children;
}
