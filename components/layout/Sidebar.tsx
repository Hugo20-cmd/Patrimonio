"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  TrendingUp, LayoutDashboard, PieChart, Target, 
  Award, Settings, LogOut, ArrowRightLeft, DollarSign, Link as LinkIcon
} from "lucide-react";
import { getProfile } from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import { getSubscriptionStatus } from "@/app/actions/subscription";
import { useEffect } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/dashboard" },
  { icon: PieChart, label: "Carteira", href: "/portfolio" },
  { icon: ArrowRightLeft, label: "Lançamentos", href: "/transactions" },
  { icon: DollarSign, label: "Dividendos", href: "/dividends" },
  { icon: Target, label: "Metas", href: "/goals" },
  { icon: Award, label: "Conquistas", href: "/achievements" },
  { icon: LinkIcon, label: "Conexões", href: "/connections" },
];

export default function Sidebar({ 
  isOpen = false, 
  setIsOpen 
}: { 
  isOpen?: boolean; 
  setIsOpen?: (v: boolean) => void; 
}) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [subStatus, setSubStatus] = useState("free");

  useEffect(() => {
    getProfile().then(setProfile);
    getSubscriptionStatus().then((res) => setSubStatus(res.status));
  }, [pathname]);

  return (
    <aside 
      style={{
        width: "var(--sidebar-width)",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
      className={`sidebar-container ${isOpen ? "open" : ""}`}
    >
      {/* Logo */}
      <div style={{ padding: "24px", marginBottom: "12px" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "linear-gradient(135deg, #00d4aa 0%, #4f6ef7 100%)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 15px rgba(0,212,170,0.3)",
          }}>
            <TrendingUp size={18} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text-primary)" }}>
            PATRIMÔNIO<span style={{ color: "var(--green-primary)" }}>+</span>
          </span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 16px", marginBottom: "8px" }}>
          Menu Principal
        </div>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User / Bottom */}
      <div style={{ padding: "24px 16px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: "6px" }}>
        <Link href="/settings" className={`sidebar-link ${pathname === "/settings" ? "active" : ""}`}>
          <Settings size={18} />
          Configurações
        </Link>
        <form action={logout} style={{ width: "100%" }}>
          <button type="submit" className="sidebar-link" style={{ width: "100%", background: "transparent", border: "none", textAlign: "left", cursor: "pointer" }}>
            <LogOut size={18} />
            Sair
          </button>
        </form>

        {/* UPGRADE BUTTON (IF FREE) */}
        {subStatus === "free" && (
          <div style={{ marginTop: "12px", marginBottom: "4px" }}>
            <Link 
              href={profile?.id ? `https://buy.stripe.com/14A6oH0FIantgEh0NQcwg00?client_reference_id=${profile.id}` : "https://buy.stripe.com/14A6oH0FIantgEh0NQcwg00"} 
              className="btn btn-primary" 
              style={{ width: "100%", justifyContent: "center", padding: "8px", fontSize: "0.85rem", gap: "6px" }}
              target="_blank"
            >
              <Award size={16} /> Fazer Upgrade
            </Link>
          </div>
        )}

        {/* User Card */}
        <div style={{
          marginTop: "16px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "12px",
          padding: "12px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "var(--gradient-blue)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.8rem", fontWeight: 700, color: "#fff",
            overflow: "hidden"
          }}>
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (profile?.name || "Inv").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {profile?.name || "Novo Investidor"}
            </div>
            <div style={{ fontSize: "0.75rem", color: subStatus === "premium" ? "var(--purple-primary)" : "var(--green-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
              {subStatus === "premium" ? (
                <>Premium <Award size={12} /></>
              ) : "Free"}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar-container {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sidebar-container.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}
