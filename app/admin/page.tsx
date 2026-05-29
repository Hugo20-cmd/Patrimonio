"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, Activity, TrendingUp, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/mock-data";

export default function AdminDashboard() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", padding: "40px 24px" }}>
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", paddingBottom: "20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", background: "var(--red-glow)", color: "var(--red-primary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,77,109,0.3)" }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}>Painel Administrativo</h1>
              <p style={{ color: "var(--red-primary)", fontSize: "0.85rem", fontWeight: 600 }}>Acesso Restrito - PATRIMÔNIO+ Admin</p>
            </div>
          </div>
          <Link href="/dashboard" className="btn btn-secondary btn-sm" style={{ gap: "8px" }}>
            <ArrowLeft size={16} /> Voltar ao App
          </Link>
        </div>

        {/* Global Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {[
            { label: "Usuários Totais", value: "12.458", icon: Users, color: "var(--blue-primary)", bg: "var(--blue-glow)", trend: "+342 esta semana" },
            { label: "MRR (Receita)", value: "R$ 314.500", icon: DollarSign, color: "var(--green-primary)", bg: "var(--green-glow)", trend: "+12% vs. mês passado" },
            { label: "AUM (Patrimônio)", value: "R$ 890M", icon: TrendingUp, color: "var(--purple-primary)", bg: "rgba(139,92,246,0.15)", trend: "+R$45M este mês" },
            { label: "Sessões Ativas", value: "1.842", icon: Activity, color: "var(--orange-primary)", bg: "rgba(251,146,60,0.15)", trend: "Ao vivo" },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border-default)",
                borderRadius: "16px", padding: "24px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: m.bg, color: m.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <m.icon size={20} />
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                {m.label}
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                {m.value}
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: m.color }}>
                {m.trend}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Latest Users Table */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1.1rem" }}>Últimos Usuários Cadastrados</h3>
          </div>
          <table className="table-premium">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>Plano</th>
                <th>Data de Cadastro</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Lucas Mendes", email: "lucas.m@email.com", plan: "Premium", date: "Hoje, 14:32", status: "Ativo" },
                { name: "Carolina Silva", email: "carol.silva@email.com", plan: "Free", date: "Hoje, 11:15", status: "Ativo" },
                { name: "Roberto Alves", email: "beto.alves@email.com", plan: "Premium", date: "Ontem, 19:40", status: "Ativo" },
                { name: "Amanda Costa", email: "amanda.c@email.com", plan: "Free", date: "Ontem, 09:20", status: "Pendente" },
              ].map((user, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                  <td>
                    <span className="badge" style={{ 
                      background: user.plan === "Premium" ? "var(--green-glow)" : "rgba(255,255,255,0.05)",
                      color: user.plan === "Premium" ? "var(--green-primary)" : "var(--text-secondary)",
                      border: `1px solid ${user.plan === "Premium" ? "var(--green-primary)40" : "var(--border-default)"}`
                    }}>
                      {user.plan}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-tertiary)" }}>{user.date}</td>
                  <td>
                    <span style={{ 
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      fontSize: "0.8rem", color: user.status === "Ativo" ? "var(--green-primary)" : "var(--orange-primary)" 
                    }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
