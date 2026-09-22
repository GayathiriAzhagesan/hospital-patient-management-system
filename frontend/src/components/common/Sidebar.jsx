import React, { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  Home,
  X,
  HeartPulse,
} from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || "Patient";
  const sidebarRef = useRef(null);

  // Close sidebar on route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close sidebar on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!isOpen) return;
      // If click target is inside sidebar or the hamburger button, ignore
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest("#healthcare-hamburger-btn")
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  // Prevent background scrolling while sidebar drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const getDashboardPath = () => {
    switch ((role || "").toLowerCase()) {
      case "doctor":
        return "/dashboard/doctor";
      case "pharmacist":
        return "/dashboard/pharmacist";
      case "admin":
        return "/dashboard/admin";
      case "patient":
      default:
        return "/dashboard/patient";
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      path: getDashboardPath(),
      icon: LayoutDashboard,
    },
    {
      name: "Appointments",
      path: "/appointments",
      icon: Calendar,
    },
    {
      name: "Medical Records",
      path: "/records",
      icon: FileText,
    },
    {
      name: "Billing & Invoices",
      path: "/billing",
      icon: CreditCard,
    },
  ];

  return (
    <>
      {/* Backdrop overlay for outside click & focus trap */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          visibility: isOpen ? "visible" : "hidden",
          transition: "opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.28s",
        }}
        aria-hidden={!isOpen}
      />

      {/* Off-canvas Sliding Sidebar Drawer (Hidden by default on both desktop & mobile) */}
      <aside
        ref={sidebarRef}
        id="healthcare-sidebar-drawer"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "280px",
          maxWidth: "85vw",
          height: "100vh",
          background: "var(--bg-sidebar)",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px 16px",
          zIndex: 1000,
          boxShadow: isOpen ? "8px 0 32px rgba(15, 23, 42, 0.45)" : "none",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease",
          willChange: "transform",
          visibility: isOpen ? "visible" : "hidden",
          overflowY: "auto",
        }}
        aria-label="Healthcare Navigation"
      >
        <div>
          {/* Header with Title and Close Button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
              padding: "0 6px 16px 6px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: "0 2px 8px rgba(13, 148, 136, 0.3)",
                }}
              >
                <HeartPulse size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 800, letterSpacing: "-0.01em", color: "#ffffff" }}>
                  Medicare<span style={{ color: "var(--primary-400)" }}>Portal</span>
                </div>
                <div
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--slate-400)",
                    marginTop: "1px",
                  }}
                >
                  Healthcare Navigation
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "var(--slate-300)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                padding: 0,
              }}
              aria-label="Close Healthcare Navigation"
              title="Close Menu (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Core Healthcare Navigation Items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "11px 14px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: isActive ? "#ffffff" : "var(--slate-300)",
                    background: isActive ? "rgba(13, 148, 136, 0.25)" : "transparent",
                    borderLeft: isActive ? "3px solid var(--primary-400)" : "3px solid transparent",
                    transition: "all var(--transition-fast)",
                  })}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer with Authenticated Profile & Public Home link */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
          {user && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--primary-700)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  flexShrink: 0,
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--slate-400)" }}>
                  {user.role}
                </div>
              </div>
            </div>
          )}

          <NavLink
            to="/"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem",
              color: "var(--slate-400)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              transition: "all var(--transition-fast)",
            }}
          >
            <Home size={16} />
            <span>Public Home Page</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
