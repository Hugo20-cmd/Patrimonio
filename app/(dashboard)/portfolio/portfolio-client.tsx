"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Filter, ArrowUpDown, X, CheckCircle2,
  Save, AlertCircle, TrendingUp, TrendingDown, RefreshCw, Loader2, Edit2, BrainCircuit, UploadCloud, FileText
} from "lucide-react";
import { 
  formatCurrency, formatPercent, assetTypeColor, assetTypeLabel, AssetType
} from "@/lib/mock-data";
import { addAsset, deleteAsset, editAsset } from "@/app/actions/assets";
import { deleteAssetTransaction } from "@/app/actions/asset-transactions";
import { getMultipleQuotes, searchAsset, getQuote, getExchangeRate } from "@/app/actions/market";
import PaywallModal from "@/components/PaywallModal";

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function calcMetrics(assets: any[], quotes: Record<string, any>, globalCurrency: string, exchangeRate: number) {
  let totalInvested = 0;
  let totalCurrent = 0;

  for (const a of assets) {
    const quotePrice = quotes[a.ticker?.toUpperCase()]?.price ?? a.currentPrice ?? a.averagePrice;
    
    let nativeInvested = a.quantity * a.averagePrice;
    let nativeCurrent = a.quantity * quotePrice;

    let assetCurrency = a.currency || 'BRL';

    if (assetCurrency === 'USD' && globalCurrency === 'BRL') {
      nativeInvested *= exchangeRate;
      nativeCurrent *= exchangeRate;
    } else if (assetCurrency === 'BRL' && globalCurrency === 'USD') {
      nativeInvested /= exchangeRate;
      nativeCurrent /= exchangeRate;
    }

    totalInvested += nativeInvested;
    totalCurrent += nativeCurrent;
  }

  const totalProfit = totalCurrent - totalInvested;
  const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
  return { totalInvested, totalCurrent, totalProfit, totalProfitPercent };
}

