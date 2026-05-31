"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { addAsset } from "@/app/actions/assets";

export default function AssetDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params.ticker as string)?.toUpperCase();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!ticker || !containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    let tvSymbol = ticker;
    const isBrazilian = /^[A-Z]{4}\d{1,2}$/i.test(ticker) || ticker === "IBOV";
    
    if (isBrazilian) {
      tvSymbol = `BMFBOVESPA:${ticker}`;
    } else if (ticker === "BTC") {
      tvSymbol = "BINANCE:BTCUSD";
    } else if (ticker === "ETH") {
      tvSymbol = "BINANCE:ETHUSD";
    } else if (ticker === "SOL") {
      tvSymbol = "BINANCE:SOLUSD";
    }

    const config = {
      autosize: true,
      symbol: tvSymbol,
      interval: "D",
      timezone: "America/Sao_Paulo",
      theme: "dark",
      style: "1",
      locale: "br",
      enable_publishing: false,
      backgroundColor: "#080810",
      gridColor: "#1e1e2d",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: "tradingview_widget"
    };

    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);

  }, [ticker]);

  const handleAddAsset = async () => {
    setAdding(true);
    try {
      const formData = new FormData();
      formData.append("ticker", ticker);
      formData.append("name", ticker);
      formData.append("type", "stock");
      formData.append("quantity", "1");
      formData.append("averagePrice", "10.00");
      
      const res = await addAsset(formData);
      if (res.error) alert(res.error);
      else {
        alert(`${ticker} adicionado à sua carteira com sucesso!`);
        router.push("/portfolio");
      }
    } catch (e) {
      alert("Erro ao adicionar ativo");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "16px", fontSize: "0.9rem" }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Cotação: {ticker}</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Gráfico em tempo real fornecido pelo TradingView.</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ gap: "8px" }} 
          onClick={handleAddAsset}
          disabled={adding}
        >
          <Plus size={16} /> {adding ? "Adicionando..." : "Adicionar à Carteira"}
        </button>
      </div>

      <div style={{ 
        flex: 1, 
        minHeight: "600px", 
        background: "var(--bg-card)", 
        border: "1px solid var(--border-default)", 
        borderRadius: "16px", 
        overflow: "hidden",
        padding: "2px"
      }}>
        <div id="tradingview_widget" ref={containerRef} style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
}
