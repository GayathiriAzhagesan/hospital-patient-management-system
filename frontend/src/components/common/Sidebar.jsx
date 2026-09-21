import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  Users,
  Stethoscope,
  Pill,
  ShieldAlert,
  Home,
} from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || "Patient";

  const getDashboardPath = () => {
    switch (role) {
      case "Doctor":
        return "/dashboard/doctor";
      case "Pharmacist":
        return "/dashboard/pharmacist";
      case "Admin":
        return "/dashboard/admin";
      case "Patient":
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
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            zIndex: 40,
          }}
          className="lg-hidden"
        />
      )}

      <aside
        style={{
          width: "260px",
          background: "var(--bg-sidebar)",
          color: "#ffffff",
          minHeight: "calc(100vh - 70px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 16px",
          transition: "transform var(--transition-normal)",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ marginBottom: "24px", padding: "0 8px" }}>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--slate-400)",
              }}
            >
              Healthcare Navigation
            </span>
          </div>

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
                    padding: "10px 14px",
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

        <div>
          <NavLink
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem",
              color: "var(--slate-400)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
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
