"use client";

import { useEffect, useRef } from "react";

export default function CryptoScreener() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear to avoid duplicates on re-renders
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.type = "text/javascript";
    script.async = true;

    const config = {
      width: "100%",
      height: 600,
      defaultColumn: "overview",
      screener_type: "crypto_mkt",
      displayCurrency: "USD",
      colorTheme: "dark",
      locale: "br",
      isTransparent: true
    };

    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);

  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "40px" }}>
      <div>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Mercado de Cripto (Ao Vivo)</h2>
        <p style={{ color: "var(--text-tertiary)" }}>Monitore as milhares de criptomoedas globais em tempo real, 24 horas por dia.</p>
      </div>
      <div 
        ref={containerRef} 
        style={{ 
          height: "600px", 
          width: "100%", 
          background: "var(--bg-card)", 
          borderRadius: "20px", 
          border: "1px solid var(--border-default)",
          overflow: "hidden"
        }} 
      />
    </div>
  );
}
