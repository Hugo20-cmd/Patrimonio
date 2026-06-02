"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Download, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

// Mini chart data para o mockup do hero
const heroChartData = [
  { v: 42000 }, { v: 44500 }, { v: 43800 }, { v: 46200 },
  { v: 49800 }, { v: 51200 }, { v: 54600 }, { v: 57400 },
  { v: 59200 }, { v: 62800 }, { v: 65100 }, { v: 68450 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// Mini metric card para o hero mockup
function MiniMetric({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px",
      padding: "14px 16px",
      flex: 1,
      minWidth: "120px",
    }}>
      <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 500, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
      <div style={{ fontSize: "0.75rem", color: positive ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 600, marginTop: "2px" }}>
        {positive ? "â²" : "â¼"} {change}
      </div>
    </div>
  );
}

// Mini ticker
function MiniTicker({ ticker, value, change, positive }: { ticker: string; value: string; change: string; positive: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: "rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)",
        }}>{ticker.slice(0, 2)}</div>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{ticker}</span>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{value}</div>
        <div style={{ fontSize: "0.72rem", color: positive ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 600 }}>
          {positive ? "+" : ""}{change}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: "72px" }}>
      <div className="container" style={{ padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "center",
        }} className="hero-grid">

          {/* LEFT â Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <div className="badge badge-green" style={{ marginBottom: "28px", display: "inline-flex" }}>
                <span className="dot-green animate-blink" />
                Plataforma nÂº1 em evolução patrimonial
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={itemVariants} style={{ marginBottom: "24px", lineHeight: 1.1 }}>
              Organize seus{" "}
              <span className="gradient-text">investimentos</span>{" "}
              em um íºnico lugar.
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={itemVariants} style={{
              fontSize: "1.15rem",
              color: "var(--text-secondary)",
              marginBottom: "40px",
              lineHeight: 1.7,
              maxWidth: "520px",
            }}>
              Acompanhe ETFs, açíµes, FIIs e patrimônio automaticamente com{" "}
              <strong style={{ color: "var(--text-primary)" }}>gráficos inteligentes</strong> e{" "}
              <strong style={{ color: "var(--text-primary)" }}>relatí³rios em tempo real</strong>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "48px" }}>
              <Link href="/register" className="btn btn-primary btn-lg" style={{ gap: "10px" }}>
                <Zap size={18} />
                Criar conta grátis
                <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg" style={{ gap: "10px" }}>
                Fazer Login
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={itemVariants} style={{
              display: "flex", alignItems: "center", gap: "16px",
              paddingTop: "24px",
              borderTop: "1px solid var(--border-subtle)",
            }}>
              {/* Avatars */}
              <div style={{ display: "flex" }}>
                {["JR", "MP", "AS", "LC"].map((init, i) => (
                  <div key={i} style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: `hsl(${i * 60 + 160}, 60%, 40%)`,
                    border: "2px solid var(--bg-primary)",
                    marginLeft: i === 0 ? 0 : "-10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 700, color: "#fff",
                    zIndex: 4 - i,
                    position: "relative",
                  }}>{init}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  +12.400 investidores
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
                  controlando o patrimônio
                </div>
              </div>
              <div style={{ marginLeft: "16px" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--green-primary)" }}>
                  R$ 890M+
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
                  em patrimônio gerenciado
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT â Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative" }}
            className="hero-mockup"
          >
            {/* Floating glows */}
            <div style={{
              position: "absolute", top: "-40px", right: "-40px",
              width: "300px", height: "300px",
              background: "radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: "-40px", left: "-40px",
              width: "250px", height: "250px",
              background: "radial-gradient(circle, rgba(79,110,247,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            {/* Main dashboard card */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,212,170,0.08)",
                backdropFilter: "blur(20px)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top green line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: "linear-gradient(90deg, transparent, var(--green-primary), transparent)",
              }} />

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500, marginBottom: "6px" }}>PATRIMíNIO TOTAL</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                    R$ 68.450<span style={{ color: "var(--green-primary)" }}>,00</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <TrendingUp size={14} color="var(--green-primary)" />
                    <span style={{ fontSize: "0.85rem", color: "var(--green-primary)", fontWeight: 600 }}>+18,42% total</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>vs. custo</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <div className="badge badge-green">
                    <span className="dot-green animate-blink" style={{ width: "6px", height: "6px" }} />
                    Ao vivo
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div style={{ height: "140px", marginBottom: "20px", marginLeft: "-8px", marginRight: "-8px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={heroChartData}>
                    <defs>
                      <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#00d4aa"
                      strokeWidth={2.5}
                      fill="url(#heroGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#00d4aa", stroke: "#000", strokeWidth: 2 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div className="custom-tooltip">
                              <span style={{ color: "var(--green-primary)", fontWeight: 700 }}>
                                R$ {payload[0].value?.toLocaleString("pt-BR")}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics row */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <MiniMetric label="Investido" value="R$ 57.7K" change="base" positive={true} />
                <MiniMetric label="Lucro" value="R$ 10.7K" change="18,5%" positive={true} />
                <MiniMetric label="Dividendos" value="R$ 2.969" change="mai/25" positive={true} />
              </div>

              {/* Asset tickers */}
              <div style={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ativos</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Resultado</span>
                </div>
                <MiniTicker ticker="IVVB11" value="R$ 358,72" change="+14,8%" positive={true} />
                <MiniTicker ticker="MXRF11" value="R$ 10,54" change="+7,3%" positive={true} />
                <MiniTicker ticker="WEGE3" value="R$ 47,32" change="+22,3%" positive={true} />
                <MiniTicker ticker="PETR4" value="R$ 36,88" change="+18,2%" positive={true} />
              </div>
            </motion.div>

            {/* Floating notification */}
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              style={{
                position: "absolute",
                bottom: "-24px",
                left: "-40px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-accent)",
                borderRadius: "14px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "var(--shadow-green)",
                backdropFilter: "blur(20px)",
                zIndex: 2,
              }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--green-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ð°
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>Dividendo recebido!</div>
                <div style={{ fontSize: "0.72rem", color: "var(--green-primary)", fontWeight: 600 }}>PETR4 â +R$ 1.080,00</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-mockup {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
