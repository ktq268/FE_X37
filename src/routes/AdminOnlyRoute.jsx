import React from "react";
import { Navigate } from "react-router-dom";

const AdminOnlyRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  let role = (localStorage.getItem("role") || "").toLowerCase();

  if (token && !role) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      role = String(payload?.user?.role || payload?.role || "").toLowerCase();
      if (role) localStorage.setItem("role", role);
    } catch (e) {}
  }

  if (!token || role !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default AdminOnlyRoute;
