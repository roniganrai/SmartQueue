import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * allowedRoles: array of allowed role strings, e.g. ['normal'] or ['service']
 * If allowedRoles omitted, only checks authentication.
 */
export default function ProtectedRoute({ allowedRoles = null }) {
  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "null");
    } catch {
      return null;
    }
  })();

  // not logged in
  if (!userInfo?.token) {
    return <Navigate to="/login" replace />;
  }

  // if roles are provided, check them
  if (allowedRoles && !allowedRoles.includes(userInfo.user?.role)) {
    // redirect to user's own dashboard (safe fallback)
    const role = userInfo.user?.role;
    if (role === "service") return <Navigate to="/service/dashboard" replace />;
    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/user/dashboard" replace />;
  }

  // allowed
  return <Outlet />;
}
