import React from "react";

export const StatCard = ({ title, value, change, icon: Icon, color = "teal" }) => {
  const colorMap = {
    teal: { bg: "#f0fdfa", text: "#0d9488" },
    blue: { bg: "#eff6ff", text: "#2563eb" },
    indigo: { bg: "#eef2ff", text: "#4f46e5" },
    emerald: { bg: "#ecfdf5", text: "#059669" },
    amber: { bg: "#fffbeb", text: "#d97706" },
    rose: { bg: "#fef2f2", text: "#e11d48" },
  };

  const currentTheme = colorMap[color] || colorMap.teal;

  return (
    <div className="stat-card">
      {Icon && (
        <div
          className="stat-icon"
          style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
        >
          <Icon size={24} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--slate-500)" }}>
          {title}
        </p>
        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "2px", color: "var(--slate-900)" }}>
          {value}
        </h3>
        {change && (
          <span style={{ fontSize: "0.75rem", color: "var(--slate-400)", marginTop: "4px", display: "block" }}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
