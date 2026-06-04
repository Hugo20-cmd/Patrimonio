export const dynamic = 'force-dynamic';
import { getAffiliateData } from "@/app/actions/affiliates";
import { getSubscriptionStatus } from "@/app/actions/subscription";
import AffiliatesClient from "./affiliates-client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, Lock } from "lucide-react";

export default async function AffiliatesPage() {
  const result = await getAffiliateData();
  const sub = await getSubscriptionStatus();
  
  if (result.error === "Not authenticated") {
    redirect("/login");
  }

  // Se for free, bloqueia a página com um paywall
  if (sub.status !== "premium") {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "20px",
          padding: "48px 32px",
          maxWidth: "480px",
          textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "24px"
        }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,140,0,0.1) 100%)",
            color: "#FFD700",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 30px rgba(255,215,0,0.2)"
          }}>
            <Lock size={36} strokeWidth={2} />
          </div>
          
          <div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "12px", color: "var(--text-primary)" }}>Exclusivo para Premium</h2>
            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Apenas assinantes Premium têm acesso ao <strong>Programa de Afiliados</strong> para gerar renda passiva indicando amigos e expandindo a comunidade Patrimônio+.
            </p>
          </div>

          <Link 
            href="https://buy.stripe.com/14A6oH0FIantgEh0NQcwg00"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "1rem", gap: "10px", marginTop: "8px" }}
          >
            <Award size={20} /> Assinar Premium Agora
          </Link>
        </div>
      </div>
    );
  }

  return <AffiliatesClient initialData={result.data} error={result.error} />;
}
