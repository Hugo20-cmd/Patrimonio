"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, Activity, TrendingUp, ShieldAlert, ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { updateFeedbackStatus } from "@/app/actions/admin";
import { supabase } from "@/lib/supabase";

export default function AdminClient({ stats, latestUsers, feedbacks }: { stats: any, latestUsers: any[], feedbacks: any[] }) {
  const [localFeedbacks, setLocalFeedbacks] = useState(feedbacks);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    const channel = supabase.channel('online-users');
    
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      // presenceState returns an object with keys = user identifiers
      setOnlineUsers(Object.keys(state).length);
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const res = await updateFeedbackStatus(id, newStatus);
    if (res.success) {
      setLocalFeedbacks(localFeedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f));
    }
  };

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {[
            { label: "Usuários Totais", value: stats.totalUsers, icon: Users, color: "var(--blue-primary)", bg: "var(--blue-glow)", trend: "Cadastrados no sistema" },
            { label: "Usuários Online", value: onlineUsers, icon: Activity, color: "var(--green-primary)", bg: "var(--green-glow)", trend: "Tempo real (Dashboard)" },
            { label: "Novos (Hoje)", value: stats.newUsersToday, icon: TrendingUp, color: "var(--blue-primary)", bg: "var(--blue-glow)", trend: "Registros diários" },
            { label: "Assinantes Premium", value: stats.premiumUsers, icon: Activity, color: "var(--purple-primary)", bg: "rgba(139,92,246,0.15)", trend: "Usuários ativos pagos" },
            { label: "MRR", value: `R$ ${stats.MRR.toFixed(2)}`, icon: DollarSign, color: "var(--green-primary)", bg: "var(--green-glow)", trend: "Recorrência Mensal" },
            { label: "Feedbacks", value: localFeedbacks.filter(f => f.status === 'pendente').length, icon: TrendingUp, color: "var(--orange-primary)", bg: "rgba(251,146,60,0.15)", trend: "Pendentes" },
          ].map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border-default)",
                borderRadius: "16px", padding: "20px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: m.bg, color: m.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <m.icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                {m.label}
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
                {m.value}
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: m.color }}>
                {m.trend}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid-2">
          {/* Latest Users Table */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Últimos Usuários Cadastrados</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>E-mail</th>
                    <th>Plano</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {latestUsers.map((user, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{user.email}</td>
                      <td>
                        <span className="badge" style={{ 
                          background: user.plan === "Premium" ? "var(--green-glow)" : "rgba(255,255,255,0.05)",
                          color: user.plan === "Premium" ? "var(--green-primary)" : "var(--text-secondary)",
                          border: `1px solid ${user.plan === "Premium" ? "var(--green-primary)40" : "var(--border-default)"}`
                        }}>
                          {user.plan}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>{user.date}</td>
                    </tr>
                  ))}
                  {latestUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "24px", color: "var(--text-tertiary)" }}>Nenhum usuário encontrado</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feedbacks Management */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Gestão de Feedbacks</h3>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "500px" }}>
              {localFeedbacks.map((fb, i) => (
                <div key={i} style={{ padding: "16px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{fb.userName} <span style={{ color: "var(--text-tertiary)", fontWeight: 400, fontSize: "0.8rem" }}>({fb.userEmail})</span></div>
                      <div style={{ fontSize: "0.75rem", color: "var(--blue-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>{fb.type}</div>
                    </div>
                    <div className={fb.status === "pendente" ? "badge badge-blue" : fb.status === "resolvido" ? "badge badge-green" : "badge badge-red"}>
                      {fb.status}
                    </div>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
                    {fb.content}
                  </p>
                  {fb.status === 'pendente' && (
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button onClick={() => handleUpdateStatus(fb.id, 'recusado')} className="btn btn-secondary btn-sm" style={{ color: "var(--red-primary)", borderColor: "rgba(255,77,109,0.3)" }}>
                        <X size={14} /> Recusar
                      </button>
                      <button onClick={() => handleUpdateStatus(fb.id, 'resolvido')} className="btn btn-sm" style={{ background: "rgba(0,212,170,0.15)", color: "var(--green-primary)", border: "1px solid rgba(0,212,170,0.3)" }}>
                        <Check size={14} /> Resolvido
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {localFeedbacks.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "24px" }}>Nenhum feedback recebido.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
