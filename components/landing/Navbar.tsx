"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Menu, X, Zap } from "lucide-react";

const navLinks = [
  { label: "Funcionalidades", href: "#features" },
  { label: "Patrimônio", href: "#patrimonio" },
  { label: "Planos", href: "#planos" },
  { label: "Comunidade", href: "#comunidade" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: "all 0.3s ease",
          background: scrolled
            ? "rgba(8,8,16,0.85)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid transparent",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{
              width: "36px", height: "36px",
              background: "linear-gradient(135deg, #00d4aa 0%, #4f6ef7 100%)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(0,212,170,0.3)",
            }}>
              <TrendingUp size={20} color="#000" strokeWidth={2.5} />
            </div>
            <span style={{
              fontWeight: 800,
              fontSize: "1.15rem",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}>
              PATRIMÔNIO<span style={{ color: "var(--green-primary)" }}>+</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "4px" }} className="desktop-nav">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "var(--text-primary)";
                  (e.target as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "var(--text-secondary)";
                  (e.target as HTMLElement).style.background = "transparent";
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }} className="desktop-nav">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Entrar
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm" style={{ gap: "6px" }}>
              <Zap size={14} />
              Começar grátis
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="mobile-nav"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              width: "40px", height: "40px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-primary)",
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: "72px",
              left: 0, right: 0,
              background: "rgba(8,8,16,0.98)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid var(--border-default)",
              zIndex: 999,
              padding: "20px 24px 28px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    color: "var(--text-secondary)",
                    fontSize: "1rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/login" className="btn btn-secondary" onClick={() => setMobileOpen(false)}>
                  Entrar na conta
                </Link>
                <Link href="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
                  <Zap size={16} /> Criar conta grátis
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-slogan { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
