"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Link as LinkIcon, DollarSign, ArrowRight, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";

export default function AffiliatesClient({ initialData, error }: { initialData?: any, error?: string }) {
  const [copied, setCopied] = useState(false);

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--red-primary)" }}>
        <h2>Erro ao carregar dados de afiliado</h2>
        <p>{error}</p>
        <p style={{ marginTop: "20px", fontSize: "0.9rem", color: "var(--text-tertiary)" }}>
          Certifique-se de que rodou o SQL para adicionar as colunas `referral_code` e `referred_by` na tabela profiles.
        </p>
      </div>
    );
  }

  const { referralCode, totalReferred, premiumReferred, monthlyCommission, referrals } = initialData;
  const referralUrl = `https://patrimoniomais.com.br/register?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Programa de Afiliados</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Indique amigos, ganhe comissões e ajude nossa comunidade a crescer.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => window.open('https://wa.me/?text=' + encodeURIComponent(`Estou usando o Patrimônio+ para organizar meus investimentos. Cadastre-se com meu link e ganhe benefícios: ${referralUrl}`), '_blank')} style={{ gap: "8px" }}>
          Compartilhar no WhatsApp
        </button>
      </div>

      {/* Referral Link Box */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(79,110,247,0.05) 100%)",
        border: "1px solid var(--green-primary)",
        borderRadius: "16px",
        padding: "24px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "20px"
      }}>
        <div>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--green-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Seu Link Exclusivo</div>
          <div style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 500, fontFamily: "monospace" }}>
            {referralUrl}
          </div>
        </div>
        <button onClick={copyToClipboard} className={copied ? "btn btn-primary" : "btn btn-secondary"} style={{ minWidth: "140px", justifyContent: "center", gap: "8px" }}>
          {copied ? <><Check size={16} /> Copiado!</> : <><Copy size={16} /> Copiar Link</>}
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "var(--blue-glow)", color: "var(--blue-primary)" }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Total de Cadastros</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>{totalReferred}</div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "var(--green-glow)", color: "var(--green-primary)" }}>
              <CheckCircle2 size={18} />
            </div>
            <div className="badge badge-green">Conversões</div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Assinantes Premium</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>{premiumReferred}</div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(251,146,60,0.15)", color: "var(--orange-primary)" }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Renda Mensal Estimada</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--orange-primary)" }}>{formatCurrency(monthlyCommission)}</div>
        </div>
      </div>

      {/* Rules / Info */}
      <div style={{ display: "flex", gap: "12px", background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "16px 20px" }}>
        <AlertCircle size={20} color="var(--text-tertiary)" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <strong>Como funciona:</strong> Compartilhe o seu link exclusivo (acima). Quando um amigo se cadastrar e efetuar a assinatura do plano Premium, duas coisas acontecem assim que o pagamento for confirmado: 
          <br /><br />
          1. Você ganha <strong>1.000 XP</strong> por amigo! (Os pontos de XP subirão seu nível no app e poderão ser trocados por prêmios, benefícios e acessos exclusivos no futuro).
          <br />
          2. Você recebe <strong>30% de comissão recorrente</strong> de todas as mensalidades dele enquanto a assinatura estiver ativa. Ganhos acima de R$ 50 já podem ser sacados.
        </div>
      </div>

      {/* Referrals List */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "16px",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        flex: 1,
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem" }}>Seus Indicados</h3>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto" }}>
          <table className="table-premium" style={{ minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: "24px" }}>Data do Cadastro</th>
                <th>Nome (Oculto)</th>
                <th>Status</th>
                <th style={{ textAlign: "right", paddingRight: "24px" }}>Comissão Gerada</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
                    Você ainda não indicou ninguém. Copie seu link e comece a compartilhar!
                  </td>
                </tr>
              ) : referrals.map((ref: any) => (
                <tr key={ref.id}>
                  <td style={{ paddingLeft: "24px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {new Date(ref.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{ref.name}</div>
                  </td>
                  <td>
                    {ref.plan === 'premium' ? (
                      <div className="badge badge-green" style={{ display: "inline-flex" }}>{ref.status}</div>
                    ) : (
                      <div className="badge" style={{ display: "inline-flex" }}>{ref.status}</div>
                    )}
                  </td>
                  <td style={{ textAlign: "right", paddingRight: "24px" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700, color: ref.plan === 'premium' ? "var(--green-primary)" : "var(--text-tertiary)" }}>
                      {ref.plan === 'premium' ? formatCurrency(6.00) + "/mês" : "-"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