// ----------------------------------------------------------------
// Component
// ----------------------------------------------------------------
export default function PortfolioClient({ initialAssets, initialTransactions = [], subscriptionStatus }: { initialAssets: any[], initialTransactions?: any[], subscriptionStatus: string }) {
  const [assets, setAssets] = useState<any[]>(initialAssets);
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [activeTab, setActiveTab] = useState<"portfolio" | "history">("portfolio");
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "buy" | "sell" | "dividend">("ALL");
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [globalCurrency, setGlobalCurrency] = useState<"BRL" | "USD">("BRL");
  const [exchangeRate, setExchangeRate] = useState(5.0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | AssetType>("ALL");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [assetType, setAssetType] = useState<string>("ETF");
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  // IA Import State
  const [isAiImportOpen, setIsAiImportOpen] = useState(false);
  const [aiImportStatus, setAiImportStatus] = useState<"idle" | "uploading" | "analyzing" | "success" | "error">("idle");
  const [aiImportMsg, setAiImportMsg] = useState("");

  // ── Ticker autocomplete ──
  const [tickerInput, setTickerInput] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  
  const [quantityInput, setQuantityInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [totalInput, setTotalInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("BRL");
  
  const tickerRef = useRef<HTMLDivElement>(null);

  // Auto-calculators
  function handleQuantityChange(val: string) {
    setQuantityInput(val);
    const p = parseFloat(priceInput);
    const q = parseFloat(val);
    if (!isNaN(p) && !isNaN(q)) {
      setTotalInput((p * q).toFixed(2));
    } else {
      setTotalInput("");
    }
  }

  function handleTotalChange(val: string) {
    setTotalInput(val);
    const p = parseFloat(priceInput);
    const t = parseFloat(val);
    if (!isNaN(p) && p > 0 && !isNaN(t)) {
      setQuantityInput((t / p).toFixed(5));
    } else {
      setQuantityInput("");
    }
  }

  function handlePriceChange(val: string) {
    setPriceInput(val);
    const p = parseFloat(val);
    const q = parseFloat(quantityInput);
    if (!isNaN(p) && !isNaN(q)) {
      setTotalInput((p * q).toFixed(2));
    } else {
      setTotalInput("");
    }
  }

  // Debounced search
  useEffect(() => {
    if (tickerInput.length < 1) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);
      const results = await searchAsset(tickerInput);
      setSuggestions(results.slice(0, 8));
      setSuggestionsLoading(false);
      setShowSuggestions(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [tickerInput]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tickerRef.current && !tickerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSelectSuggestion(suggestion: any) {
    setTickerInput(suggestion.symbol);
    setShowSuggestions(false);
    setSuggestions([]);
    // Buscar cotação completa para preencher o preço
    setSuggestionsLoading(true);
    const quote = await getQuote(suggestion.symbol);
    setSuggestionsLoading(false);
    if (quote) {
      setSelectedQuote(quote);
      setCurrencyInput(quote.currency || (quote.market === 'US' ? 'USD' : 'BRL'));
      const newPrice = quote.price.toFixed(2);
      setPriceInput(newPrice);
      if (quantityInput && !isNaN(parseFloat(quantityInput))) {
        setTotalInput((parseFloat(quantityInput) * quote.price).toFixed(2));
      }
    }
  }

  function resetModal() {
    setTickerInput("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedQuote(null);
    setQuantityInput("");
    setPriceInput("");
    setTotalInput("");
    setCurrencyInput("BRL");
    setErrorMsg("");
    setAssetType("ETF");
    setIsAddModalOpen(false);
    setEditingAssetId(null);
  }

  function openEditModal(asset: any) {
    setEditingAssetId(asset.id);
    setTickerInput(asset.ticker);
    setAssetType(asset.type || "ETF");
    setQuantityInput(asset.quantity.toString());
    setPriceInput(asset.averagePrice.toString());
    setTotalInput((asset.quantity * asset.averagePrice).toFixed(2));
    setCurrencyInput(asset.currency || "BRL");
    setIsAddModalOpen(true);
  }

  // ── Fetch live quotes ──
  const fetchQuotes = useCallback(async (currentAssets: any[]) => {
    if (!currentAssets.length) {
      setQuotesLoading(false);
      return;
    }
    try {
      setQuotesLoading(true);
      const tickers = currentAssets.map((a) => a.ticker);
      
      const [results, rate] = await Promise.all([
        getMultipleQuotes(tickers),
        getExchangeRate()
      ]);
      
      if (rate) setExchangeRate(rate);

      const newQuotes: Record<string, any> = {};
      results.forEach((r: any) => {
        if (r && r.symbol) {
          newQuotes[r.symbol.toUpperCase()] = r;
        }
      });
      setQuotes(newQuotes);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch quotes:", err);
    } finally {
      setQuotesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes(assets);
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(() => fetchQuotes(assets), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [assets, fetchQuotes]);

  // ── Filters ──
  const metrics = calcMetrics(assets, quotes, globalCurrency, exchangeRate);

  const filtered = assets
    .filter((a) => {
      const q = searchQuery.toLowerCase();
      return (
        (a.ticker?.toLowerCase().includes(q) || a.name?.toLowerCase().includes(q)) &&
        (filterType === "ALL" || a.type === filterType)
      );
    })
    .sort((a, b) => {
      const qa = quotes[a.ticker?.toUpperCase()];
      const qb = quotes[b.ticker?.toUpperCase()];
      const va = a.quantity * (qa?.price ?? a.currentPrice ?? a.averagePrice);
      const vb = b.quantity * (qb?.price ?? b.currentPrice ?? b.averagePrice);
      return vb - va;
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}
    >
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Minha Carteira</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--bg-elevated)", padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--border-default)" }}>
              <button 
                onClick={() => setActiveTab("portfolio")}
                style={{ background: activeTab === "portfolio" ? "var(--text-primary)" : "transparent", color: activeTab === "portfolio" ? "var(--bg-card)" : "var(--text-secondary)", border: "none", padding: "4px 12px", borderRadius: "6px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
              >
                Posição Consolidada
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                style={{ background: activeTab === "history" ? "var(--text-primary)" : "transparent", color: activeTab === "history" ? "var(--bg-card)" : "var(--text-secondary)", border: "none", padding: "4px 12px", borderRadius: "6px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
              >
                Movimentações
              </button>
            </span>
            {lastUpdated && activeTab === "portfolio" && (
              <span style={{ color: "var(--green-primary)", fontWeight: 600 }}>
                Cotações ao vivo via Brapi às {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          
          {/* Binance-style Currency Toggle */}
          <div style={{ display: "flex", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "20px", padding: "4px", position: "relative" }}>
            <div style={{
              position: "absolute", top: "4px", bottom: "4px", left: globalCurrency === "BRL" ? "4px" : "calc(50% + 2px)", width: "calc(50% - 6px)",
              background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "16px",
              transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }} />
            <button
              onClick={() => setGlobalCurrency("BRL")}
              style={{ position: "relative", zIndex: 1, padding: "6px 16px", border: "none", background: "none", color: globalCurrency === "BRL" ? "var(--text-primary)" : "var(--text-tertiary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "color 0.3s" }}
            >
              R$
            </button>
            <button
              onClick={() => setGlobalCurrency("USD")}
              style={{ position: "relative", zIndex: 1, padding: "6px 16px", border: "none", background: "none", color: globalCurrency === "USD" ? "var(--text-primary)" : "var(--text-tertiary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "color 0.3s" }}
            >
              US$
            </button>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            style={{ gap: "6px" }}
            onClick={() => fetchQuotes(assets)}
            disabled={quotesLoading}
          >
            <RefreshCw size={14} style={{ animation: quotesLoading ? "spin 1s linear infinite" : "none" }} />
            {quotesLoading ? "Atualizando..." : "Atualizar"}
          </button>
          
          <button className="btn btn-secondary" style={{ gap: "8px", background: "var(--bg-elevated)", border: "1px solid var(--blue-primary)", color: "var(--blue-primary)", whiteSpace: "nowrap" }} onClick={() => {
            if (subscriptionStatus === 'free') {
              setShowPaywall(true);
            } else {
              setIsAiImportOpen(true);
            }
          }}>
            <BrainCircuit size={16} />
            Leitor IA (PDF/CSV)
          </button>

          <button className="btn btn-primary" style={{ gap: "8px", whiteSpace: "nowrap" }} onClick={() => {
            if (subscriptionStatus === 'free' && assets.length >= 5) {
              setShowPaywall(true);
            } else {
              setIsAddModalOpen(true);
            }
          }}>
            <Plus size={16} />
            Adicionar Manual
          </button>
        </div>
      </div>

      {activeTab === "portfolio" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { label: "Total Investido", value: formatCurrency(metrics.totalInvested, globalCurrency), color: "var(--text-primary)" },
            { label: "Valor Atual", value: formatCurrency(metrics.totalCurrent, globalCurrency), color: "var(--text-primary)" },
            {
              label: "Resultado",
              value: formatCurrency(metrics.totalProfit, globalCurrency),
              sub: formatPercent(metrics.totalProfitPercent),
              color: metrics.totalProfit >= 0 ? "var(--green-primary)" : "var(--red-primary)",
            },
            { label: "Posições", value: `${assets.length} ativos`, color: "var(--text-primary)" },
          ].map((card) => (
            <div key={card.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{card.label}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: card.color }}>{card.value}</div>
              {card.sub && <div style={{ fontSize: "0.8rem", fontWeight: 700, color: card.color }}>{card.sub}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Table Card */}
      {activeTab === "portfolio" ? (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        {/* Controls */}
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
            <div style={{ position: "relative", maxWidth: "300px", width: "100%" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input
                type="text"
                placeholder="Buscar ativo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", padding: "8px 12px 8px 36px", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none", cursor: "pointer" }}
            >
              <option value="ALL">Todas as Classes</option>
              <option value="ETF">ETFs</option>
              <option value="stock">Ações</option>
              <option value="FII">FIIs</option>
              <option value="treasury">Tesouro Direto</option>
            </select>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ gap: "6px" }}>
            <Filter size={14} /> Filtros avançados
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="table-premium" style={{ minWidth: "950px" }}>
            <thead>
              <tr>
                <th><div style={{ display: "flex", alignItems: "center", gap: "4px" }}>Ativo <ArrowUpDown size={12} /></div></th>
                <th>Tipo</th>
                <th style={{ textAlign: "right" }}>Qtd</th>
                <th style={{ textAlign: "right" }}>Preço Médio</th>
                <th style={{ textAlign: "right" }}>Cotação Atual</th>
                <th style={{ textAlign: "right" }}>Variação Hoje</th>
                <th style={{ textAlign: "right" }}>Total Atual</th>
                <th style={{ textAlign: "right" }}>Resultado</th>
                <th style={{ width: "40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ color: "var(--text-tertiary)" }}>Nenhum ativo encontrado</div>
                  </td>
                </tr>
              ) : (
                filtered.map((asset) => {
                  const quote = quotes[asset.ticker?.toUpperCase()];
                  const livePrice = quote?.price ?? asset.currentPrice ?? asset.averagePrice;
                  
                  let nativeInvested = asset.quantity * asset.averagePrice;
                  let nativeCurrent = asset.quantity * livePrice;
                  let nativeLivePrice = livePrice;
                  let nativeAvgPrice = asset.averagePrice;
                  
                  let assetCurrency = asset.currency || 'BRL';

                  if (assetCurrency === 'USD' && globalCurrency === 'BRL') {
                    nativeInvested *= exchangeRate;
                    nativeCurrent *= exchangeRate;
                    nativeLivePrice *= exchangeRate;
                    nativeAvgPrice *= exchangeRate;
                  } else if (assetCurrency === 'BRL' && globalCurrency === 'USD') {
                    nativeInvested /= exchangeRate;
                    nativeCurrent /= exchangeRate;
                    nativeLivePrice /= exchangeRate;
                    nativeAvgPrice /= exchangeRate;
                  }

                  const profit = nativeCurrent - nativeInvested;
                  const profitPercent = nativeInvested > 0 ? (profit / nativeInvested) * 100 : 0;
                  const dayChange = quote?.changePercent ?? 0;
                  const isPositive = profit >= 0;
                  const isDayPositive = dayChange >= 0;

                  return (
                    <tr key={asset.id}>
                      {/* Ativo */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {/* Logo ou Placeholder */}
                          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                            {quote?.logoUrl ? (
                              <img
                                src={quote.logoUrl}
                                alt={asset.ticker}
                                style={{ width: "28px", height: "28px", objectFit: "contain" }}
                                onError={(e: any) => { e.target.style.display = "none"; }}
                              />
                            ) : (
                              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                                {asset.ticker?.substring(0, 2)}
                              </span>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{asset.ticker}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {quote?.shortName ?? asset.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td>
                        <div className="badge" style={{ background: `${assetTypeColor[asset.type as AssetType]}20`, color: assetTypeColor[asset.type as AssetType], border: `1px solid ${assetTypeColor[asset.type as AssetType]}30` }}>
                          {assetTypeLabel[asset.type as AssetType]}
                        </div>
                      </td>

                      {/* Qtd */}
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>
                        {parseFloat(asset.quantity).toLocaleString("pt-BR", { maximumFractionDigits: 5 })}
                      </td>

                      {/* Preço Médio */}
                      <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>{formatCurrency(nativeAvgPrice, globalCurrency)}</td>

                      {/* Cotação Atual */}
                      <td style={{ textAlign: "right" }}>
                        {quotesLoading && !quote ? (
                          <div style={{ width: "60px", height: "16px", background: "var(--bg-elevated)", borderRadius: "4px", marginLeft: "auto", animation: "pulse 1.5s ease-in-out infinite" }} />
                        ) : (
                          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(nativeLivePrice, globalCurrency)}</div>
                        )}
                      </td>

                      {/* Variação do dia */}
                      <td style={{ textAlign: "right" }}>
                        {quote ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", color: isDayPositive ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 700, fontSize: "0.85rem" }}>
                            {isDayPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                            {isDayPositive ? "+" : ""}{dayChange.toFixed(2)}%
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-tertiary)", fontSize: "0.8rem" }}>—</span>
                        )}
                      </td>

                      {/* Total Atual */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(nativeCurrent, globalCurrency)}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
                          {metrics.totalCurrent > 0 ? ((nativeCurrent / metrics.totalCurrent) * 100).toFixed(1) : "0.0"}% da carteira
                        </div>
                      </td>

                      {/* Resultado */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ color: isPositive ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 700 }}>
                          {isPositive ? "+" : ""}{formatCurrency(profit, globalCurrency)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: isPositive ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 600 }}>
                          {formatPercent(profitPercent)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right", display: "flex", gap: "8px", justifyContent: "flex-end", alignItems: "center", height: "100%" }}>
                        <button
                          onClick={() => openEditModal(asset)}
                          style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", transition: "background 0.2s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(79,110,247,0.1)"; e.currentTarget.style.color = "var(--blue-primary)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
                          title="Editar ativo"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm("Deseja excluir este ativo?")) {
                              // Optimistic UI update para evitar delay visual
                              setAssets((prev) => prev.filter((a) => a.id !== asset.id));
                              await deleteAsset(asset.id);
                            }
                          }}
                          style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", transition: "background 0.2s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,80,80,0.1)"; e.currentTarget.style.color = "var(--red-primary)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
                          title="Excluir ativo"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "12px", overflowX: "auto" }}>
          <button onClick={() => setHistoryFilter("ALL")} style={{ background: historyFilter === "ALL" ? "rgba(255,193,7,0.15)" : "transparent", color: historyFilter === "ALL" ? "#FFC107" : "var(--text-secondary)", border: `1px solid ${historyFilter === "ALL" ? "#FFC107" : "var(--border-default)"}`, padding: "6px 16px", borderRadius: "20px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>Todas</button>
          <button onClick={() => setHistoryFilter("buy")} style={{ background: historyFilter === "buy" ? "rgba(255,193,7,0.15)" : "transparent", color: historyFilter === "buy" ? "#FFC107" : "var(--text-secondary)", border: `1px solid ${historyFilter === "buy" ? "#FFC107" : "var(--border-default)"}`, padding: "6px 16px", borderRadius: "20px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>Compras</button>
          <button onClick={() => setHistoryFilter("sell")} style={{ background: historyFilter === "sell" ? "rgba(255,193,7,0.15)" : "transparent", color: historyFilter === "sell" ? "#FFC107" : "var(--text-secondary)", border: `1px solid ${historyFilter === "sell" ? "#FFC107" : "var(--border-default)"}`, padding: "6px 16px", borderRadius: "20px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>Vendas</button>
          <button onClick={() => setHistoryFilter("dividend")} style={{ background: historyFilter === "dividend" ? "rgba(255,193,7,0.15)" : "transparent", color: historyFilter === "dividend" ? "#FFC107" : "var(--text-secondary)", border: `1px solid ${historyFilter === "dividend" ? "#FFC107" : "var(--border-default)"}`, padding: "6px 16px", borderRadius: "20px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>Dividendos</button>
        </div>
        <div style={{ padding: "0 20px" }}>
          {transactions.filter(t => historyFilter === "ALL" || t.operation === historyFilter).map((tx, idx) => {
            const dateObj = new Date(tx.operation_date);
            const dateStr = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const opLabel = tx.operation === 'buy' ? 'Aplicou em' : tx.operation === 'sell' ? 'Vendeu' : 'Recebeu dividendos';
            const valueColor = tx.operation === 'dividend' ? 'var(--green-primary)' : 'var(--text-primary)';
            const sign = tx.operation === 'dividend' ? '+ ' : '';

            return (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginBottom: "8px" }}>{dateStr} às {timeStr}</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{opLabel} {tx.ticker}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>Concluído</div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: valueColor }}>
                    {sign}{formatCurrency(tx.quantity * tx.price, tx.currency)}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                    Qtd: {tx.quantity} a {formatCurrency(tx.price, tx.currency)}
                  </div>
                  <button 
                    onClick={async () => {
                      if(confirm("Deseja excluir esta movimentação? Isso não afetará a Posição Consolidada, apenas o histórico.")){
                        setTransactions(prev => prev.filter(t => t.id !== tx.id));
                        await deleteAssetTransaction(tx.id);
                      }
                    }}
                    style={{ background: "none", border: "none", color: "var(--red-primary)", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", marginTop: "8px", opacity: 0.7, transition: "opacity 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}
                  >
                    <X size={12} /> Excluir histórico
                  </button>
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-tertiary)" }}>
              Nenhuma movimentação registrada.
            </div>
          )}
        </div>
      </div>
      )}

      {/* Add Asset Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", width: "100%", maxWidth: "500px", boxShadow: "var(--shadow-lg), 0 0 40px rgba(0,212,170,0.1)", overflow: "hidden" }}
            >
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{editingAssetId ? "Editar Ativo" : "Novo Lançamento"}</h3>
                <button onClick={resetModal} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: "24px" }}>
                {errorMsg && (
                  <div style={{ background: "rgba(255,0,0,0.1)", color: "var(--red-primary)", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85rem", border: "1px solid rgba(255,0,0,0.2)" }}>
                    {errorMsg}
                  </div>
                )}
                <form
                  action={async (formData) => {
                    setLoading(true);
                    setErrorMsg("");
                    // Inject ticker manually since it's controlled
                    formData.set("ticker", tickerInput.toUpperCase());
                    formData.set("currency", currencyInput);
                    if (priceInput) formData.set("price", priceInput);
                    
                    let res;
                    if (editingAssetId) {
                      res = await editAsset(editingAssetId, formData);
                    } else {
                      res = await addAsset(formData);
                    }

                    if (res?.error) {
                      setErrorMsg(res.error);
                    } else {
                      resetModal();
                      window.location.reload();
                    }
                    setLoading(false);
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                    <div style={{ flex: 1 }}>
                      <label>Tipo de Ativo</label>
                      <select
                        name="type"
                        value={assetType}
                        onChange={(e) => {
                          setAssetType(e.target.value);
                          setTickerInput("");
                          setSelectedQuote(null);
                          setQuantityInput("");
                          setPriceInput("");
                          setTotalInput("");
                          setSuggestions([]);
                        }}
                        style={{ width: "100%" }}
                      >
                        <option value="ETF">ETF</option>
                        <option value="stock">Ação</option>
                        <option value="FII">FII</option>
                        <option value="treasury">Tesouro Direto</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Moeda</label>
                      <select 
                        name="currency" 
                        value={currencyInput}
                        onChange={(e) => setCurrencyInput(e.target.value)}
                        style={{ width: "100%" }} 
                      >
                        <option value="BRL">BRL (R$)</option>
                        <option value="USD">USD (US$)</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Operação</label>
                      <select name="operation" style={{ width: "100%" }}>
                        <option value="buy">Compra</option>
                        <option value="sell">Venda</option>
                      </select>
                    </div>
                  </div>

                  {/* Ticker — Tesouro Direto ou Autocomplete */}
                  {assetType === "treasury" ? (
                    <div style={{ marginBottom: "20px" }}>
                      <label>Título do Tesouro Direto</label>
                      <select
                        name="ticker"
                        value={tickerInput}
                        onChange={(e) => setTickerInput(e.target.value)}
                        required
                        style={{ width: "100%" }}
                      >
                        <option value="">Selecione o título...</option>
                        <optgroup label="Tesouro Selic">
                          <option value="TESOURO SELIC 2027">Tesouro Selic 2027</option>
                          <option value="TESOURO SELIC 2029">Tesouro Selic 2029</option>
                          <option value="TESOURO SELIC 2031">Tesouro Selic 2031</option>
                        </optgroup>
                        <optgroup label="Tesouro IPCA+">
                          <option value="TESOURO IPCA+ 2029">Tesouro IPCA+ 2029</option>
                          <option value="TESOURO IPCA+ 2032">Tesouro IPCA+ 2032</option>
                          <option value="TESOURO IPCA+ 2035">Tesouro IPCA+ 2035</option>
                          <option value="TESOURO IPCA+ 2040">Tesouro IPCA+ 2040</option>
                          <option value="TESOURO IPCA+ 2045">Tesouro IPCA+ 2045</option>
                          <option value="TESOURO IPCA+ 2055">Tesouro IPCA+ 2055</option>
                        </optgroup>
                        <optgroup label="Tesouro IPCA+ com Juros Semestrais">
                          <option value="TESOURO IPCA+ 2029 JU">Tesouro IPCA+ 2029 (Juros Semestrais)</option>
                          <option value="TESOURO IPCA+ 2035 JU">Tesouro IPCA+ 2035 (Juros Semestrais)</option>
                          <option value="TESOURO IPCA+ 2040 JU">Tesouro IPCA+ 2040 (Juros Semestrais)</option>
                          <option value="TESOURO IPCA+ 2055 JU">Tesouro IPCA+ 2055 (Juros Semestrais)</option>
                        </optgroup>
                        <optgroup label="Tesouro Prefixado">
                          <option value="TESOURO PREFIXADO 2027">Tesouro Prefixado 2027</option>
                          <option value="TESOURO PREFIXADO 2029">Tesouro Prefixado 2029</option>
                          <option value="TESOURO PREFIXADO 2031">Tesouro Prefixado 2031</option>
                        </optgroup>
                        <optgroup label="Tesouro Prefixado com Juros Semestrais">
                          <option value="TESOURO PREFIXADO 2029 JU">Tesouro Prefixado 2029 (Juros Semestrais)</option>
                          <option value="TESOURO PREFIXADO 2033 JU">Tesouro Prefixado 2033 (Juros Semestrais)</option>
                        </optgroup>
                      </select>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                        <AlertCircle size={12} color="var(--text-tertiary)" />
                        <span style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>Informe o preço pago por unidade no campo abaixo</span>
                      </div>
                    </div>
                  ) : (
                  <div style={{ marginBottom: "20px" }} ref={tickerRef}>
                    <label>Ticker (Código do Ativo)</label>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "relative" }}>
                        <input
                          name="ticker"
                          type="text"
                          placeholder={assetType === "FII" ? "Ex: MXRF11, KNRI11..." : assetType === "ETF" ? "Ex: IVVB11, BOVA11..." : "Ex: PETR4, ITUB4, VALE3..."}
                          value={tickerInput}
                          onChange={(e) => {
                            setTickerInput(e.target.value.toUpperCase());
                            setSelectedQuote(null);
                          }}
                          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                          autoComplete="off"
                          required
                          style={{ width: "100%", paddingRight: "36px" }}
                        />
                        {suggestionsLoading && (
                          <Loader2 size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", animation: "spin 1s linear infinite" }} />
                        )}
                      </div>

                      {/* Selected asset preview */}
                      {selectedQuote && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", padding: "10px 12px", background: "rgba(0,212,170,0.06)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: "10px" }}>
                          {selectedQuote.logoUrl && (
                            <img src={selectedQuote.logoUrl} alt={selectedQuote.symbol} style={{ width: "24px", height: "24px", objectFit: "contain" }} onError={(e: any) => e.target.style.display = "none"} />
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>{selectedQuote.symbol}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>{selectedQuote.shortName}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--green-primary)" }}>{formatCurrency(selectedQuote.price)}</div>
                            <div style={{ fontSize: "0.7rem", color: selectedQuote.changePercent >= 0 ? "var(--green-primary)" : "var(--red-primary)" }}>
                              {selectedQuote.changePercent >= 0 ? "+" : ""}{selectedQuote.changePercent?.toFixed(2)}% hoje
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Suggestions Dropdown */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "12px", overflow: "hidden", zIndex: 1000, boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
                          {suggestions.map((s, i) => (
                            <div
                              key={s.symbol}
                              onClick={() => handleSelectSuggestion(s)}
                              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", cursor: "pointer", borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-subtle)" : "none", transition: "background 0.15s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              {/* Logo */}
                              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                                {s.logoUrl ? (
                                  <img src={s.logoUrl} alt={s.symbol} style={{ width: "24px", height: "24px", objectFit: "contain" }} onError={(e: any) => e.target.style.display = "none"} />
                                ) : (
                                  <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-secondary)" }}>{s.symbol?.substring(0, 2)}</span>
                                )}
                              </div>
                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{s.symbol}</div>
                                <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
                              </div>
                              {/* Price */}
                              {s.close > 0 && (
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(s.close)}</div>
                                  {s.change !== undefined && (
                                    <div style={{ fontSize: "0.7rem", color: s.change >= 0 ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 600 }}>
                                      {s.change >= 0 ? "+" : ""}{s.change?.toFixed(2)}%
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ flex: 1 }}>
                      <label>Qtd / Fração</label>
                      <input 
                        name="quantity" 
                        type="number" 
                        placeholder="0" 
                        min="0.00001" 
                        step="any" 
                        required 
                        value={quantityInput}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Preço Un. ({currencyInput === 'USD' ? 'US$' : 'R$'})</label>
                      <input
                        name="price"
                        type="number"
                        placeholder={selectedQuote ? selectedQuote.price.toFixed(2) : "0.00"}
                        value={priceInput}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Total ({currencyInput === 'USD' ? 'US$' : 'R$'})</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={totalInput}
                        onChange={(e) => handleTotalChange(e.target.value)}
                        style={{ background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.3)" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label>Data e Hora da Operação</label>
                    <input name="date" type="datetime-local" defaultValue={editingAssetId ? new Date(new Date(assets.find(a => a.id === editingAssetId)?.purchaseDate || Date.now()).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} required />
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "12px", padding: "12px", background: "rgba(255, 152, 0, 0.1)", borderRadius: "8px", border: "1px solid rgba(255, 152, 0, 0.2)" }}>
                      <AlertCircle size={16} color="var(--orange-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span style={{ fontSize: "0.8rem", color: "var(--orange-primary)", lineHeight: 1.4 }}>
                        <strong>Lançamentos Antigos:</strong> O sistema não busca preços do passado porque cada corretora cobra um <b>Spread</b> (margem oculta) diferente na execução da ordem. <b>Apague o valor de hoje sugerido e digite manualmente</b> o "Preço Un." exato cobrado na sua corretora para que a matemática fique 100% perfeita!
                      </span>
                    </div>
                  </div>

                  {assetType !== "treasury" && (
                  <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px", display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "24px" }}>
                    <AlertCircle size={16} color="var(--green-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      O preço de hoje será buscado automaticamente via Brapi (B3 ao vivo).
                    </p>
                  </div>
                  )}

                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-ghost" onClick={resetModal}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ gap: "8px" }} disabled={loading}>
                      <Save size={16} /> {loading ? "Salvando..." : "Salvar Lançamento"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Importação IA */}
      <AnimatePresence>
        {isAiImportOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--blue-primary)", borderRadius: "20px", width: "100%", maxWidth: "500px", boxShadow: "0 0 40px rgba(79,110,247,0.2)", overflow: "hidden" }}
            >
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(90deg, rgba(79,110,247,0.1), transparent)" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <BrainCircuit size={20} color="var(--blue-primary)" /> Leitor Mágico (IA)
                </h3>
                <button onClick={() => { setIsAiImportOpen(false); setAiImportStatus("idle"); setAiImportMsg(""); }} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: "32px", textAlign: "center" }}>
                {aiImportStatus === "idle" && (
                  <>
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(79,110,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                      <UploadCloud size={40} color="var(--blue-primary)" />
                    </div>
                    <h4 style={{ fontSize: "1.3rem", marginBottom: "12px" }}>Arraste seu extrato para cá</h4>
                    <p style={{ color: "var(--text-tertiary)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "24px" }}>
                      Faça upload do seu arquivo de notas de corretagem ou extrato da B3 em formato <strong>.PDF, .CSV ou .OFX</strong>. A Inteligência Artificial da Patrimônio+ vai ler o arquivo, entender as operações e cadastrar tudo para você automaticamente.
                    </p>
                    
                    <label style={{ display: "inline-block", background: "var(--blue-primary)", color: "#fff", padding: "14px 24px", borderRadius: "12px", fontWeight: 600, cursor: "pointer", transition: "transform 0.1s" }} className="hover-scale">
                      Selecionar Arquivos
                      <input type="file" multiple style={{ display: "none" }} accept=".csv,.pdf,.ofx" onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        
                        setAiImportStatus("uploading");
                        setAiImportMsg(`Enviando ${files.length} arquivo(s) seguro(s)...`);
                        
                        await new Promise(r => setTimeout(r, 1500));
                        
                        setAiImportStatus("analyzing");
                        setAiImportMsg("A Inteligência Artificial está lendo e interpretando as suas operações. Isso pode levar alguns segundos...");
                        
                        try {
                          const formData = new FormData();
                          files.forEach(file => formData.append("files", file));
                          const res = await fetch("/api/import-ai", { method: "POST", body: formData });
                          const data = await res.json();
                          
                          if (!res.ok) throw new Error(data.error || "Erro ao processar");
                          
                          setAiImportStatus("success");
                          setAiImportMsg(data.message || `Sucesso! Foram processados os documentos.`);
                          setTimeout(() => window.location.reload(), 2000);
                        } catch(err: any) {
                          setAiImportStatus("error");
                          setAiImportMsg(err.message || "Não foi possível ler este arquivo.");
                        }
                      }} />
                    </label>
                  </>
                )}
                
                {(aiImportStatus === "uploading" || aiImportStatus === "analyzing") && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "20px 0" }}>
                    <div style={{ position: "relative", width: "80px", height: "80px" }}>
                      <svg width="80" height="80" viewBox="0 0 100 100" style={{ animation: "spin 2s linear infinite" }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(79,110,247,0.2)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--blue-primary)" strokeWidth="8" strokeDasharray="283" strokeDashoffset="200" strokeLinecap="round" />
                      </svg>
                      <BrainCircuit size={32} color="var(--blue-primary)" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", animation: "pulse 1.5s infinite" }} />
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontWeight: 500, maxWidth: "350px", lineHeight: 1.5 }}>
                      {aiImportMsg}
                    </div>
                  </div>
                )}
                
                {aiImportStatus === "success" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "20px 0" }}>
                    <CheckCircle2 size={64} color="var(--green-primary)" />
                    <h4 style={{ fontSize: "1.5rem" }}>Mágica Concluída!</h4>
                    <p style={{ color: "var(--text-secondary)" }}>{aiImportMsg}</p>
                  </div>
                )}
                
                {aiImportStatus === "error" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "20px 0" }}>
                    <AlertCircle size={64} color="var(--red-primary)" />
                    <h4 style={{ fontSize: "1.5rem" }}>Ops! Ocorreu um erro</h4>
                    <p style={{ color: "var(--text-secondary)" }}>{aiImportMsg}</p>
                    <button className="btn btn-secondary" onClick={() => setAiImportStatus("idle")}>Tentar Novamente</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </motion.div>
  );
}
