import { Lock, Zap, ArrowRight, ShieldCheck, Newspaper, MessageSquare } from "lucide-react";
import Link from "next/link";

interface PremiumPaywallProps {
  title: string;
  description: string;
  featureName: string;
}

export default function PremiumPaywall({ title, description, featureName }: PremiumPaywallProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "70vh", textAlign: "center", padding: "24px"
    }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-accent)",
        borderRadius: "24px",
        padding: "40px",
        maxWidth: "600px",
        width: "100%",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: "-100px", right: "-100px",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{
          width: "80px", height: "80px", borderRadius: "20px",
          background: "var(--gradient-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px auto",
          boxShadow: "0 10px 30px rgba(0,212,170,0.3)"
        }}>
          <Lock size={32} color="#fff" />
        </div>

        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "16px", color: "var(--text-primary)" }}>
          {title}
        </h2>
        
        <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "32px" }}>
          {description}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px", textAlign: "left", background: "var(--bg-elevated)", padding: "20px", borderRadius: "16px" }}>
          <h4 style={{ fontSize: "0.9rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Benefícios do Premium</h4>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem" }}>
            <Newspaper size={18} color="var(--blue-primary)" /> Informações em tempo real do mercado
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem" }}>
            <MessageSquare size={18} color="var(--purple-primary)" /> Acesso exclusivo ao Fórum da Comunidade
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem" }}>
            <ShieldCheck size={18} color="var(--green-primary)" /> Filtros Anti-Spam de Alta Segurança
          </div>
        </div>

        {/* Link Stripe do Cliente */}
        <a 
          href="https://buy.stripe.com/14A6oH0FIantgEh0NQcwg00" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ width: "100%", padding: "16px", fontSize: "1.1rem", display: "flex", justifyContent: "center", gap: "8px" }}
        >
          <Zap size={20} /> Desbloquear {featureName} por R$ 19,99
        </a>
      </div>
    </div>
  );
}
