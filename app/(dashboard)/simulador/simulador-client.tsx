"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, DollarSign, TrendingUp, TrendingDown, Crosshair, RefreshCw, RefreshCcw, Activity } from "lucide-react";
import { searchAsset, getQuote } from "@/app/actions/market";
import { executeSimulatorOrder, resetSimulatorAccount } from "@/app/actions/simulator";

export default function SimuladorClient({ initialAccount, initialPositions, initialHistory, initialQuotes = [] }: any) {
  const [account, setAccount] = useState(initialAccount);
  const [positions, setPositions] = useState<any[]>(initialPositions);
  const [history, setHistory] = useState<any[]>(initialHistory);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState<any>(null); // { symbol, price, change, etc }
  const [loadingQuote, setLoadingQuote] = useState(false);
  
  const [quantity, setQuantity] = useState("1");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced Search
  useEffect(() => {
    if (searchQuery.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      const results = await searchAsset(searchQuery);
      setSuggestions(results.slice(0, 5));
      setLoadingSearch(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectAsset = async (symbol: string) => {
    setSearchQuery(symbol);
    setSuggestions([]);
    setLoadingQuote(true);
    setOrderError("");
    const quote = await getQuote(symbol);
    if (quote) {
      setSelectedAsset(quote);
    }
    setLoadingQuote(false);
  };

  const handleOrder = async (operation: 'buy' | 'sell') => {
    if (!selectedAsset) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setOrderError("Quantidade inválida.");
      return;
    }
    
    setOrderLoading(true);
    setOrderError("");

    const res = await executeSimulatorOrder(selectedAsset.symbol, qty, selectedAsset.price, operation);
    
    if (res.error) {
      setOrderError(res.error);
    } else {
      window.location.reload(); // Refresh to get fresh server data for simplicity
    }
    setOrderLoading(false);
  };

  const handleReset = async () => {
    if (confirm("ATENÇÃO: Isso vai zerar toda sua carteira fictícia e voltar o saldo para R$ 100.000. Deseja continuar?")) {
      await resetSimulatorAccount();
      window.location.reload();
    }
  };

  // Calculate live portfolio value using live quotes
  const portfolioInvested = positions.reduce((acc, pos) => {
    const quote = initialQuotes?.find((q: any) => q.symbol === pos.ticker);
    const currentPrice = quote?.price || pos.average_price;
    return acc + (Number(pos.quantity) * Number(currentPrice));
  }, 0);
  const totalEquity = Number(account?.balance || 0) + portfolioInvested;

  const getTradingViewSymbol = (symbol: string) => {
    if (!symbol) return "BMFBOVESPA:IBOV";
    if (symbol.startsWith("BINANCE:")) return symbol;
    if (/^[A-Z]+$/.test(symbol.trim().toUpperCase())) {
      return symbol;
    }
    return `BMFBOVESPA:${symbol}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1200px", margin: "0 auto", paddingBottom: "100px" }}
    >
      <style>{`
        .sim-main-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
          align-items: start;
        }
        .sim-chart-container {
          height: 600px;
        }
        @media (max-width: 992px) {
          .sim-main-grid {
            grid-template-columns: 1fr;
          }
          .sim-chart-container {
            height: 450px;
          }
        }
        @media (max-width: 600px) {
          .sim-chart-container {
            height: 350px;
          }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Crosshair color="var(--blue-primary)" />
            Simulador <span style={{ color: "var(--blue-primary)" }}>Paper Trading</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Treine suas estratégias com dinheiro virtual e cotações reais.</p>
        </div>
        <button onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(255,0,0,0.1)", color: "var(--red-primary)", border: "1px solid rgba(255,0,0,0.2)", borderRadius: "12px", cursor: "pointer", fontWeight: 700 }}>
          <RefreshCcw size={16} /> Resetar Conta
        </button>
      </div>

      {/* Ticker Tape Widgets or Overview Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div style={{ background: "linear-gradient(135deg, rgba(79,110,247,0.1) 0%, rgba(79,110,247,0.05) 100%)", border: "1px solid rgba(79,110,247,0.2)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>Poder de Compra (Caixa)</div>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--blue-primary)" }}>
            R$ {Number(account?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>Patrimônio Líquido Total</div>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)" }}>
            R$ {totalEquity.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Main Trading Area */}
      <div className="sim-main-grid">
        
        {/* Left Column: Chart */}
        <div className="sim-chart-container" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} color="var(--blue-primary)" />
              {selectedAsset ? selectedAsset.symbol.replace('BINANCE:', '') : "IBOVESPA"}
            </div>
          </div>
          <div style={{ flex: 1, width: "100%", background: "#131722" }}>
            <iframe
              src={`https://s.tradingview.com/widgetembed/?symbol=${getTradingViewSymbol(selectedAsset?.symbol)}&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=America%2FSao_Paulo&withdateranges=1&showpopupbutton=1&studies_overrides={}`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowTransparency={true}
              scrolling="no"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Right Column: Order Entry */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "20px" }}>Boleta de Ordem</h3>
            
            <div style={{ position: "relative", marginBottom: "24px" }} ref={searchRef}>
              <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input 
                type="text" 
                placeholder="Buscar ativo (ex: PETR4)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                style={{ width: "100%", padding: "12px 16px 12px 42px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", color: "var(--text-primary)", fontWeight: 700, outline: "none", fontSize: "1rem" }}
              />
              
              {loadingSearch && <RefreshCw size={14} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", animation: "spin 1s linear infinite" }} />}

              {suggestions.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", marginTop: "8px", zIndex: 10, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                  {suggestions.map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => selectAsset(s.symbol)}
                      style={{ padding: "12px 16px", borderBottom: i < suggestions.length - 1 ? "1px solid var(--border-default)" : "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ fontWeight: 700 }}>{s.symbol.replace('BINANCE:', '')}</div>
                        {s.type && (
                          <div style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 800 }}>
                            {s.type}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.shortName || s.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {loadingQuote ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-tertiary)" }}>Buscando cotação real...</div>
            ) : selectedAsset ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>Cotação de Mercado</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-primary)" }}>
                      R$ {selectedAsset.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ color: selectedAsset.changePercent >= 0 ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>
                    {selectedAsset.changePercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {selectedAsset.changePercent >= 0 ? "+" : ""}{selectedAsset.changePercent.toFixed(2)}%
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontWeight: 700, marginBottom: "8px", display: "block" }}>Quantidade</label>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{ width: "100%", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", color: "var(--text-primary)", fontWeight: 700, outline: "none", fontSize: "1.2rem", textAlign: "center" }}
                  />
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  <span>Valor Total:</span>
                  <span>R$ {(!isNaN(parseFloat(quantity)) ? parseFloat(quantity) * selectedAsset.price : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {orderError && (
                  <div style={{ padding: "12px", background: "rgba(255,0,0,0.1)", color: "var(--red-primary)", borderRadius: "8px", fontSize: "0.85rem", border: "1px solid rgba(255,0,0,0.2)" }}>
                    {orderError}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
                  <button 
                    onClick={() => handleOrder('buy')}
                    disabled={orderLoading}
                    style={{ background: "var(--green-primary)", color: "#000", border: "none", padding: "16px", borderRadius: "12px", fontWeight: 900, fontSize: "1.1rem", cursor: orderLoading ? "not-allowed" : "pointer", opacity: orderLoading ? 0.7 : 1 }}
                  >
                    COMPRAR
                  </button>
                  <button 
                    onClick={() => handleOrder('sell')}
                    disabled={orderLoading}
                    style={{ background: "rgba(255,0,0,0.1)", color: "var(--red-primary)", border: "1px solid rgba(255,0,0,0.3)", padding: "16px", borderRadius: "12px", fontWeight: 900, fontSize: "1.1rem", cursor: orderLoading ? "not-allowed" : "pointer", opacity: orderLoading ? 0.7 : 1 }}
                  >
                    VENDER
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-tertiary)", background: "var(--bg-elevated)", borderRadius: "12px", border: "1px dashed var(--border-default)" }}>
                Pesquise um ativo acima para simular.
              </div>
            )}
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "24px", flex: 1 }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "20px" }}>Carteira Simulada</h3>
            {positions.length === 0 ? (
              <div style={{ color: "var(--text-tertiary)", fontSize: "0.9rem", textAlign: "center", padding: "20px" }}>Nenhum ativo na carteira virtual.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {positions.map(pos => {
                  const quote = initialQuotes?.find((q: any) => q.symbol === pos.ticker);
                  const currentPrice = quote?.price || pos.average_price;
                  const totalValue = currentPrice * pos.quantity;
                  const invested = pos.average_price * pos.quantity;
                  const profit = totalValue - invested;
                  const profitPct = invested > 0 ? (profit / invested) * 100 : 0;
                  const isProfit = profit >= 0;

                  return (
                    <div key={pos.id} style={{ display: "flex", flexDirection: "column", padding: "16px", background: "var(--bg-elevated)", borderRadius: "12px", border: "1px solid var(--border-subtle)", gap: "12px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <div>
                          <div style={{ fontWeight: 900, color: "var(--text-primary)", fontSize: "1.1rem" }}>{pos.ticker}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                            {Number(pos.quantity)} unid • PM: R$ {Number(pos.average_price).toFixed(2)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 800, color: "var(--text-primary)" }}>R$ {totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})}</div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: isProfit ? "var(--green-primary)" : "var(--red-primary)", marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", flexWrap: "wrap" }}>
                            {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {profit > 0 ? "+" : ""}R$ {profit.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits:2})} ({profitPct > 0 ? "+" : ""}{profitPct.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center", marginTop: "4px", borderTop: "1px solid var(--border-default)", paddingTop: "12px" }}>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          Cotação: <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>R$ {Number(currentPrice).toFixed(2)}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setQuantity(pos.quantity.toString());
                            selectAsset(pos.ticker);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          style={{ padding: "6px 16px", background: "rgba(255,0,0,0.1)", color: "var(--red-primary)", border: "1px solid rgba(255,0,0,0.2)", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,0,0,0.2)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,0,0,0.1)"}
                        >
                          Vender Tudo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
