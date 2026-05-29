"use client";

import { useState } from "react";
import { Bell, Search, Menu, Plus, Zap } from "lucide-react";
import { mockUser } from "@/lib/mock-data";

export default function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header style={{
      height: "var(--topbar-height)",
      borderBottom: "1px solid var(--border-subtle)",
      background: "rgba(8,8,16,0.85)",
      backdropFilter: "blur(20px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 40,
    }}>
      {/* Mobile Menu & Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
        <button className="mobile-menu-btn" style={{
          background: "none", border: "none", color: "var(--text-primary)",
          display: "none", cursor: "pointer",
        }}>
          <Menu size={24} />
        </button>
        
        <div style={{
          position: "relative",
          maxWidth: "400px",
          width: "100%",
        }} className="desktop-search">
          <Search size={16} style={{
            position: "absolute", left: "14px", top: "50%",
            transform: "translateY(-50%)", color: "var(--text-tertiary)",
          }} />
          <input 
            type="text" 
            placeholder="Buscar ativos (ex: PETR4, IVVB11)..." 
            style={{
              width: "100%",
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "12px",
              padding: "10px 16px 10px 40px",
              fontSize: "0.85rem",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          <div style={{
            position: "absolute", right: "8px", top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border-default)",
            borderRadius: "6px",
            padding: "2px 6px",
            fontSize: "0.65rem",
            color: "var(--text-tertiary)",
            fontWeight: 600,
          }}>
            Ctrl K
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Level / XP */}
        <div style={{ 
          display: "flex", alignItems: "center", gap: "8px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "999px",
          padding: "4px 12px 4px 4px",
        }} className="desktop-level">
          <div style={{
            width: "24px", height: "24px", borderRadius: "50%",
            background: "var(--gradient-blue)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 800, color: "#fff",
          }}>
            {mockUser.level}
          </div>
          <div style={{ width: "60px", height: "4px", background: "var(--bg-elevated)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${(mockUser.xp / mockUser.xpToNextLevel) * 100}%`, height: "100%", background: "var(--gradient-blue)" }} />
          </div>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--blue-primary)" }}>Nível</span>
        </div>

        {/* Action Button */}
        <button className="btn btn-primary btn-sm" style={{ gap: "6px" }}>
          <Plus size={14} />
          <span className="desktop-text">Lançar Ativo</span>
        </button>

        {/* Notifications */}
        <button style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--text-secondary)",
          position: "relative",
          cursor: "pointer",
        }}>
          <Bell size={18} />
          <div style={{
            position: "absolute", top: "-2px", right: "-2px",
            width: "10px", height: "10px", borderRadius: "50%",
            background: "var(--red-primary)",
            border: "2px solid var(--bg-primary)",
          }} />
        </button>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .desktop-search { display: none !important; }
          .desktop-level { display: none !important; }
          .desktop-text { display: none !important; }
        }
      `}</style>
    </header>
  );
}
