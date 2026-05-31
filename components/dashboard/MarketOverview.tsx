"use client";
import { useEffect, useRef } from "react";

export default function MarketOverview() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;

    const config = {
      symbols: [
        [
          "Ibovespa",
          "BMFBOVESPA:IBOV|1D"
        ],
        [
          "Petrobras",
          "BMFBOVESPA:PETR4|1D"
        ],
        [
          "Vale",
          "BMFBOVESPA:VALE3|1D"
        ],
        [
          "BOVA11",
          "BMFBOVESPA:BOVA11|1D"
        ],
        [
          "S&P 500",
          "FOREXCOM:SPXUSD|1D"
        ]
      ],
      chartOnly: false,
      width: "100%",
      height: "100%",
      locale: "br",
      colorTheme: "dark",
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesTracking: "1",
      changeMode: "price-and-percent",
      chartType: "area",
      maLineColor: "#2962FF",
      maLineWidth: 1,
      maLength: 9,
      backgroundColor: "rgba(8, 8, 16, 1)",
      widgetFontColor: "rgba(163, 166, 178, 1)",
      lineWidth: 2,
      lineType: 0,
      dateRanges: [
        "1d|1",
        "1m|30",
        "3m|60",
        "12m|1D",
        "60m|1W",
        "all|1M"
      ]
    };

    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div style={{ width: "100%", height: "400px", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", overflow: "hidden", padding: "16px" }}>
      <h3 style={{ fontSize: "1.1rem", marginBottom: "16px" }}>Mercado ao Vivo (Principais Ativos)</h3>
      <div style={{ height: "calc(100% - 40px)" }}>
        <div className="tradingview-widget-container" ref={containerRef} style={{ width: "100%", height: "100%" }}>
          <div className="tradingview-widget-container__widget" style={{ height: "100%" }}></div>
        </div>
      </div>
    </div>
  );
}
