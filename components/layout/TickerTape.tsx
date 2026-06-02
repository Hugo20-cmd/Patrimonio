"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function TickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;

    const config = {
      symbols: [
        { proName: "BMFBOVESPA:IBOV", title: "Ibovespa" },
        { proName: "BMFBOVESPA:PETR4", title: "Petrobras" },
        { proName: "BMFBOVESPA:VALE3", title: "Vale" },
        { proName: "BMFBOVESPA:ITUB4", title: "Itaí­Âº" },
        { proName: "BMFBOVESPA:BOVA11", title: "BOVA11" },
        { proName: "BMFBOVESPA:SMAL11", title: "SMAL11" },
        { proName: "NASDAQ:AAPL", title: "Apple" },
        { proName: "NASDAQ:TSLA", title: "Tesla" }
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "br"
    };

    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div style={{ width: "100%", height: "72px", overflow: "hidden", marginBottom: "24px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
      <div className="tradingview-widget-container" ref={containerRef} style={{ width: "100%", height: "100%" }}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
