"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PresenceTracker from "@/components/layout/PresenceTracker";
import TickerTape from "@/components/layout/TickerTape";
import OneSignalProvider from "@/components/layout/OneSignalProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)", position: "relative" }}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="mobile-backdrop"
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)", zIndex: 40, backdropFilter: "blur(2px)"
          }}
        />
      )}

      {/* Fixed Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: "var(--sidebar-width)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        transition: "margin-left 0.3s ease",
        maxWidth: "100vw", // prevent horizontal overflow
        overflowX: "hidden"
      }} className="main-content">
        <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Page Content */}
        <div style={{ width: "100%", background: "#080810", padding: "0 24px" }}>
          <TickerTape />
        </div>
        <main style={{ 
          flex: 1, 
          padding: "16px 32px 32px",
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto"
        }}>
          {children}
        </main>
      </div>

      {/* Floating Menu Button Mobile */}
      <button
        className="mobile-fab-menu"
        onClick={() => setIsSidebarOpen(true)}
        style={{
          position: "fixed", bottom: "24px", left: "24px", zIndex: 40,
          width: "56px", height: "56px", borderRadius: "50%",
          background: "var(--green-primary)", color: "#000",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(0, 212, 170, 0.4)",
          border: "none", cursor: "pointer"
        }}
      >
        <Menu size={24} />
      </button>

      <PresenceTracker userEmail={user?.email || ""} userName={user?.user_metadata?.name || "User"} />
      <OneSignalProvider user={user} />

      <style jsx global>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            width: 100vw;
          }
          main {
            padding: 20px 16px !important;
          }
          .mobile-backdrop {
            display: block;
          }
          .mobile-fab-menu {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-backdrop {
            display: none !important;
          }
          .mobile-fab-menu {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
