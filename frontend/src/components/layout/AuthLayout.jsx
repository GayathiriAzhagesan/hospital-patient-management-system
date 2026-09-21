import React from "react";
import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";

export const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        background: "linear-gradient(135deg, #0f172a 0%, #134e4a 100%)",
        position: "relative",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          padding: "36px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, var(--primary-600), var(--primary-800))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <HeartPulse size={26} />
            </div>
            <span
              style={{
                fontSize: "1.375rem",
                fontWeight: 800,
                color: "var(--slate-900)",
                letterSpacing: "-0.02em",
              }}
            >
              Medicare<span style={{ color: "var(--primary-600)" }}>Portal</span>
            </span>
          </Link>

          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--slate-900)" }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", marginTop: "6px" }}>
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
