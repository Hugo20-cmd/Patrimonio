"use client";

import { TrendingUp, Globe, MessageCircle, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  produto: [
    { label: "Funcionalidades", href: "#" },
    { label: "Preços", href: "#" },
    { label: "Ativos Suportados", href: "#" },
    { label: "Integraçíµes", href: "#" },
  ],
  empresa: [
    { label: "Sobre", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Contato", href: "#" },
  ],
  legal: [
    { label: "Termos de Uso", href: "#" },
    { label: "Privacidade", href: "#" },
    { label: "Segurança", href: "#" },
  ]
};

export default function Footer() {
  return (
    <footer style={{
      background: "var(--bg-primary)",
      borderTop: "1px solid var(--border-subtle)",
      padding: "80px 24px 40px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background Glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(circle, rgba(0,212,170,0.03) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "60px", marginBottom: "80px" }}>
          
          {/* Brand Col */}
          <div style={{ gridColumn: "1 / -1", maxWidth: "300px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "24px" }}>
              <div style={{
                width: "36px", height: "36px",
                background: "linear-gradient(135deg, #00d4aa 0%, #4f6ef7 100%)",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <TrendingUp size={20} color="#000" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)" }}>
                PATRIMíNIO<span style={{ color: "var(--green-primary)" }}>+</span>
              </span>
            </Link>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "32px" }}>
              A plataforma definitiva para organizar, acompanhar e multiplicar o seu patrimônio.
            </p>
            
            <div style={{ display: "flex", gap: "16px" }}>
              <a href="#" style={{ color: "var(--text-tertiary)", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"}>
                <Globe size={20} />
              </a>
              <a href="#" style={{ color: "var(--text-tertiary)", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"}>
                <MessageCircle size={20} />
              </a>
              <a href="#" style={{ color: "var(--text-tertiary)", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"}>
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Links Cols */}
          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Produto
            </h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {footerLinks.produto.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Empresa
            </h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {footerLinks.empresa.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Legal
            </h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px",
          paddingTop: "32px", borderTop: "1px solid var(--border-subtle)",
        }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
            Â© {new Date().getFullYear()} Patrimônio+ SA. Todos os direitos reservados.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-tertiary)", fontSize: "0.85rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green-primary)", boxShadow: "0 0 10px var(--green-primary)" }} />
              Sistemas Operacionais
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 768px) {
          footer .container > div:first-child {
            grid-template-columns: 2fr 1fr 1fr 1fr !important;
          }
          footer .container > div:first-child > div:first-child {
            grid-column: auto !important;
          }
        }
      `}</style>
    </footer>
  );
}
