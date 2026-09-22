import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Sidebar from "../common/Sidebar";

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-main)" }}>
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      
      <div style={{ display: "flex", flex: 1, position: "relative", width: "100%" }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main
          style={{
            flex: 1,
            padding: "28px 32px",
            overflowY: "auto",
            maxWidth: "1440px",
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
