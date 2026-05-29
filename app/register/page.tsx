"use client";
import { supabase } from '@/lib/supabase'
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Check, User } from "lucide-react";
import { signup } from "@/app/actions/auth";

function RegisterForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<"free" | "premium">(planParam === "premium" ? "premium" : "free");

  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);
    
    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: "100%", maxWidth: "420px" }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Crie sua conta</h1>
        <p style={{ fontSize: "0.9rem" }}>
          Já tem uma conta?{" "}
          <Link href="/login" style={{ color: "var(--green-primary)", fontWeight: 600, textDecoration: "none" }}>
            Entrar agora
          </Link>
        </p>
      </div>

      {/* Plan selection */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <div
          onClick={() => setPlan("free")}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "12px",
            border: `1px solid ${plan === "free" ? "var(--green-primary)" : "var(--border-default)"}`,
            background: plan === "free" ? "var(--green-glow)" : "var(--bg-card)",
            cursor: "pointer",
            transition: "all 0.2s",
            position: "relative",
          }}
        >
          {plan === "free" && (
            <div style={{ position: "absolute", top: "14px", right: "14px", color: "var(--green-primary)" }}>
              <Check size={16} strokeWidth={3} />
            </div>
          )}
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: plan === "free" ? "var(--green-primary)" : "var(--text-secondary)", marginBottom: "4px" }}>Gratuito</div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>R$ 0</div>
        </div>

        <div
          onClick={() => setPlan("premium")}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "12px",
            border: `1px solid ${plan === "premium" ? "var(--green-primary)" : "var(--border-default)"}`,
            background: plan === "premium" ? "var(--green-glow)" : "var(--bg-card)",
            cursor: "pointer",
            transition: "all 0.2s",
            position: "relative",
          }}
        >
          {plan === "premium" && (
            <div style={{ position: "absolute", top: "14px", right: "14px", color: "var(--green-primary)" }}>
              <Check size={16} strokeWidth={3} />
            </div>
          )}
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: plan === "premium" ? "var(--green-primary)" : "var(--text-secondary)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            Premium <Zap size={12} fill="currentColor" />
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>R$ 29<span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>/mês</span></div>
        </div>
      </div>

      {/* Google OAuth button */}
      <button
        style={{
          width: "100%", padding: "12px 20px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "12px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          cursor: "pointer", marginBottom: "20px",
          color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600,
          transition: "all 0.2s",
          fontFamily: "var(--font-sans)",
        }}
        onClick={handleGoogleLogin}
        disabled={loading}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
          (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
          (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        Inscrever-se com Google
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div className="divider" style={{ flex: 1, margin: 0 }} />
        <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>ou use seu e-mail</span>
        <div className="divider" style={{ flex: 1, margin: 0 }} />
      </div>

      {errorMsg && (
        <div style={{ background: "rgba(255,0,0,0.1)", color: "var(--red-primary)", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85rem", border: "1px solid rgba(255,0,0,0.2)" }}>
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Name */}
        <div>
          <label htmlFor="name">Nome completo</label>
          <div style={{ position: "relative" }}>
            <User size={16} style={{
              position: "absolute", left: "14px", top: "50%",
              transform: "translateY(-50%)", color: "var(--text-tertiary)",
            }} />
            <input
              name="name"
              id="name"
              type="text"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ paddingLeft: "40px" }}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email">E-mail</label>
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{
              position: "absolute", left: "14px", top: "50%",
              transform: "translateY(-50%)", color: "var(--text-tertiary)",
            }} />
            <input
              name="email"
              id="email"
              type="email"
              placeholder="seu@email.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ paddingLeft: "40px" }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password">Senha</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{
              position: "absolute", left: "14px", top: "50%",
              transform: "translateY(-50%)", color: "var(--text-tertiary)",
            }} />
            <input
              name="password"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{ paddingLeft: "40px", paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-tertiary)", padding: "4px",
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{
            width: "100%", justifyContent: "center",
            marginTop: "10px", gap: "8px",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? (
            <>
              <div className="animate-spin" style={{ width: "16px", height: "16px", border: "2px solid rgba(0,0,0,0.3)", borderTopColor: "#000", borderRadius: "50%" }} />
              Criando conta...
            </>
          ) : (
            <>
              Criar conta grátis
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.78rem", color: "var(--text-tertiary)", lineHeight: 1.6 }}>
        Ao se registrar, você concorda com nossos{" "}
        <a href="#" style={{ color: "var(--text-secondary)" }}>Termos de Uso</a> e{" "}
        <a href="#" style={{ color: "var(--text-secondary)" }}>Política de Privacidade</a>.
      </p>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glows */}
      <div style={{
        position: "fixed", top: "-100px", right: "-100px",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-100px", left: "-100px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(79,110,247,0.07) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Right panel — form */}
      <div style={{
        flex: 1, maxWidth: "560px",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 48px",
        position: "relative", zIndex: 1,
      }} className="auth-right-panel">
        <Suspense fallback={<div className="skeleton" style={{ width: "100%", height: "500px", borderRadius: "12px" }} />}>
          <RegisterForm />
        </Suspense>
      </div>

      {/* Left panel — illustration (hidden on mobile) */}
      <div style={{
        flex: 1,
        background: "var(--bg-secondary)",
        borderLeft: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
        position: "relative",
        overflow: "hidden",
      }} className="auth-left-panel">
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: "380px" }}>
          {/* Logo */}
          <div style={{ marginBottom: "48px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{
                width: "40px", height: "40px",
                background: "linear-gradient(135deg, #00d4aa 0%, #4f6ef7 100%)",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 20px rgba(0,212,170,0.3)",
              }}>
                <TrendingUp size={22} color="#000" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text-primary)" }}>
                PATRIMÔNIO<span style={{ color: "var(--green-primary)" }}>+</span>
              </span>
            </Link>
          </div>

          <h2 style={{ marginBottom: "16px", fontSize: "2rem" }}>
            O primeiro passo para sua{" "}
            <span className="gradient-text">liberdade.</span>
          </h2>
          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "32px" }}>
            Junte-se a milhares de investidores que organizam e evoluem seu patrimônio todos os dias.
          </p>

          {/* Testimonial */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "16px",
            padding: "24px",
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: "-12px", left: "24px", fontSize: "2rem", color: "var(--green-primary)", opacity: 0.5, lineHeight: 1 }}>"</div>
            <p style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--text-primary)", marginBottom: "16px", position: "relative", zIndex: 1 }}>
              Desde que comecei a usar o Patrimônio+, minha visão sobre investimentos mudou completamente. Ver os dividendos caindo e o gráfico de evolução patrimonial crescendo me deu a disciplina que faltava.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--blue-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700 }}>
                MR
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>Marcos Ribeiro</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Investidor Premium há 2 anos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .auth-left-panel { display: none !important; }
          .auth-right-panel {
            max-width: 100% !important;
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
