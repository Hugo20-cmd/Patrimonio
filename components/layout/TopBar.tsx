"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Menu, Check, CheckCheck, Info, TrendingUp, DollarSign, Trophy } from "lucide-react";
import { getProfile } from "@/app/actions/profile";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/app/actions/notifications";
import { supabase } from "@/lib/supabase";
import PaywallModal from "@/components/PaywallModal";

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora mesmo";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

function NotifIcon({ type }: { type: string }) {
  const styles = { width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
  if (type === "achievement") return <div style={{ ...styles, background: "rgba(255,196,0,0.15)" }}><Trophy size={15} color="#ffc400" /></div>;
  if (type === "dividend")    return <div style={{ ...styles, background: "rgba(0,212,170,0.15)" }}><DollarSign size={15} color="#00d4aa" /></div>;
  if (type === "alert")       return <div style={{ ...styles, background: "rgba(255,80,80,0.15)" }}><TrendingUp size={15} color="#ff5050" /></div>;
  return                             <div style={{ ...styles, background: "rgba(79,110,247,0.15)" }}><Info size={15} color="#4f6ef7" /></div>;
}

const POPULAR_ASSETS = [
  { ticker: "PETR4", name: "Petrobras PN" },
  { ticker: "VALE3", name: "Vale ON" },
  { ticker: "ITUB4", name: "Itaú Unibanco PN" },
  { ticker: "BBDC4", name: "Bradesco PN" },
  { ticker: "BBAS3", name: "Banco do Brasil ON" },
  { ticker: "WEGE3", name: "WEG ON" },
  { ticker: "B3SA3", name: "B3 ON" },
  { ticker: "ELET3", name: "Eletrobras ON" },
  { ticker: "RENT3", name: "Localiza ON" },
  { ticker: "BOVA11", name: "iShares Ibovespa (ETF)" },
  { ticker: "IVVB11", name: "iShares S&P 500 (ETF)" },
  { ticker: "SMAL11", name: "iShares Small Cap (ETF)" },
  { ticker: "HASH11", name: "Hashdex Crypto (ETF)" },
  { ticker: "NASD11", name: "XP Nasdaq 100 (ETF BR)" },
  { ticker: "GOLD11", name: "XP Ouro (ETF BR)" },
  { ticker: "XINA11", name: "Trend MSCI China (ETF BR)" },
  { ticker: "URPR11", name: "Urca Prime Renda (FII)" },
  { ticker: "MXRF11", name: "Maxi Renda (FII)" },
  { ticker: "HGLG11", name: "CSHG Logística (FII)" },
  { ticker: "SPY", name: "SPDR S&P 500 (ETF EUA)" },
  { ticker: "QQQ", name: "Invesco QQQ Trust (ETF EUA)" },
  { ticker: "VOO", name: "Vanguard S&P 500 (ETF EUA)" },
  { ticker: "DIA", name: "SPDR Dow Jones (ETF EUA)" },
  { ticker: "ARKK", name: "ARK Innovation (ETF EUA)" },
  { ticker: "VTI", name: "Vanguard Total Stock (ETF EUA)" }
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [profile, setProfile]         = useState<any>(null);
  const [notifs, setNotifs]           = useState<any[]>([]);
  const [unread, setUnread]           = useState(0);
  const [showNotifs, setShowNotifs]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);

  // Fetch profile & notifications on route change
  useEffect(() => {
    getProfile().then(setProfile);
    getNotifications().then(setNotifs);
    getUnreadCount().then(setUnread);
  }, [pathname]);

  // Real-time notifications subscription
  useEffect(() => {
    let channel: any;
    async function setupRealtime() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;

      channel = supabase.channel('realtime-notifs')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${data.user.id}` },
          (payload) => {
            setNotifs((prev) => [payload.new, ...prev]);
            setUnread((prev) => prev + 1);
          }
        )
        .subscribe();
    }
    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  }

  async function handleMarkOne(id: string) {
    await markAsRead(id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnread((prev) => Math.max(0, prev - 1));
  }

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
      {/* Left – Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
        <button 
          className="mobile-menu-btn" 
          onClick={onMenuClick}
          style={{ background: "none", border: "none", color: "var(--text-primary)", display: "none", cursor: "pointer" }}
        >
          <Menu size={24} />
        </button>

        <form 
          ref={searchRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              router.push(`/ativos/${searchQuery.trim().toUpperCase()}`);
              setShowSuggestions(false);
            }
          }}
          style={{ position: "relative", maxWidth: "400px", width: "100%" }} 
          className="desktop-search"
        >
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Buscar ativos (ex: PETR4, IVVB11)..."
            value={searchQuery}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            style={{ width: "100%", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "10px 16px 10px 40px", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }}
          />
          <button type="submit" style={{ display: "none" }}>Buscar</button>
          
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
              background: "var(--bg-card)", border: "1px solid var(--border-default)",
              borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              overflow: "hidden", zIndex: 50, animation: "slideDown 0.2s ease"
            }}>
              {POPULAR_ASSETS.filter(a => a.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6).map(asset => (
                <div
                  key={asset.ticker}
                  onClick={() => {
                    setSearchQuery(asset.ticker);
                    setShowSuggestions(false);
                    router.push(`/ativos/${asset.ticker}`);
                  }}
                  style={{
                    padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontWeight: 700, color: "var(--blue-primary)" }}>{asset.ticker}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{asset.name}</span>
                </div>
              ))}
              {POPULAR_ASSETS.filter(a => a.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--text-tertiary)", textAlign: "center" }}>
                  Pressione Enter para pesquisar "{searchQuery}"
                </div>
              )}
            </div>
          )}

          <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-default)", borderRadius: "6px", padding: "2px 6px", fontSize: "0.65rem", color: "var(--text-tertiary)", fontWeight: 600, pointerEvents: "none" }}>
            Enter ↵
          </div>
        </form>
      </div>

      {/* Right – Level + Bell */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

        {/* Avatar + Level pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "999px", padding: "4px 14px 4px 4px" }} className="desktop-level">
          <div style={{ position: "relative", width: "28px", height: "28px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--gradient-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#fff", overflow: "hidden", border: "2px solid var(--bg-card)" }}>
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (profile?.name || "NI").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
              )}
            </div>
            <div style={{ position: "absolute", bottom: "-3px", right: "-3px", width: "16px", height: "16px", borderRadius: "50%", background: "linear-gradient(135deg, #4f6ef7, #00d4aa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", fontWeight: 900, color: "#fff", border: "1.5px solid var(--bg-card)", lineHeight: 1 }}>
              {profile?.level || 1}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)", lineHeight: 1 }}>Nível {profile?.level || 1}</span>
            <div style={{ width: "50px", height: "3px", background: "var(--bg-elevated)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${((profile?.xp || 0) / (profile?.xpToNextLevel || 1000)) * 100}%`, height: "100%", background: "linear-gradient(90deg, #4f6ef7, #00d4aa)" }} />
            </div>
          </div>
        </div>

        {/* Bell + Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => {
              const isAdmin = profile?.email === ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br'].includes(profile?.email || userData?.user?.email);
              if (profile?.plan !== 'premium' && !isAdmin) {
                setShowPaywall(true);
              } else {
                setShowNotifs((v) => !v);
              }
            }}
            style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-card)", border: `1px solid ${showNotifs ? "var(--blue-primary)" : "var(--border-default)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: showNotifs ? "var(--blue-primary)" : "var(--text-secondary)", position: "relative", cursor: "pointer", transition: "all 0.2s" }}
          >
            <Bell size={18} />
            {unread > 0 && (
              <div style={{ position: "absolute", top: "-4px", right: "-4px", width: "18px", height: "18px", borderRadius: "50%", background: "linear-gradient(135deg, #ff5050, #ff8c00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 900, color: "#fff", border: "1.5px solid var(--bg-primary)" }}>
                {unread > 9 ? "9+" : unread}
              </div>
            )}
          </button>

          {/* Dropdown */}
          {showNotifs && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 10px)",
              width: "360px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              overflow: "hidden",
              animation: "slideDown 0.2s ease",
              zIndex: 100,
            }}>
              {/* Header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>Notificações</div>
                  {unread > 0 && <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{unread} não lida{unread !== 1 ? "s" : ""}</div>}
                </div>
                {unread > 0 && (
                  <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", color: "var(--blue-primary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <CheckCheck size={14} /> Marcar todas
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: "380px", overflowY: "auto" }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center" }}>
                    <Bell size={32} color="var(--text-tertiary)" style={{ marginBottom: "12px", opacity: 0.4 }} />
                    <div style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>Nenhuma notificação ainda</div>
                    <div style={{ color: "var(--text-tertiary)", fontSize: "0.75rem", marginTop: "4px" }}>Adicione ativos para começar a receber alertas</div>
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && handleMarkOne(n.id)}
                      style={{
                        display: "flex", gap: "12px", padding: "14px 20px",
                        borderBottom: "1px solid var(--border-subtle)",
                        background: n.is_read ? "transparent" : "rgba(79,110,247,0.04)",
                        cursor: n.is_read ? "default" : "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      <NotifIcon type={n.type} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: n.is_read ? 500 : 700, color: "var(--text-primary)", marginBottom: "2px" }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", lineHeight: 1.4, marginBottom: "4px" }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", opacity: 0.7 }}>
                          {timeAgo(n.created_at)}
                        </div>
                      </div>
                      {!n.is_read && (
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--blue-primary)", flexShrink: 0, marginTop: "4px" }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .desktop-search { display: none !important; }
          .desktop-level { display: none !important; }
        }
      `}</style>
    </header>
  );
}
