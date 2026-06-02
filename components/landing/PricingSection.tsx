"use client";

import { motion } from "framer-motion";
import { Check, Zap, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "free",
    name: "Gratuito",
    price: "R$ 0",
    period: "para sempre",
    description: "Para quem está começando a investir",
    color: "var(--text-secondary)",
    borderColor: "var(--border-default)",
    features: [
      "Até 5 ativos na carteira",
      "Gráficos básicos de patrimônio",
      "Registro de dividendos",
      "2 metas financeiras",
      "Dashboard básico",
      "Suporte via e-mail",
    ],
    cta: "Começar grátis",
    ctaHref: "/register",
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "R$ 19,99",
    period: "por mês",
    description: "Para investidores sérios sobre o futuro",
    color: "var(--green-primary)",
    borderColor: "var(--green-primary)",
    features: [
      "Ativos ilimitados na carteira",
      "Gráficos avançados e animados",
      "Dividendos automáticos",
      "Metas financeiras ilimitadas",
      "Múltiplas carteiras",
      "IA financeira (em breve)",
      "Relatórios PDF exportáveis",
      "Projeção de liberdade financeira",
      "Badges e gamificação completa",
      "Suporte via e-mail",
    ],
    cta: "Assinar Premium",
    ctaHref: "https://buy.stripe.com/14A6oH0FIantgEh0NQcwg00",
    popular: true,
  },
];

const communityStats = [
  { value: "+12.400", label: "Investidores ativos" },
  { value: "R$ 890M+", label: "Patrimônio gerenciado" },
  { value: "98,4%", label: "Satisfação dos usuários" },
  { value: "+R$2,1M", label: "Dividendos registrados" },
];

export default function PricingSection() {
  return (
    <>
      {/* COMMUNITY SECTION */}
      <section id="comunidade" className="section" style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px", height: "300px",
          background: "radial-gradient(ellipse, rgba(0,212,170,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="badge badge-green" style={{ marginBottom: "24px", display: "inline-flex" }}>
              <Star size={12} />
              Nossa Comunidade
            </div>

            <h2 style={{ marginBottom: "20px", maxWidth: "700px", margin: "0 auto 20px" }}>
              Construindo{" "}
              <span className="gradient-text">liberdade financeira</span>{" "}
              com disciplina
            </h2>

            <p style={{ fontSize: "1.1rem", maxWidth: "640px", margin: "0 auto 48px", lineHeight: 1.8 }}>
              Patrimônio não se constrói com sorte — se constrói com{" "}
              <strong style={{ color: "var(--text-primary)" }}>constância</strong>,{" "}
              <strong style={{ color: "var(--text-primary)" }}>inteligência</strong> e as{" "}
              <strong style={{ color: "var(--green-primary)" }}>ferramentas certas</strong>.
              Cada real investido hoje é um passo em direção à sua independência financeira.
            </p>

            {/* Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "24px",
              maxWidth: "900px",
              margin: "0 auto",
            }} className="community-stats">
              {communityStats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "16px",
                    padding: "24px 20px",
                  }}
                >
                  <div style={{
                    fontSize: "1.7rem", fontWeight: 800,
                    color: "var(--green-primary)",
                    marginBottom: "6px",
                    letterSpacing: "-0.02em",
                  }}>{s.value}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--text-tertiary)", fontWeight: 500 }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <style jsx global>{`
          @media (max-width: 768px) {
            .community-stats { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
      </section>

      {/* PRICING SECTION */}
      <section id="planos" className="section" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-50px", right: "-100px",
          width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: "64px" }}
          >
            <div className="badge badge-green" style={{ marginBottom: "20px", display: "inline-flex" }}>
              <Zap size={12} />
              Planos
            </div>
            <h2 style={{ marginBottom: "16px" }}>
              Simples e{" "}
              <span className="gradient-text">transparente</span>
            </h2>
            <p style={{ fontSize: "1.05rem" }}>
              Sem surpresas. Cancele quando quiser.
            </p>
          </motion.div>

          {/* Plans */}
          <div style={{
            display: "flex",
            gap: "24px",
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: "900px",
            margin: "0 auto",
          }}>
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  flex: "1",
                  minWidth: "300px",
                  maxWidth: "400px",
                  background: plan.popular
                    ? "linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(0,212,170,0.02) 100%)"
                    : "var(--bg-card)",
                  border: `1px solid ${plan.popular ? plan.borderColor + "60" : plan.borderColor}`,
                  borderRadius: "20px",
                  padding: "36px 32px",
                  position: "relative",
                  boxShadow: plan.popular ? "var(--shadow-green-lg)" : "var(--shadow-card)",
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div style={{
                    position: "absolute",
                    top: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--gradient-green)",
                    color: "#000",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 16px",
                    borderRadius: "999px",
                    whiteSpace: "nowrap",
                  }}>
                    ⭐ MAIS POPULAR
                  </div>
                )}

                {/* Plan name */}
                <div style={{ marginBottom: "4px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: plan.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {plan.name}
                  </span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ fontSize: "2.8rem", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.04em" }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-tertiary)", marginLeft: "6px" }}>/{plan.period}</span>
                </div>

                <p style={{ fontSize: "0.875rem", marginBottom: "28px", color: "var(--text-secondary)" }}>
                  {plan.description}
                </p>

                <div className="divider" />

                {/* Features */}
                <ul style={{ listStyle: "none", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      <div style={{
                        width: "18px", height: "18px", borderRadius: "50%",
                        background: plan.popular ? "var(--green-glow)" : "rgba(255,255,255,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: "1px",
                      }}>
                        <Check size={10} color={plan.popular ? "var(--green-primary)" : "var(--text-tertiary)"} strokeWidth={3} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  className={plan.popular ? "btn btn-primary" : "btn btn-secondary"}
                  style={{ width: "100%", justifyContent: "center", gap: "8px" }}
                >
                  {plan.popular && <Zap size={16} />}
                  {plan.cta}
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Bottom note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            style={{ textAlign: "center", marginTop: "32px", fontSize: "0.82rem", color: "var(--text-tertiary)" }}
          >
            ✓ Sem cartão de crédito para começar &nbsp;·&nbsp; ✓ Cancele a qualquer momento &nbsp;·&nbsp; ✓ Integração Stripe segura
          </motion.p>
        </div>
      </section>
    </>
  );
}
