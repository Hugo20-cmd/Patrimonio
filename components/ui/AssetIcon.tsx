"use client";

import { useState } from "react";

// Mapa de logos hardcoded para garantir que os ativos principais do app
// sempre tenham logos, mesmo se a API falhar.
const HARDCODED_LOGOS: Record<string, string> = {
  "PETR4": "https://logodownload.org/wp-content/uploads/2014/05/petrobras-logo-1-1.png",
  "AAPL": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  "IVVB11": "https://upload.wikimedia.org/wikipedia/commons/4/4e/BlackRock_logo.svg",
  "KNRI11": "https://s3-symbol-logo.tradingview.com/kinea-renda-imobiliaria-fii--600.png",
  "TESOURO IPCA+ 2035": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Tesouro_Direto.svg/1200px-Tesouro_Direto.svg.png",
  "BOVA11": "https://upload.wikimedia.org/wikipedia/commons/4/4e/BlackRock_logo.svg",
  "MXRF11": "https://logodownload.org/wp-content/uploads/2018/10/xp-investimentos-logo-1.png",
  "HGLG11": "https://upload.wikimedia.org/wikipedia/commons/4/45/Logo_CSHG.png",
  "BBAS3": "https://logodownload.org/wp-content/uploads/2014/05/banco-do-brasil-logo-1-1.png",
  "BTC": "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  "ETH": "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  "NVDA": "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
  "O": "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Realty_Income_logo.svg/1200px-Realty_Income_logo.svg.png",
  "PLD": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Prologis_logo.svg/1200px-Prologis_logo.svg.png"
};

export default function AssetIcon({ ticker, name, logoUrl }: { ticker: string, name?: string, logoUrl?: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  const cleanTicker = ticker?.trim().toUpperCase() || "??";

  const sources: string[] = [];

  // 1. Hardcoded Map (Garante 100% de sucesso para a demo)
  if (HARDCODED_LOGOS[cleanTicker]) {
    sources.push(HARDCODED_LOGOS[cleanTicker]);
  }

  // 2. LogoURL da API
  if (logoUrl) {
    sources.push(logoUrl);
  }

  // 3. Fallbacks
  sources.push(`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanTicker.toLowerCase()}.png`);
  sources.push(`https://ui-avatars.com/api/?name=${cleanTicker}&background=random&color=fff&rounded=true&bold=true`);

  const currentSrc = imgSrc || sources[0];

  const handleError = () => {
    if (errorCount < sources.length - 1) {
      setImgSrc(sources[errorCount + 1]);
      setErrorCount(prev => prev + 1);
    } else {
      setImgSrc("fallback");
    }
  };

  if (currentSrc === "fallback") {
    return (
      <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
        {cleanTicker.substring(0, 2)}
      </div>
    );
  }

  return (
    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fff", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
      <img 
        src={currentSrc} 
        alt={ticker} 
        style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
        onError={handleError}
      />
    </div>
  );
}
