"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, Calendar, TrendingUp, Filter, ChevronLeft, ChevronRight,
  DownloadCloud
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { 
  mockDividends, mockDividendsByMonth, formatCurrency, formatPercent
} from "@/lib/mock-data";

export default function DividendsPage() {
  const [activeYear, setActiveYear] = useState(2026);
  
  const totalYear = mockDividends.reduce((sum, item) => sum + item.amount, 0);
  const avgMonth = totalYear / 6; // Considerando os 6 meses mockados
  const projectedYear = avgMonth * 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Dividendos e Proventos</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Acompanhe sua renda passiva mensal e histórica.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary btn-sm" style={{ gap: "8px" }}>
            <DownloadCloud size={16} /> Exportar
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(251,146,60,0.15)", color: "var(--orange-primary)" }}>
              <DollarSign size={18} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-elevated)", padding: "4px 12px", borderRadius: "100px", border: "1px solid var(--border-default)" }}>
              <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}><ChevronLeft size={14} /></button>
              <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{activeYear}</span>
              <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}><ChevronRight size={14} /></button>
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Recebido em {activeYear}</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(totalYear)}</div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "var(--green-glow)", color: "var(--green-primary)" }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Média Mensal</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(avgMonth)}</div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "var(--blue-glow)", color: "var(--blue-primary)" }}>
              <TrendingUp size={18} />
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--green-primary)" }}>+32% vs 2025</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Projeção Anual</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(projectedYear)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }} className="dividends-grid">
        
        {/* Chart */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex", flexDirection: "column",
        }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "24px" }}>Histórico de Recebimentos</h3>
          <div style={{ flex: 1, minHeight: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDividendsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                <Tooltip 
                  cursor={{ fill: "var(--bg-elevated)", opacity: 0.5 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-tooltip">
                          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "4px" }}>{label}</p>
                          <p style={{ color: "var(--green-primary)", fontWeight: 700, fontSize: "1rem" }}>{formatCurrency(Number(payload[0].value))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {mockDividendsByMonth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === mockDividendsByMonth.length - 1 ? "var(--green-primary)" : "var(--green-600)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* List */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "16px",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Últimos Lançamentos</h3>
            <button className="btn btn-ghost btn-sm" style={{ padding: "4px" }}>
              <Filter size={16} />
            </button>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table className="table-premium" style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: "24px" }}>Data</th>
                  <th>Ativo</th>
                  <th style={{ textAlign: "right", paddingRight: "24px" }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {mockDividends.slice(0, 10).map((div) => {
                  const dateObj = new Date(div.paymentDate);
                  const formattedDate = dateObj.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' }).replace('.', '');
                  
                  return (
                    <tr key={div.id}>
                      <td style={{ paddingLeft: "24px" }}>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{formattedDate}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                            {div.ticker.substring(0,2)}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{div.ticker}</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>{div.type}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "24px" }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--green-primary)" }}>+{formatCurrency(div.amount)}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>Yield: {formatPercent(div.yieldPercent)}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .dividends-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}
