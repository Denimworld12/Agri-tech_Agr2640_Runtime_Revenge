import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AppBar from "./AppBar";
import FloatingChatbot from "./FloatingChatbot";

const Layout = ({ farmerData, onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState("en");

  const toggleLanguage = () => {
    setLanguage((prev) => {
      if (prev === "en") return "hi";
      if (prev === "hi") return "mr";
      if (prev === "mr") return "ml";
      return "en";
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        language={language}
      />
      <div className="flex-1 flex flex-col">
        <AppBar
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          language={language}
          toggleLanguage={toggleLanguage}
          farmerData={farmerData}
          onLogout={onLogout}
        />
        {/* Content area with proper spacing for fixed AppBar and bottom navigation */}
        <div className="flex-1 overflow-y-auto pt-16 pb-20 lg:pb-0">
          <Outlet context={{ language }} />
        </div>
      </div>

      {/* Floating Chatbot - hidden on mobile/tablet, available on desktop */}
      <FloatingChatbot language={language} />
    </div>
  );
};

export default Layout;
