"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Plus, BarChart2, Globe } from "lucide-react";
import { addAsset } from "@/app/actions/assets";

const ASSET_CATEGORIES = {
  "acoes-br": {
    title: "Ações Brasileiras",
    icon: <TrendingUp size={18} />,
    assets: [
      { ticker: "PETR4", name: "Petrobras PN" },
      { ticker: "VALE3", name: "Vale ON" },
      { ticker: "ITUB4", name: "Itaú Unibanco PN" },
      { ticker: "BBDC4", name: "Bradesco PN" },
      { ticker: "BBAS3", name: "Banco do Brasil ON" },
      { ticker: "WEGE3", name: "WEG ON" },
      { ticker: "B3SA3", name: "B3 ON" },
      { ticker: "ELET3", name: "Eletrobras ON" },
      { ticker: "RENT3", name: "Localiza ON" },
      { ticker: "SUZB3", name: "Suzano ON" },
    ]
  },
  "etfs-br": {
    title: "ETFs Brasileiros",
    icon: <BarChart2 size={18} />,
    assets: [
      { ticker: "BOVA11", name: "iShares Ibovespa" },
      { ticker: "IVVB11", name: "iShares S&P 500" },
      { ticker: "SMAL11", name: "iShares Small Cap" },
      { ticker: "HASH11", name: "Hashdex Crypto" },
      { ticker: "NASD11", name: "XP Nasdaq 100" },
      { ticker: "GOLD11", name: "XP Ouro" },
      { ticker: "XINA11", name: "Trend MSCI China" },
    ]
  },
  "etfs-eua": {
    title: "Mercado Americano",
    icon: <Globe size={18} />,
    assets: [
      { ticker: "SPY", name: "SPDR S&P 500 ETF" },
      { ticker: "QQQ", name: "Invesco QQQ Trust" },
      { ticker: "VOO", name: "Vanguard S&P 500 ETF" },
      { ticker: "DIA", name: "SPDR Dow Jones ETF" },
      { ticker: "ARKK", name: "ARK Innovation ETF" },
      { ticker: "VTI", name: "Vanguard Total Stock ETF" },
      { ticker: "AAPL", name: "Apple Inc." },
      { ticker: "MSFT", name: "Microsoft Corp." },
      { ticker: "TSLA", name: "Tesla Inc." },
    ]
  }
};

export default function AtivosIndexPage() {
  const [ticker, setTicker] = useState("");
  const [activeTab, setActiveTab] = useState<"acoes-br" | "etfs-br" | "etfs-eua">("acoes-br");
  const [addingTicker, setAddingTicker] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      router.push(`/ativos/${ticker.trim().toUpperCase()}`);
    }
  };

  const handleAddAsset = async (e: React.MouseEvent, assetTicker: string) => {
    e.stopPropagation(); // prevent clicking the card and routing
    setAddingTicker(assetTicker);
    try {
      const formData = new FormData();
      formData.append("ticker", assetTicker);
      formData.append("name", assetTicker);
      formData.append("type", "stock");
      formData.append("quantity", "1");
      formData.append("averagePrice", "10.00"); 
      
      const res = await addAsset(formData);
      if (res.error) alert(res.error);
      else {
        alert(`${assetTicker} adicionado à sua carteira com sucesso!`);
      }
    } catch (err) {
      alert("Erro ao adicionar ativo.");
    } finally {
      setAddingTicker(null);
    }
  };

  return (
    <div style={{ paddingBottom: "60px" }}>
      {/* Header Search */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem" }}>Explorar Mercado</h1>
        <p style={{ color: "var(--text-tertiary)" }}>
          Pesquise por qualquer ativo ou explore as categorias abaixo para acompanhar gráficos e adicionar à sua carteira.
        </p>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "500px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Digite um ticker exato..."
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "16px", marginBottom: "24px", overflowX: "auto" }}>
        {(Object.keys(ASSET_CATEGORIES) as Array<keyof typeof ASSET_CATEGORIES>).map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "acoes-br" | "etfs-br" | "etfs-eua")}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px",
              background: activeTab === key ? "var(--blue-glow)" : "transparent",
              color: activeTab === key ? "var(--blue-primary)" : "var(--text-secondary)",
              border: `1px solid ${activeTab === key ? "var(--blue-primary)" : "transparent"}`,
              borderRadius: "999px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
              whiteSpace: "nowrap"
            }}
          >
            {ASSET_CATEGORIES[key as "acoes-br" | "etfs-br" | "etfs-eua"].icon}
            {ASSET_CATEGORIES[key as "acoes-br" | "etfs-br" | "etfs-eua"].title}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {ASSET_CATEGORIES[activeTab].assets.map(asset => (
          <div
            key={asset.ticker}
            onClick={() => router.push(`/ativos/${asset.ticker}`)}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "16px",
              padding: "20px",
              cursor: "pointer",
              transition: "transform 0.2s, border-color 0.2s",
              display: "flex", flexDirection: "column", gap: "16px",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "var(--border-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "var(--border-default)";
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>{asset.ticker}</h3>
                <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "6px", color: "var(--text-tertiary)" }}>
                  {activeTab === "acoes-br" ? "AÇÃO" : (activeTab.includes("etfs") ? "ETF" : "ATIVO")}
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{asset.name}</p>
            </div>
            
            <button
              onClick={(e) => handleAddAsset(e, asset.ticker)}
              disabled={addingTicker === asset.ticker}
              className="btn btn-secondary"
              style={{
                width: "100%", justifyContent: "center", gap: "6px",
                background: "rgba(0, 212, 170, 0.1)", color: "var(--green-primary)",
                border: "1px solid rgba(0, 212, 170, 0.2)"
              }}
            >
              {addingTicker === asset.ticker ? (
                "Adicionando..."
              ) : (
                <>
                  <Plus size={16} /> Adicionar à Carteira
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
