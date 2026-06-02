"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const patrimonioData = [
  { date: "Jun/24", value: 42000, invested: 38000 },
  { date: "Jul/24", value: 44500, invested: 40000 },
  { date: "Ago/24", value: 43800, invested: 41500 },
  { date: "Set/24", value: 46200, invested: 43000 },
  { date: "Out/24", value: 49800, invested: 45000 },
  { date: "Nov/24", value: 51200, invested: 46500 },
  { date: "Dez/24", value: 54600, invested: 48000 },
  { date: "Jan/25", value: 57400, invested: 50000 },
  { date: "Fev/25", value: 59200, invested: 51500 },
  { date: "Mar/25", value: 62800, invested: 53000 },
  { date: "Abr/25", value: 65100, invested: 54500 },
  { date: "Mai/25", value: 68450, invested: 56000 },
];

const dividendData = [
  { month: "Dez", value: 1820 },
  { month: "Jan", value: 2140 },
  { month: "Fev", value: 1980 },
  { month: "Mar", value: 2278 },
  { month: "Abr", value: 2635 },
  { month: "Mai", value: 2969 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <div style={{ marginBottom: "6px", color: "var(--text-tertiary)", fontSize: "0.75rem" }}>{label}</div>
        <div style={{ color: "var(--green-primary)", fontWeight: 700, fontSize: "0.95rem" }}>
          R$ {Number(payload[0].value).toLocaleString("pt-BR")}
        </div>
        {payload[1] && (
          <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: "2px" }}>
            Investido: R$ {Number(payload[1].value).toLocaleString("pt-BR")}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const stats = [
  { label: "Patrimônio atual", value: "R$ 68.450", change: "+18,4%", positive: true },
  { label: "Renda passiva mensal", value: "R$ 2.969", change: "+62,8%", positive: true },
  { label: "Ativos na carteira", value: "12 ativos", change: "diversificado", positive: true },
  { label: "Tempo investindo", value: "2,5 anos", change: "disciplina", positive: true },
];

export default function PatrimonioSection() {
  return (
    <section id="patrimonio" className="section" style={{
      background: "linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Left glow */}
      <div style={{
        position: "absolute", left: "-100px", top: "30%",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "72px" }}
        >
          <div className="badge badge-green" style={{ marginBottom: "20px", display: "inline-flex" }}>
            <TrendingUp size={12} />
            Evolução Patrimonial
          </div>
          <h2 style={{ marginBottom: "16px" }}>
            Veja seu patrimônio{" "}
            <span className="gradient-text">crescer na prática</span>
          </h2>
          <p style={{ fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto" }}>
            Gráficos detalhados que mostram a evolução real do seu portfí­Â³lio, investimentos realizados e renda passiva gerada.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "48px",
          }}
          className="stats-grid"
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "14px",
                padding: "20px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: s.positive ? "var(--green-primary)" : "var(--red-primary)" }}>
                {s.positive && "í¢ÂÂ"} {s.change}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }} className="charts-grid">
          {/* Main patrimônio chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Evolução do Patrimônio</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>R$ 68.450</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <ArrowUpRight size={14} color="var(--green-primary)" />
                  <span style={{ fontSize: "0.85rem", color: "var(--green-primary)", fontWeight: 600 }}>+R$12.450 (12 meses)</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {["6M", "1A", "2A"].map((p, i) => (
                  <button key={i} style={{
                    padding: "4px 12px", borderRadius: "6px",
                    border: "1px solid var(--border-default)",
                    background: i === 1 ? "var(--green-glow)" : "transparent",
                    color: i === 1 ? "var(--green-primary)" : "var(--text-tertiary)",
                    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                  }}>{p}</button>
                ))}
              </div>
            </div>

            {/* Legends */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "12px", height: "3px", borderRadius: "2px", background: "var(--green-primary)" }} />
                <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>Patrimônio atual</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "12px", height: "3px", borderRadius: "2px", background: "var(--blue-primary)", opacity: 0.6 }} />
                <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>Total investido</span>
              </div>
            </div>

            <div style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patrimonioData}>
                  <defs>
                    <linearGradient id="patrimonioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                    axisLine={false} tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="invested" stroke="#4f6ef7" strokeWidth={1.5} fill="url(#investedGrad)" dot={false} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="value" stroke="#00d4aa" strokeWidth={2.5} fill="url(#patrimonioGrad)" dot={false}
                    activeDot={{ r: 5, fill: "#00d4aa", stroke: "#000", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Dividends chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Renda Passiva Mensal</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>R$ 2.969</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                <ArrowUpRight size={14} color="var(--green-primary)" />
                <span style={{ fontSize: "0.85rem", color: "var(--green-primary)", fontWeight: 600 }}>+62,8% vs. dezembro</span>
              </div>
            </div>

            <div style={{ height: "200px", marginBottom: "20px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dividendData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`} width={32} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="custom-tooltip">
                            <div style={{ color: "var(--text-tertiary)", fontSize: "0.75rem", marginBottom: "4px" }}>{label}</div>
                            <div style={{ color: "var(--green-primary)", fontWeight: 700 }}>
                              R$ {Number(payload[0].value).toLocaleString("pt-BR")}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}
                    fill="url(#barGrad)" />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4aa" />
                      <stop offset="100%" stopColor="#00b890" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Next dividend */}
            <div style={{
              background: "var(--green-glow)",
              border: "1px solid var(--border-accent)",
              borderRadius: "12px",
              padding: "14px",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{ fontSize: "1.5rem" }}>í°ÂÂÂ°</div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>Prí­Â³ximo dividendo</div>
                <div style={{ fontSize: "0.75rem", color: "var(--green-primary)", fontWeight: 600 }}>MXRF11 í¢ÂÂ R$ 527,50 em 14/Jun</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .charts-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
