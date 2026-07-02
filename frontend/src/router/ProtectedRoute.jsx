import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      throw new Error("Invalid format");
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      localStorage.clear();
      return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }

    // Fixed: Cleanly returns component children to support your exact routing structure
    return children;
  } catch (error) {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }
}
