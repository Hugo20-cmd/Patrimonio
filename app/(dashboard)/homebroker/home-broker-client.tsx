"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, TrendingDown, Activity, Clock, Briefcase, RefreshCw, Loader2, AlertCircle, PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";
import { executeSimulatorOrder } from "@/app/actions/simulator";
import { searchAsset } from "@/app/actions/market";
import AssetIcon from "@/components/ui/AssetIcon";

export default function HomeBrokerClient({ 
  initialAccount, 
  initialPositions, 
  initialHistory, 
  initialQuotes 
}: { 
  initialAccount: any, 
  initialPositions: any[], 
  initialHistory: any[], 
  initialQuotes: any[] 
}) {
  const [activeTicker, setActiveTicker] = useState("BMFBOVESPA:PETR4");
  const [displayTicker, setDisplayTicker] = useState("PETR4");
  const [searchInput, setSearchInput] = useState("");
  const [account, setAccount] = useState(initialAccount);
  const [history, setHistory] = useState(initialHistory);
  const [positions, setPositions] = useState(initialPositions);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');

  const [quotes] = useState(() => {
    const map: Record<string, any> = {};
    initialQuotes.forEach(q => { if(q && q.symbol) map[q.symbol.toUpperCase()] = q; });
    return map;
  });

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  
  // Order Form
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<number>(100);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Fetch live price when ticker changes
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(`https://brapi.dev/api/quote/${displayTicker}?token=csbJ4wAomx1KStV72P9pQj`);
        const json = await res.json();
        if (json.results && json.results[0]) {
          setPrice(json.results[0].regularMarketPrice || 0);
        }
      } catch (e) {
        console.error("Erro ao buscar preço", e);
      }
    };
    fetchPrice();
  }, [displayTicker]);

  useEffect(() => {
    if (searchInput.length < 1) { 
      setSuggestions([]); 
      setShowSuggestions(false);
      return; 
    }
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await searchAsset(searchInput);
        setSuggestions(results.slice(0, 6));
        setShowSuggestions(true);
      } catch (err) {}
      setLoadingSuggestions(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadWidget = () => {
      if (typeof window !== "undefined" && (window as any).TradingView && document.getElementById("tradingview_chart")) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: activeTicker,
          interval: "D",
          timezone: "America/Sao_Paulo",
          theme: "dark",
          style: "1",
          locale: "br",
          enable_publishing: false,
          backgroundColor: "rgba(8, 8, 16, 1)",
          gridColor: "rgba(255, 255, 255, 0.05)",
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: "tradingview_chart"
        });
      }
    };

    if (!(window as any).TradingView) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = loadWidget;
      document.head.appendChild(script);
    } else {
      loadWidget();
    }
  }, [activeTicker]);

  const applySelection = (cleanSearch: string) => {
    setDisplayTicker(cleanSearch);
    if (/^[A-Z]{4}\d{1,2}$/.test(cleanSearch)) {
      setActiveTicker(`BMFBOVESPA:${cleanSearch}`);
    } else if (cleanSearch.includes("USDT") || cleanSearch === "BTC" || cleanSearch === "ETH") {
      setActiveTicker(`BINANCE:${cleanSearch}${cleanSearch.endsWith('USDT') ? '' : 'USDT'}`);
    } else {
      setActiveTicker(`NASDAQ:${cleanSearch}`);
    }
    setSearchInput("");
    setShowSuggestions(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput) return;
    applySelection(searchInput.toUpperCase().trim());
  };

  const handleExecuteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await executeSimulatorOrder(displayTicker, quantity, price, orderType);
    
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg(`Ordem de ${orderType === 'buy' ? 'COMPRA' : 'VENDA'} executada com sucesso!`);
      // Update local state temporarily for fast feedback
      let updatedPositions = [...positions];
      const existingIdx = updatedPositions.findIndex(p => p.ticker === displayTicker);
      
      if (orderType === 'buy') {
        setAccount({ ...account, balance: account.balance - (quantity * price) });
        if (existingIdx >= 0) {
          const old = updatedPositions[existingIdx];
          const newQty = old.quantity + quantity;
          const newAvgPrice = ((old.quantity * old.averagePrice) + (quantity * price)) / newQty;
          updatedPositions[existingIdx] = { ...old, quantity: newQty, averagePrice: newAvgPrice };
        } else {
          updatedPositions.push({
            id: Math.random().toString(),
            ticker: displayTicker,
            quantity: quantity,
            averagePrice: price,
            currentPrice: price
          });
        }
      } else {
        setAccount({ ...account, balance: account.balance + (quantity * price) });
        if (existingIdx >= 0) {
          const old = updatedPositions[existingIdx];
          const newQty = old.quantity - quantity;
          if (newQty <= 0) {
            updatedPositions.splice(existingIdx, 1);
          } else {
            updatedPositions[existingIdx] = { ...old, quantity: newQty };
          }
        }
      }
      setPositions(updatedPositions);

      setHistory([{
        id: Math.random().toString(),
        ticker: displayTicker,
        operation: orderType,
        quantity,
        price,
        created_at: new Date().toISOString()
      }, ...history]);
      
      setTimeout(() => {
        setSuccessMsg("");
      }, 5000);
    }
    setLoading(false);
  };

  const totalValue = quantity * price;

  return (
    <div style={{ paddingBottom: "40px", display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* EDUCATIONAL BANNER */}
      <div style={{ background: "rgba(79, 110, 247, 0.1)", border: "1px solid rgba(79, 110, 247, 0.3)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <AlertCircle size={24} color="var(--blue-primary)" />
        <div>
          <h4 style={{ margin: 0, color: "var(--blue-primary)", fontSize: "0.95rem", fontWeight: 800 }}>Ambiente de Simulação</h4>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "2px" }}>
            Os dados de mercado apresentados nesta tela são em tempo real, porém todas as transações são virtuais e têm finalidade exclusivamente educacional. Pratique e aprenda sem riscos reais.
          </p>
        </div>
      </div>

      {/* HEADER Ticker & Saldo */}
      <div className="hb-header-area" style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        
        {/* BUSCA DE ATIVO */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "20px", flex: 2, minWidth: 0, display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <AssetIcon ticker={displayTicker} />
            <div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1 }}>{displayTicker}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginTop: "6px" }}>Ação / FII / Cripto / ETF</div>
            </div>
          </div>
          <div className="hb-spacer" style={{ flex: 1, minWidth: "20px" }}></div>
          <form ref={searchContainerRef} onSubmit={handleSearch} className="hb-search-input" style={{ position: "relative", minWidth: "250px", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input 
              type="text" 
              placeholder="Buscar Ativo (ex: VALE3)" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
              style={{ width: "100%", padding: "12px 16px 12px 44px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "10px", color: "var(--text-primary)", outline: "none", fontSize: "0.95rem" }}
            />
            {loadingSuggestions && (
              <Loader2 size={16} className="spin" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            )}
            
            {/* AUTOCOMPLETE DROPDOWN */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", overflow: "hidden", zIndex: 100 }}
                >
                  {suggestions.map((s, idx) => (
                    <div 
                      key={idx}
                      onClick={() => applySelection(s.symbol.toUpperCase())}
                      style={{ padding: "12px 16px", borderBottom: idx === suggestions.length - 1 ? "none" : "1px solid var(--border-subtle)", display: "flex", gap: "12px", alignItems: "center", cursor: "pointer", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <AssetIcon ticker={s.symbol} name={s.shortName} logoUrl={s.logourl} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-primary)" }}>{s.symbol}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>{s.shortName || s.longName}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* SALDO / PODER DE COMPRA */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "20px", flex: 1, minWidth: "250px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Briefcase size={16} color="var(--blue-primary)" /> Poder de Compra
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {formatCurrency(account?.balance || 0)}
          </div>
        </div>

      </div>

      {/* MAIN AREA */}
      <div className="hb-main-area" style={{ display: "flex", gap: "24px", minHeight: "550px" }}>
        
        {/* CHART TRADINGVIEW */}
        <div className="hb-chart-container" style={{ flex: 2.5, background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} color="var(--blue-primary)" /> Gráfico Avançado
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600 }}>
              {activeTicker}
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", minHeight: "450px" }}>
            <div id="tradingview_chart" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}></div>
          </div>
        </div>

        {/* BOLETA DE ORDENS */}
        <div style={{ flex: 1, minWidth: "350px", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Boleta de Ordens</h3>
          </div>
          
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
            {/* TABS COMPRAR / VENDER */}
            <div style={{ display: "flex", background: "var(--bg-elevated)", borderRadius: "10px", padding: "4px", marginBottom: "24px" }}>
              <button 
                onClick={() => setOrderType('buy')}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", transition: "all 0.2s", background: orderType === 'buy' ? "var(--green-primary)" : "transparent", color: orderType === 'buy' ? "#000" : "var(--text-secondary)" }}
              >
                COMPRAR
              </button>
              <button 
                onClick={() => setOrderType('sell')}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", transition: "all 0.2s", background: orderType === 'sell' ? "var(--red-primary)" : "transparent", color: orderType === 'sell' ? "#fff" : "var(--text-secondary)" }}
              >
                VENDER
              </button>
            </div>

            <form onSubmit={handleExecuteOrder} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "8px", display: "block" }}>Ativo</label>
                <div style={{ padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}>
                  {displayTicker}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "8px", display: "block" }}>Quantidade</label>
                  <input 
                    type="number" 
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "#fff", outline: "none", textAlign: "right", fontSize: "1rem" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "8px", display: "block" }}>Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "#fff", outline: "none", textAlign: "right", fontSize: "1rem" }}
                  />
                </div>
              </div>

              <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)", marginTop: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>Valor Total da Ordem</span>
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", textAlign: "right" }}>
                  {formatCurrency(totalValue)}
                </div>
              </div>

              {errorMsg && (
                <div style={{ padding: "12px", background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: "8px", color: "var(--red-primary)", fontSize: "0.8rem", textAlign: "center" }}>
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div style={{ padding: "12px", background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.3)", borderRadius: "8px", color: "var(--green-primary)", fontSize: "0.8rem", textAlign: "center" }}>
                  {successMsg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || totalValue <= 0 || (orderType === 'buy' && totalValue > (account?.balance || 0))}
                style={{ 
                  width: "100%", padding: "18px", borderRadius: "12px", border: "none", cursor: "pointer", 
                  fontWeight: 800, fontSize: "1.1rem", marginTop: "auto", transition: "all 0.2s",
                  background: orderType === 'buy' ? "var(--green-primary)" : "var(--red-primary)",
                  color: orderType === 'buy' ? "#000" : "#fff",
                  opacity: (loading || totalValue <= 0 || (orderType === 'buy' && totalValue > (account?.balance || 0))) ? 0.5 : 1
                }}
              >
                {loading ? <Loader2 size={20} className="spin" /> : (orderType === 'buy' ? "EXECUTAR COMPRA" : "EXECUTAR VENDA")}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* HISTÓRICO DE ORDENS */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", overflow: "hidden", minHeight: "200px" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={16} color="var(--text-tertiary)" /> Histórico de Transações
          </h3>
          <div style={{ display: "flex", gap: "8px", background: "var(--bg-elevated)", padding: "4px", borderRadius: "10px" }}>
            <button 
              onClick={() => setHistoryFilter('today')}
              style={{ background: historyFilter === 'today' ? "var(--text-primary)" : "transparent", color: historyFilter === 'today' ? "var(--bg-card)" : "var(--text-secondary)", border: "none", padding: "4px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              Hoje
            </button>
            <button 
              onClick={() => setHistoryFilter('week')}
              style={{ background: historyFilter === 'week' ? "var(--text-primary)" : "transparent", color: historyFilter === 'week' ? "var(--bg-card)" : "var(--text-secondary)", border: "none", padding: "4px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              Últimos 7 dias
            </button>
            <button 
              onClick={() => setHistoryFilter('month')}
              style={{ background: historyFilter === 'month' ? "var(--text-primary)" : "transparent", color: historyFilter === 'month' ? "var(--bg-card)" : "var(--text-secondary)", border: "none", padding: "4px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              Mês Atual
            </button>
            <button 
              onClick={() => setHistoryFilter('all')}
              style={{ background: historyFilter === 'all' ? "var(--text-primary)" : "transparent", color: historyFilter === 'all' ? "var(--bg-card)" : "var(--text-secondary)", border: "none", padding: "4px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
            >
              Todo o Período
            </button>
          </div>
        </div>
        <div style={{ overflowX: "auto", maxHeight: "400px" }}>
          <table className="table-premium" style={{ width: "100%", minWidth: "700px" }}>
            <thead style={{ position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 10 }}>
              <tr>
                <th style={{ paddingLeft: "24px" }}>Data / Hora</th>
                <th>Operação</th>
                <th>Ativo</th>
                <th style={{ textAlign: "right" }}>Qtd</th>
                <th style={{ textAlign: "right" }}>Preço</th>
                <th style={{ textAlign: "right", paddingRight: "24px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const now = new Date();
                const filteredHistory = history.filter(order => {
                  const orderDate = new Date(order.created_at);
                  if (historyFilter === 'today') {
                    return orderDate.toDateString() === now.toDateString();
                  } else if (historyFilter === 'week') {
                    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 7;
                  } else if (historyFilter === 'month') {
                    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                  }
                  return true;
                });

                if (filteredHistory.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)", fontSize: "0.9rem" }}>
                        Nenhuma ordem encontrada para o período selecionado.
                      </td>
                    </tr>
                  );
                }

                return filteredHistory.map((order) => {
                  const dateObj = new Date(order.created_at);
                  const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <tr key={order.id}>
                      <td style={{ paddingLeft: "24px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.85rem" }}>{dateStr}</div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>{timeStr}</div>
                      </td>
                      <td>
                        <span style={{ 
                          background: order.operation === 'buy' ? "rgba(0,212,170,0.1)" : "rgba(255,77,109,0.1)", 
                          color: order.operation === 'buy' ? "var(--green-primary)" : "var(--red-primary)",
                          padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase"
                        }}>
                          {order.operation === 'buy' ? 'Compra' : 'Venda'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{order.ticker}</td>
                      <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>{order.quantity}</td>
                      <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>{formatCurrency(order.price)}</td>
                      <td style={{ textAlign: "right", paddingRight: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {formatCurrency(order.quantity * order.price)}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARTEIRA SIMULADA */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", overflow: "hidden", minHeight: "200px" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <PieChart size={16} color="var(--blue-primary)" /> Minha Carteira Simulada
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table-premium" style={{ width: "100%", minWidth: "700px" }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: "24px" }}>Ativo</th>
                <th style={{ textAlign: "right" }}>Quantidade</th>
                <th style={{ textAlign: "right" }}>Preço Médio</th>
                <th style={{ textAlign: "right" }}>Cotação Atual</th>
                <th style={{ textAlign: "right" }}>Total Atual</th>
                <th style={{ textAlign: "right", paddingRight: "24px" }}>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-tertiary)", fontSize: "0.9rem" }}>
                    Você ainda não possui ativos na sua carteira simulada. Execute compras na boleta acima para começar.
                  </td>
                </tr>
              ) : positions.map((pos) => {
                const quote = quotes[pos.ticker.toUpperCase()];
                const livePrice = quote?.price ?? pos.currentPrice ?? pos.averagePrice;
                const totalInvested = pos.quantity * pos.averagePrice;
                const totalCurrent = pos.quantity * livePrice;
                const profit = totalCurrent - totalInvested;
                const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
                const isPositive = profit >= 0;

                return (
                  <tr key={pos.id}>
                    <td style={{ paddingLeft: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <AssetIcon ticker={pos.ticker} width={28} height={28} />
                        <div>
                          <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>{pos.ticker}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>{pos.quantity}</td>
                    <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>{formatCurrency(pos.averagePrice)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(livePrice)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(totalCurrent)}</td>
                    <td style={{ textAlign: "right", paddingRight: "24px" }}>
                      <div style={{ color: isPositive ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 800 }}>
                        {isPositive ? "+" : ""}{formatCurrency(profit)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: isPositive ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px" }}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isPositive ? "+" : ""}{profitPercent.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <style jsx global>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        @media (max-width: 1024px) {
          .hb-main-area { flex-direction: column !important; min-height: auto !important; }
          .hb-chart-container { min-height: 450px !important; }
        }
        @media (max-width: 768px) {
          .hb-header-area { flex-direction: column !important; }
          .hb-search-input { width: 100% !important; min-width: 100% !important; }
          .hb-spacer { display: none !important; }
        }
      `}</style>
    </div>
  );
}
