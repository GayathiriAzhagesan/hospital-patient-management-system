import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-main)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--border-color)",
              borderTopColor: "var(--primary-600)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px auto",
            }}
          />
          <p style={{ color: "var(--slate-500)", fontSize: "0.875rem" }}>Verifying security session...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div className="card" style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center" }}>
          <h2 style={{ color: "var(--rose-600)", marginBottom: "10px" }}>Access Restricted</h2>
          <p style={{ color: "var(--slate-600)", fontSize: "0.875rem", marginBottom: "20px" }}>
            Your account role (<strong>{user.role}</strong>) does not have clearance to view this module.
          </p>
          <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
