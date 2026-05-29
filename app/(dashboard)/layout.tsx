"use client";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: "var(--sidebar-width)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        transition: "margin-left 0.3s ease",
      }} className="main-content">
        <TopBar />
        
        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: "32px",
          position: "relative",
        }}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
          main {
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
