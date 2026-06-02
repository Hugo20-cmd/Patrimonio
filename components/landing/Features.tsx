"use client";

import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Zap, Target, Shield, Globe,
  PieChart, Bell, ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: <TrendingUp size={22} />,
    title: "Evolução Patrimonial",
    description: "Visualize o crescimento do seu patrimônio mí­Âªs a mí­Âªs com gráficos animados e comparativos histí­Â³ricos.",
    color: "#00d4aa",
    glow: "rgba(0,212,170,0.15)",
    tag: "ETFs & Açí­Âµes",
  },
  {
    icon: <Globe size={22} />,
    title: "ETFs Nacionais e Globais",
    description: "BOVA11, IVVB11, HASH11 e ETFs internacionais com atualização automática de cotaçí­Âµes.",
    color: "#4f6ef7",
    glow: "rgba(79,110,247,0.15)",
    tag: "Mercado Global",
  },
  {
    icon: <Bell size={22} />,
    title: "Dividendos Automáticos",
    description: "Registro automático de dividendos, JCP e rendimentos de FIIs. Projete sua renda passiva futura.",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.15)",
    tag: "Renda Passiva",
  },
  {
    icon: <Target size={22} />,
    title: "Metas Financeiras",
    description: "Defina metas de patrimônio e liberdade financeira. Acompanhe o progresso em tempo real.",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.15)",
    tag: "Planejamento",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Dashboard Inteligente",
    description: "Visão 360íÂ° da sua carteira: P&L, diversificação, setores, alocação e muito mais.",
    color: "#00d4aa",
    glow: "rgba(0,212,170,0.15)",
    tag: "Analytics",
  },
  {
    icon: <PieChart size={22} />,
    title: "Análise de Carteira",
    description: "Gráficos de alocação por classe de ativo, setor e risco. Rebalanceamento inteligente.",
    color: "#ffd60a",
    glow: "rgba(255,214,10,0.15)",
    tag: "Diversificação",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Features() {
  return (
    <section id="features" className="section" style={{ position: "relative", overflow: "hidden" }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse, rgba(79,110,247,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "72px" }}
        >
          <div className="badge badge-blue" style={{ marginBottom: "20px", display: "inline-flex" }}>
            <Zap size={12} />
            Funcionalidades Premium
          </div>
          <h2 style={{ marginBottom: "16px" }}>
            Tudo que vocí­Âª precisa para{" "}
            <span className="gradient-text">crescer patrimônio</span>
          </h2>
          <p style={{ fontSize: "1.1rem", maxWidth: "560px", margin: "0 auto" }}>
            Uma plataforma completa para organizar, acompanhar e acelerar sua evolução financeira.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
          className="features-grid"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "16px",
                padding: "28px",
                cursor: "default",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = f.color + "40";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${f.glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Corner glow */}
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: "100px", height: "100px",
                background: `radial-gradient(circle at top right, ${f.glow} 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />

              {/* Icon */}
              <div style={{
                width: "48px", height: "48px",
                borderRadius: "12px",
                background: f.glow,
                border: `1px solid ${f.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "18px",
                color: f.color,
              }}>
                {f.icon}
              </div>

              {/* Tag */}
              <div style={{
                fontSize: "0.7rem", fontWeight: 600, color: f.color,
                textTransform: "uppercase", letterSpacing: "0.08em",
                marginBottom: "10px",
              }}>
                {f.tag}
              </div>

              {/* Title */}
              <h4 style={{ marginBottom: "10px", fontSize: "1rem", fontWeight: 700 }}>
                {f.title}
              </h4>

              {/* Description */}
              <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "var(--text-secondary)" }}>
                {f.description}
              </p>

              {/* Arrow link */}
              <div style={{
                marginTop: "20px",
                display: "flex", alignItems: "center", gap: "4px",
                fontSize: "0.8rem", fontWeight: 600, color: f.color,
                opacity: 0.7,
              }}>
                Saiba mais <ArrowUpRight size={12} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
