"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  PieChart as PieChartIcon, Activity, ChevronRight,
  BrainCircuit, Sparkles
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Sector
} from "recharts";
import { 
  calcPortfolioMetrics, 
  formatCurrency, formatPercent, formatCompact,
  assetTypeLabel, Asset, AssetType
} from "@/lib/mock-data";
import { getPortfolioSnapshots } from "@/app/actions/snapshots";
import { getMultipleQuotes, getExchangeRate } from "@/app/actions/market";
import MarketOverview from "@/components/dashboard/MarketOverview";
import AssetIcon from "@/components/ui/AssetIcon";

// Neon Palette for Dashboard
const NEON_COLORS: Record<string, string> = {
  ACAO: "#00F0FF", // Neon Cyan
  FII: "#FF00E4", // Neon Magenta
  ETF: "#7000FF", // Neon Purple
  BDR: "#FFD600", // Neon Yellow
  RENDA_FIXA: "#00FF66", // Neon Green
  CRYPTO: "#FF4D00", // Neon Orange
};

export default function DashboardClient({ initialAssets, dividends = [] }: { initialAssets: any[], dividends?: any[] }) {
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
      color: NEON_COLORS[type] || "#ffffff"
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
          cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
          startAngle={startAngle} endAngle={endAngle} fill={fill}
          style={{ filter: `drop-shadow(0 0 8px ${fill})` }}
        />
      </g>
    );
  };

  const [activeIndex, setActiveIndex] = useState(0);

  // Calculate current month dividends
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthDividends = dividends
    .filter(d => {
      const date = new Date(d.paymentDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, d) => sum + d.amount, 0);

  const hasDividends = currentMonthDividends > 0;

  // AI Insight Generator
  const generateInsight = () => {
    if (metrics.totalCurrent === 0) return "Sua carteira está vazia. Comece a investir ou sincronize com o Open Finance para acender os motores do seu patrimônio.";
    const topType = pieData[0]?.name;
    const topPercent = ((pieData[0]?.value / metrics.totalCurrent) * 100).toFixed(0);
    
    if (metrics.totalProfitPercent < 0) {
      return `Seu patrimônio está concentrado em ${topType} (${topPercent}%). O mercado atual apresenta oscilações, mantenha o foco no longo prazo e aproveite os descontos.`;
    }
    
    if (topType === 'Ações' || topType === 'BDRs') {
      return `Com ${topPercent}% em ${topType}, seu portfólio está agressivo e capturando o crescimento do mercado. O efeito bola de neve está acelerando!`;
    }
    if (topType === 'Renda Fixa') {
      return `Você possui ${topPercent}% em ${topType}. Parabéns pela blindagem patrimonial! Seu dinheiro está rendendo com segurança e risco reduzido.`;
    }
    if (topType === 'Fundos Imobiliários') {
      return `${topPercent}% da sua carteira gera aluguéis (FIIs). Sua máquina de renda passiva mensal está trabalhando ativamente por você.`;
    }

    return `Sua carteira está diversificada e avançando de forma consistente com os juros compostos ao seu favor!`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "4px", background: "linear-gradient(90deg, #fff, #a5a5a5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Visão Geral
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.95rem" }}>O ecossistema inteligente da sua riqueza.</p>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }} onClick={() => window.print()}>
          Gerar Relatório PDF
        </button>
      </div>

      {/* AI INSIGHT BANNER */}
      <div style={{
        background: "linear-gradient(135deg, rgba(138,43,226,0.15) 0%, rgba(0,240,255,0.1) 100%)",
        border: "1px solid rgba(138,43,226,0.3)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        alignItems: "flex-start",
        gap: "20px",
        boxShadow: "0 4px 30px rgba(138,43,226,0.1)"
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: "linear-gradient(135deg, #8a2be2 0%, #00F0FF 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 15px rgba(0,240,255,0.5)",
          flexShrink: 0
        }}>
          <BrainCircuit size={24} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontSize: "1.1rem", margin: "0 0 8px 0", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} color="#00F0FF" /> Insight da Patrimônio+
          </h3>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: "1rem", lineHeight: "1.5" }}>
            {generateInsight()}
          </p>
        </div>
      </div>

      {/* METRICS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div className="metric-card" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(0, 255, 102, 0.15)", color: "#00FF66" }}>
              <Wallet size={18} />
            </div>
            <div className="badge" style={{ background: "rgba(0,255,102,0.1)", color: "#00FF66", border: "1px solid rgba(0,255,102,0.2)" }}><span className="dot-green" style={{ background: "#00FF66", boxShadow: "0 0 5px #00FF66" }} /> Ao vivo</div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Patrimônio Total</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
            {formatCurrency(metrics.totalCurrent)}
          </div>
        </div>

        <div className="metric-card" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(0, 240, 255, 0.15)", color: "#00F0FF" }}>
              <TrendingUp size={18} />
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-tertiary)" }}>Histórico</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Lucro / Prejuízo</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: metrics.totalProfit >= 0 ? "#00FF66" : "var(--red-primary)" }}>
              {formatCurrency(metrics.totalProfit)}
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: metrics.totalProfit >= 0 ? "#00FF66" : "var(--red-primary)" }}>
              ({formatPercent(metrics.totalProfitPercent)})
            </div>
          </div>
        </div>

        <div className="metric-card" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255, 214, 0, 0.15)", color: "#FFD600" }}>
              <DollarSign size={18} />
            </div>
            {hasDividends ? (
              <div className="badge" style={{ background: "rgba(255,214,0,0.2)", color: "#FFD600", border: "1px solid rgba(255,214,0,0.3)" }}>Ativo</div>
            ) : (
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-tertiary)" }}>Sem dados</span>
            )}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Dividendos (Mês)</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
            {formatCurrency(currentMonthDividends)}
          </div>
        </div>

        <div className="metric-card" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(255, 0, 228, 0.15)", color: "#FF00E4" }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Rentabilidade (12M)</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
            {formatPercent(metrics.totalProfitPercent)}
          </div>
        </div>
      </div>

      {/* NEON CHARTS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }} className="dashboard-charts">
        
        {/* Main Chart */}
        <div style={{
          background: "rgba(10,10,12,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "inset 0 0 20px rgba(0,240,255,0.02)",
          minWidth: 0,
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
              <TrendingUp size={18} color="#00F0FF" /> Evolução Patrimonial
            </h3>
            <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", overflowX: "auto", maxWidth: "100%" }}>
              {(["1M", "6M", "1A", "TUDO"] as const).map(tr => (
                <button 
                  key={tr}
                  onClick={() => setTimeRange(tr)}
                  style={{
                    padding: "4px 12px", borderRadius: "6px",
                    border: "none",
                    background: timeRange === tr ? "rgba(0,240,255,0.2)" : "transparent",
                    color: timeRange === tr ? "#00F0FF" : "var(--text-tertiary)",
                    fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                    boxShadow: timeRange === tr ? "0 0 10px rgba(0,240,255,0.3)" : "none",
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
                    <stop offset="5%" stopColor="#00FF66" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00FF66" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="neonGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} width={50} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                         <div style={{ background: "rgba(10,10,12,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px", backdropFilter: "blur(10px)", boxShadow: "0 0 20px rgba(0,255,102,0.1)" }}>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "4px" }}>{label}</p>
                          <p style={{ color: "#00FF66", fontWeight: 800, fontSize: "1.1rem", textShadow: "0 0 8px rgba(0,255,102,0.5)" }}>{formatCurrency(Number(payload[0].value))}</p>
                          {payload[1] && <p style={{ color: "#00F0FF", fontSize: "0.8rem", marginTop: "2px" }}>Investido: {formatCurrency(Number(payload[1].value))}</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="invested" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorInvested)" strokeDasharray="5 5" />
                <Area type="monotone" dataKey="value" stroke="#00FF66" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" filter="url(#neonGlow)" activeDot={{ r: 6, fill: "#000", stroke: "#00FF66", strokeWidth: 3, filter: "url(#neonGlow)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div style={{
          background: "rgba(10,10,12,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex", flexDirection: "column",
          boxShadow: "inset 0 0 20px rgba(255,0,228,0.02)"
        }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
            <PieChartIcon size={18} color="#FF00E4" /> Alocação por Classe
          </h3>
          
          <div style={{ height: "200px", display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  stroke="none"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}80)` }} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{ background: "rgba(10,10,12,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", backdropFilter: "blur(10px)" }}
                  itemStyle={{ fontWeight: 700 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", paddingRight: "8px" }}>
            {pieData.map((item, i) => {
              const percent = (item.value / metrics.totalCurrent) * 100;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: i === activeIndex ? "rgba(255,255,255,0.05)" : "transparent", borderRadius: "8px", transition: "all 0.2s", cursor: "pointer", border: i === activeIndex ? `1px solid ${item.color}40` : "1px solid transparent" }} onMouseEnter={() => setActiveIndex(i)}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>{item.name}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: item.color, textShadow: `0 0 5px ${item.color}50` }}>{formatPercent(percent)}</div>
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
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem" }}>Top Posições</h3>
          <a href="/portfolio" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#00F0FF", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
            Ver carteira completa <ChevronRight size={14} />
          </a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table-premium" style={{ minWidth: "600px", width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={{ padding: "16px 24px", textAlign: "left", color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Ativo</th>
                <th style={{ padding: "16px 24px", textAlign: "left", color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Tipo</th>
                <th style={{ padding: "16px 24px", textAlign: "right", color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Quantidade</th>
                <th style={{ padding: "16px 24px", textAlign: "right", color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Preço Médio</th>
                <th style={{ padding: "16px 24px", textAlign: "right", color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Preço Atual</th>
                <th style={{ padding: "16px 24px", textAlign: "right", color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Total</th>
                <th style={{ padding: "16px 24px", textAlign: "right", color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase" }}>Lucro / Prejuízo</th>
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
                  <tr key={asset.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <AssetIcon ticker={asset.ticker} name={asset.name} logoUrl={quotes[asset.ticker?.toUpperCase()]?.logoUrl} />
                        <div>
                          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{asset.ticker}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div className="badge" style={{ background: `${NEON_COLORS[asset.type]}20`, color: NEON_COLORS[asset.type], border: `1px solid ${NEON_COLORS[asset.type]}40`, textShadow: `0 0 5px ${NEON_COLORS[asset.type]}50` }}>
                        {assetTypeLabel[asset.type as AssetType]}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 600, color: "#fff" }}>
                      {Number(asset.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 5 })}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right", color: "var(--text-secondary)" }}>{formatCurrency(asset.averagePrice, asset.currency)}</td>
                    <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 600, color: "#fff" }}>{formatCurrency(livePrice, asset.currency)}</td>
                    <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 800, color: "#fff" }}>{formatCurrency(totalCurrent, asset.currency)}</td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ color: profit >= 0 ? "#00FF66" : "var(--red-primary)", fontWeight: 800, textShadow: profit >= 0 ? "0 0 5px rgba(0,255,102,0.3)" : "none" }}>
                        {profit >= 0 ? "+" : ""}{formatCurrency(profit, asset.currency)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: profit >= 0 ? "#00FF66" : "var(--red-primary)", fontWeight: 600 }}>
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
