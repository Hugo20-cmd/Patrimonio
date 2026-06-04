"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, Activity, TrendingUp, ShieldAlert, ArrowLeft, Check, X, Search, Link as LinkIcon, Award, Trash2 } from "lucide-react";
import Link from "next/link";
import { updateFeedbackStatus, searchReferralsByCode } from "@/app/actions/admin";
import { supabase } from "@/lib/supabase";

export default function AdminClient({ stats, latestUsers, feedbacks }: { stats: any, latestUsers: any[], feedbacks: any[] }) {
  const [localFeedbacks, setLocalFeedbacks] = useState(feedbacks);
  const [localUsers, setLocalUsers] = useState(latestUsers);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    setLocalUsers(latestUsers);
  }, [latestUsers]);

  const [searchCode, setSearchCode] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState("");

  const handleSearchReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    
    setSearchLoading(true);
    setSearchError("");
    setSearchResult(null);
    
    const res = await searchReferralsByCode(searchCode.trim());
    if (res.error) {
      setSearchError(res.error);
    } else {
      setSearchResult(res.data);
    }
    setSearchLoading(false);
  };

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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja APAGAR permanentemente a conta de "${userName}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingUserId(userId);
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        alert('Erro ao apagar: ' + data.error);
      }
    } catch (e) {
      alert('Erro de conexão ao apagar usuário.');
    } finally {
      setDeletingUserId(null);
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
                  {localUsers.map((user, i) => (
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
                      <td>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                          disabled={deletingUserId === user.id}
                          title="Apagar conta"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--red-primary)', opacity: deletingUserId === user.id ? 0.4 : 0.7,
                            padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = deletingUserId === user.id ? '0.4' : '0.7')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {localUsers.length === 0 && (
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

        {/* Busca de Afiliados (Referral) */}
        <div style={{ marginTop: "40px", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--blue-glow)", color: "var(--blue-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LinkIcon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem" }}>Rastreamento de Afiliados</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>Busque pelo código de indicação de um usuário para ver todos que se cadastraram com ele.</p>
            </div>
          </div>

          <form onSubmit={handleSearchReferral} style={{ display: "flex", gap: "12px", maxWidth: "500px", marginBottom: "24px" }}>
            <div className="input-group" style={{ flex: 1 }}>
              <Search size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Ex: JOSES123" 
                className="input-field" 
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={searchLoading}>
              {searchLoading ? "Buscando..." : "Buscar"}
            </button>
          </form>

          {searchError && (
            <div style={{ padding: "16px", background: "rgba(255,77,109,0.1)", color: "var(--red-primary)", borderRadius: "8px", border: "1px solid rgba(255,77,109,0.3)" }}>
              {searchError}
            </div>
          )}

          {searchResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "250px", padding: "20px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "8px" }}>Dono do Código</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>{searchResult.referrer.name}</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{searchResult.referrer.email}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "12px", background: "rgba(251,146,60,0.15)", color: "var(--orange-primary)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 700 }}>
                    <Award size={14} /> {searchResult.referrer.xp} XP
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: "250px", padding: "20px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--blue-primary)" }}>{searchResult.totalReferred}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Cadastros</div>
                  </div>
                  <div style={{ width: "1px", height: "40px", background: "var(--border-subtle)" }}></div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--green-primary)" }}>{searchResult.premiumReferred}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Premium</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "1rem", marginBottom: "12px" }}>Lista de Cadastrados com este link:</h4>
                <div style={{ overflowX: "auto", border: "1px solid var(--border-subtle)", borderRadius: "12px" }}>
                  <table className="table-premium" style={{ width: "100%", margin: 0 }}>
                    <thead style={{ background: "var(--bg-elevated)" }}>
                      <tr>
                        <th>Nome</th>
                        <th>E-mail</th>
                        <th>Data</th>
                        <th>Status Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResult.referrals.map((ref: any) => (
                        <tr key={ref.id}>
                          <td style={{ fontWeight: 600 }}>{ref.name}</td>
                          <td style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{ref.email}</td>
                          <td style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{new Date(ref.date).toLocaleDateString('pt-BR')}</td>
                          <td>
                            {ref.isPremium ? (
                              <span className="badge badge-green">Ativo (+1000 XP)</span>
                            ) : (
                              <span className="badge">Free</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {searchResult.referrals.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "var(--text-tertiary)" }}>Ninguém se cadastrou com esse código ainda.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
