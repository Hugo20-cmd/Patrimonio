"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  PieChart as PieChartIcon, Activity, ChevronRight
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Sector
} from "recharts";
import { 
  calcPortfolioMetrics, 
  formatCurrency, formatPercent, formatCompact,
  assetTypeColor, assetTypeLabel, Asset, AssetType
} from "@/lib/mock-data";
import { getPortfolioSnapshots } from "@/app/actions/snapshots";
import { getMultipleQuotes, getExchangeRate } from "@/app/actions/market";
import MarketOverview from "@/components/dashboard/MarketOverview";

export default function DashboardClient({ initialAssets }: { initialAssets: any[] }) {
  const [timeRange, setTimeRange] = useState<"1M" | "6M" | "1A" | "TUDO">("1A");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [exchangeRate, setExchangeRate] = useState(5.0);
  const [quotesLoading, setQuotesLoading] = useState(true);

  // Fetch Quotes
  useEffect(() => {
    async function loadQuotes() {
      if (!initialAssets.length) {
        setQuotesLoading(false);
        return;
      }
      try {
        const tickers = initialAssets.map((a) => a.ticker);
        const [results, rate] = await Promise.all([
          getMultipleQuotes(tickers),
          getExchangeRate()
        ]);
        if (rate) setExchangeRate(rate);

        const newQuotes: Record<string, any> = {};
        results.forEach((r: any) => {
          if (r && r.symbol) newQuotes[r.symbol.toUpperCase()] = r;
        });
        setQuotes(newQuotes);
      } catch (err) {
        console.error("Failed to fetch quotes:", err);
      } finally {
        setQuotesLoading(false);
      }
    }
    loadQuotes();
  }, [initialAssets]);

  // Calc Metrics dynamically
  function getDynamicMetrics() {
    let totalInvested = 0;
    let totalCurrent = 0;
    const byType: Record<string, number> = {};

    for (const a of initialAssets) {
      const quotePrice = quotes[a.ticker?.toUpperCase()]?.price ?? a.currentPrice ?? a.averagePrice;
      let nativeInvested = a.quantity * a.averagePrice;
      let nativeCurrent = a.quantity * quotePrice;
      
      let assetCurrency = a.currency || 'BRL';
      if (assetCurrency === 'USD') {
        nativeInvested *= exchangeRate;
        nativeCurrent *= exchangeRate;
      }

      totalInvested += nativeInvested;
      totalCurrent += nativeCurrent;
      byType[a.type] = (byType[a.type] || 0) + nativeCurrent;
    }

    const totalProfit = totalCurrent - totalInvested;
    const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
    return { totalInvested, totalCurrent, totalProfit, totalProfitPercent, byType };
  }

  const metrics = getDynamicMetrics();

  useEffect(() => {
    if (!quotesLoading) {
      getPortfolioSnapshots(metrics.totalInvested, metrics.totalCurrent, timeRange)
        .then(setHistoryData)
        .catch(console.error);
    }
  }, [metrics.totalInvested, metrics.totalCurrent, quotesLoading, timeRange]);

  // Prepare Pie Chart data
  const pieData = Object.entries(metrics.byType)
    .map(([type, value]) => ({
      name: assetTypeLabel[type as keyof typeof assetTypeLabel] || type,
      value,
      color: assetTypeColor[type] || "#fff"
    }))
    .sort((a, b) => b.value - a.value);

  // Top Assets
  const topAssets = [...initialAssets].sort((a, b) => {
    const priceA = quotes[a.ticker?.toUpperCase()]?.price ?? a.currentPrice ?? a.averagePrice;
    const priceB = quotes[b.ticker?.toUpperCase()]?.price ?? b.currentPrice ?? b.averagePrice;
    let valA = a.quantity * priceA;
    let valB = b.quantity * priceB;
    if (a.currency === 'USD') valA *= exchangeRate;
    if (b.currency === 'USD') valB *= exchangeRate;
    return valB - valA;
  }).slice(0, 5);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 4}
          startAngle={startAngle} endAngle={endAngle} fill={fill}
        />
        <Sector
          cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
          innerRadius={outerRadius + 6} outerRadius={outerRadius + 8} fill={fill}
        />
      </g>
    );
  };

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Visão Geral</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Acompanhe o crescimento do seu patrimônio e investimentos.</p>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ gap: "8px" }} onClick={() => window.print()}>
          Gerar Relatório PDF
        </button>
      </div>

      {/* METRICS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "var(--green-glow)", color: "var(--green-primary)" }}>
              <Wallet size={18} />
            </div>
            <div className="badge badge-green"><span className="dot-green" /> Ao vivo</div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Patrimônio Total</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {formatCurrency(metrics.totalCurrent)}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "var(--blue-glow)", color: "var(--blue-primary)" }}>
              <TrendingUp size={18} />
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-tertiary)" }}>Histórico</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Lucro / Prejuízo</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: metrics.totalProfit >= 0 ? "var(--green-primary)" : "var(--red-primary)" }}>
              {formatCurrency(metrics.totalProfit)}
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: metrics.totalProfit >= 0 ? "var(--green-primary)" : "var(--red-primary)" }}>
              ({formatPercent(metrics.totalProfitPercent)})
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(251,146,60,0.15)", color: "var(--orange-primary)" }}>
              <DollarSign size={18} />
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-tertiary)" }}>Sem dados</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Dividendos (Mês)</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>
            R$ 0,00
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(139,92,246,0.15)", color: "var(--purple-primary)" }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Rentabilidade (12M)</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {formatPercent(metrics.totalProfitPercent)}
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }} className="dashboard-charts">
        
        {/* Main Chart */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "16px",
          padding: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={18} color="var(--green-primary)" /> Evolução Patrimonial
            </h3>
            <div style={{ display: "flex", gap: "4px", background: "var(--bg-elevated)", padding: "4px", borderRadius: "8px" }}>
              {(["1M", "6M", "1A", "TUDO"] as const).map(tr => (
                <button 
                  key={tr}
                  onClick={() => setTimeRange(tr)}
                  style={{
                    padding: "4px 12px", borderRadius: "6px",
                    border: "none",
                    background: timeRange === tr ? "var(--bg-card)" : "transparent",
                    color: timeRange === tr ? "var(--text-primary)" : "var(--text-tertiary)",
                    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                    boxShadow: timeRange === tr ? "var(--shadow-sm)" : "none",
                    transition: "all 0.2s"
                  }}
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ height: "300px", marginLeft: "-16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--green-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--green-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--blue-primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--blue-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} width={50} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-tooltip">
                          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "4px" }}>{label}</p>
                          <p style={{ color: "var(--green-primary)", fontWeight: 700, fontSize: "1rem" }}>{formatCurrency(Number(payload[0].value))}</p>
                          {payload[1] && <p style={{ color: "var(--blue-primary)", fontSize: "0.8rem", marginTop: "2px" }}>Investido: {formatCurrency(Number(payload[1].value))}</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="invested" stroke="var(--blue-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorInvested)" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="value" stroke="var(--green-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 6, fill: "var(--bg-card)", stroke: "var(--green-primary)", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex", flexDirection: "column",
        }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <PieChartIcon size={18} color="var(--blue-primary)" /> Alocação por Classe
          </h3>
          
          <div style={{ height: "200px", display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px" }}
                  itemStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", paddingRight: "8px" }}>
            {pieData.map((item, i) => {
              const percent = (item.value / metrics.totalCurrent) * 100;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: i === activeIndex ? "var(--bg-card-hover)" : "transparent", borderRadius: "8px", transition: "background 0.2s", cursor: "pointer" }} onMouseEnter={() => setActiveIndex(i)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{formatPercent(percent)}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>{formatCompact(item.value)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MARKET OVERVIEW */}
      <MarketOverview />

      {/* TOP ASSETS TABLE */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "16px",
        overflow: "hidden",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem" }}>Top Posições</h3>
          <a href="/portfolio" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--blue-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
            Ver carteira completa <ChevronRight size={14} />
          </a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table-premium" style={{ minWidth: "600px" }}>
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Tipo</th>
                <th style={{ textAlign: "right" }}>Quantidade</th>
                <th style={{ textAlign: "right" }}>Preço Médio</th>
                <th style={{ textAlign: "right" }}>Preço Atual</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th style={{ textAlign: "right" }}>Lucro / Prejuízo</th>
              </tr>
            </thead>
            <tbody>
              {topAssets.map(asset => {
                const livePrice = quotes[asset.ticker?.toUpperCase()]?.price ?? asset.currentPrice ?? asset.averagePrice;
                const totalInvested = asset.quantity * asset.averagePrice;
                const totalCurrent = asset.quantity * livePrice;
                const profit = totalCurrent - totalInvested;
                const profitPercent = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
                
                return (
                  <tr key={asset.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                          {asset.ticker.substring(0,2)}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{asset.ticker}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="badge" style={{ background: `${assetTypeColor[asset.type as AssetType]}20`, color: assetTypeColor[asset.type as AssetType], border: `1px solid ${assetTypeColor[asset.type as AssetType]}30` }}>
                        {assetTypeLabel[asset.type as AssetType]}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{asset.quantity}</td>
                    <td style={{ textAlign: "right" }}>{formatCurrency(asset.averagePrice, asset.currency)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(livePrice, asset.currency)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(totalCurrent, asset.currency)}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ color: profit >= 0 ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 700 }}>
                        {profit >= 0 ? "+" : ""}{formatCurrency(profit, asset.currency)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: profit >= 0 ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 600 }}>
                        {formatPercent(profitPercent)}
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
        @media (max-width: 1024px) {
          .dashboard-charts {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
