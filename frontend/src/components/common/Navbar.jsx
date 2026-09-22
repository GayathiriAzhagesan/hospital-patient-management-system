import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Bell, HeartPulse, User } from "lucide-react";
import StatusBadge from "./StatusBadge";

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      style={{
        height: "70px",
        background: "#ffffff",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* 3-line Hamburger Menu Icon (☰) - Always visible on desktop and mobile */}
        <button
          onClick={onToggleSidebar}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            color: isSidebarOpen ? "var(--primary-600)" : "var(--slate-700)",
            background: isSidebarOpen ? "var(--primary-50)" : "#ffffff",
            border: "1px solid",
            borderColor: isSidebarOpen ? "var(--primary-300)" : "var(--border-color)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            padding: 0,
          }}
          aria-label={isSidebarOpen ? "Close Healthcare Navigation" : "Open Healthcare Navigation"}
          title={isSidebarOpen ? "Close Menu" : "Healthcare Navigation (☰)"}
          id="healthcare-hamburger-btn"
        >
          {/* 3-line hamburger menu icon (☰) */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3.5" y1="6" x2="20.5" y2="6" />
            <line x1="3.5" y1="12" x2="20.5" y2="12" />
            <line x1="3.5" y1="18" x2="20.5" y2="18" />
          </svg>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--primary-600), var(--primary-800))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
            }}
          >
            <HeartPulse size={20} />
          </div>
          <span style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--slate-900)", letterSpacing: "-0.02em" }}>
            Medicare<span style={{ color: "var(--primary-600)" }}>Portal</span>
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        {user ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--primary-100)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "var(--primary-100)",
                    color: "var(--primary-700)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--slate-900)" }}>
                  {user.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <StatusBadge role={user.role} />
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Sign Out"
              style={{ color: "var(--rose-600)" }}
            >
              <LogOut size={16} />
              <span style={{ display: "none" }} className="md-inline">Logout</span>
            </button>
          </>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
