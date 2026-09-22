import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import Sidebar from "../common/Sidebar";

export const AuthLayout = ({ title, subtitle, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0f172a 0%, #134e4a 100%)",
        position: "relative",
      }}
    >
      {/* Off-canvas Healthcare Navigation Drawer (Hidden by default) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Top Header Bar with Hamburger Menu */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          width: "100%",
        }}
      >
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            color: "#ffffff",
            background: "rgba(255, 255, 255, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            padding: 0,
          }}
          aria-label={isSidebarOpen ? "Close Healthcare Navigation" : "Open Healthcare Navigation"}
          title={isSidebarOpen ? "Close Menu" : "Healthcare Navigation (☰)"}
          id="healthcare-hamburger-btn"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3.5" y1="6" x2="20.5" y2="6" />
            <line x1="3.5" y1="12" x2="20.5" y2="12" />
            <line x1="3.5" y1="18" x2="20.5" y2="18" />
          </svg>
        </button>

        <Link
          to="/"
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "0.875rem",
            textDecoration: "none",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← Home
        </Link>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px 16px 40px 16px",
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
    </div>
  );
};

export default AuthLayout;
