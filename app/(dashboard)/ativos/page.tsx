"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp } from "lucide-react";

export default function AtivosIndexPage() {
  const [ticker, setTicker] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      router.push(`/ativos/${ticker.trim().toUpperCase()}`);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "60vh", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--blue-glow)", color: "var(--blue-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
        <TrendingUp size={32} />
      </div>
      <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>Pesquisa de Ativos</h1>
      <p style={{ color: "var(--text-tertiary)", maxWidth: "500px", marginBottom: "32px", lineHeight: 1.6 }}>
        Consulte cotações em tempo real e gráficos avançados do TradingView. Digite o ticker do ativo (ex: PETR4, AAPL34, BOVA11) para analisar.
      </p>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "400px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Digite o ticker..."
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: "12px", border: "1px solid var(--border-default)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "1rem", outline: "none" }}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }} disabled={!ticker.trim()}>
          Buscar
        </button>
      </form>
    </div>
  );
}
