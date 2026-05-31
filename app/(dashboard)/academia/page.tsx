"use client";

import { useState } from "react";
import { PlayCircle, Lock, CheckCircle2, Crown, BrainCircuit, TrendingUp, ShieldAlert, Building2, Briefcase, Globe2 } from "lucide-react";

const CURRICULUM = [
  {
    id: 1,
    title: "Módulo 1: A Fundação",
    desc: "Ajuste de mindset. Investir não é loteria, é plantio. Aprenda a eliminar dívidas ruins e a montar a sua Reserva de Emergência intocável.",
    icon: <ShieldAlert size={28} />,
    status: "completed",
    lessons: ["Mentalidade do Investidor", "A Regra 50/30/20", "Montando o Colchão Financeiro"],
    color: "var(--green-primary)"
  },
  {
    id: 2,
    title: "Módulo 2: O Motor da Riqueza",
    desc: "A mágica dos Juros Compostos. Entenda matematicamente por que o tempo e a constância vencem a genialidade e o timing de mercado.",
    icon: <TrendingUp size={28} />,
    status: "in-progress",
    lessons: ["A Matemática do Bola de Neve", "Por que o Tempo é Rei", "Roteiro do Primeiro Milhão"],
    color: "var(--blue-primary)"
  },
  {
    id: 3,
    title: "Módulo 3: O Escudo de Ouro",
    desc: "Renda Fixa na prática. Aprenda onde deixar seu dinheiro dormindo com total segurança, protegendo seu poder de compra da inflação.",
    icon: <BrainCircuit size={28} />,
    status: "locked",
    lessons: ["Selic e IPCA Descomplicados", "Tesouro Direto Sem Medo", "CDBs e Liquidez Diária"],
    color: "var(--text-tertiary)"
  },
  {
    id: 4,
    title: "Módulo 4: A Fábrica de Aluguéis",
    desc: "O mundo dos Fundos Imobiliários (FIIs). Receba 'dinheiro limpo' na sua conta todos os meses e construa sua aposentadoria passiva.",
    icon: <Building2 size={28} />,
    status: "locked",
    lessons: ["O Que é um FII?", "Como Avaliar P/VP e DY", "O Efeito Neve do Reinvestimento"],
    color: "var(--text-tertiary)"
  },
  {
    id: 5,
    title: "Módulo 5: Cabeça de Dono",
    desc: "Invista em Ações da forma correta. Você não compra papéis piscando na tela, você se torna sócio das empresas mais lucrativas do país.",
    icon: <Briefcase size={28} />,
    status: "locked",
    lessons: ["A Diferença de Preço e Valor", "Foco no Longo Prazo", "Ignorando o Pânico do Mercado"],
    color: "var(--text-tertiary)"
  },
  {
    id: 6,
    title: "Módulo 6: A Fronteira Global",
    desc: "Proteção internacional contra o Risco Brasil e como participar do futuro com Cripto e o gigantesco mercado americano.",
    icon: <Globe2 size={28} />,
    status: "locked",
    lessons: ["Por que ter Dólar?", "ETFs (IVVB11) e REITs", "Bitcoin: A Reserva Inconfiscável"],
    color: "var(--text-tertiary)"
  }
];

export default function AcademiaPage() {
  const progress = 18; // 18% concluded

  const handleModuleClick = (status: string) => {
    if (status === "locked") {
      alert("🔒 Este módulo está bloqueado. Conclua as aulas anteriores ou assine o plano PRO para liberar.");
    } else {
      alert("A aula completa de teste seria aberta em um modal aqui!");
    }
  };

  return (
    <div style={{ paddingBottom: "100px", maxWidth: "900px", margin: "0 auto" }}>
      
      {/* HEADER BANNER */}
      <div style={{ 
        background: "linear-gradient(135deg, #1A1A24 0%, #111116 100%)", 
        border: "1px solid rgba(255, 215, 0, 0.3)", 
        borderRadius: "24px", 
        padding: "40px", 
        marginBottom: "48px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative Glow */}
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "rgba(255, 215, 0, 0.15)", filter: "blur(60px)", borderRadius: "50%" }} />
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
          <Crown size={28} color="#FFD700" />
          <h1 style={{ fontSize: "2.4rem", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-1px" }}>Academia <span style={{ color: "#FFD700" }}>PRO</span></h1>
        </div>
        
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", lineHeight: 1.6, marginBottom: "32px" }}>
          Sua jornada definitiva do zero ao investidor avançado. O plano de estudos perfeito para você dominar as regras do jogo, proteger seu dinheiro e construir um patrimônio inabalável a longo prazo.
        </p>

        {/* Global Progress Bar */}
        <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Seu Progresso na Trilha</span>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFD700" }}>{progress}%</span>
          </div>
          <div style={{ width: "100%", height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #D4AF37, #FFD700)", borderRadius: "99px", transition: "width 1s ease-in-out" }} />
          </div>
        </div>
      </div>

      {/* ROADMAP TIMELINE */}
      <div style={{ position: "relative", paddingLeft: "32px" }}>
        
        {/* Vertical Line */}
        <div style={{ position: "absolute", top: "20px", bottom: "20px", left: "54px", width: "3px", background: "var(--border-subtle)", borderRadius: "10px", zIndex: 0 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "40px", position: "relative", zIndex: 1 }}>
          {CURRICULUM.map((mod, index) => {
            const isLocked = mod.status === "locked";
            const isCompleted = mod.status === "completed";
            const isInProgress = mod.status === "in-progress";

            return (
              <div 
                key={mod.id} 
                onClick={() => handleModuleClick(mod.status)}
                style={{ 
                  display: "flex", 
                  gap: "32px", 
                  alignItems: "flex-start",
                  opacity: isLocked ? 0.6 : 1,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  transition: "transform 0.2s, opacity 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isLocked) e.currentTarget.style.transform = "translateX(8px)";
                }}
                onMouseLeave={(e) => {
                  if (!isLocked) e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                {/* Node Icon */}
                <div style={{ 
                  width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
                  background: isCompleted ? "var(--green-primary)" : isInProgress ? "var(--bg-elevated)" : "var(--bg-card)",
                  border: `3px solid ${isCompleted ? "var(--green-primary)" : isInProgress ? "var(--blue-primary)" : "var(--border-default)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isCompleted ? "#000" : mod.color,
                  boxShadow: isInProgress ? "0 0 20px rgba(79, 110, 247, 0.4)" : "none",
                  zIndex: 2
                }}>
                  {isCompleted ? <CheckCircle2 size={24} /> : isLocked ? <Lock size={20} /> : mod.icon}
                </div>

                {/* Module Card */}
                <div style={{ 
                  flex: 1, 
                  background: "var(--bg-card)", 
                  border: `1px solid ${isInProgress ? "var(--blue-primary)" : "var(--border-default)"}`, 
                  borderRadius: "20px", 
                  padding: "32px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  position: "relative"
                }}>
                  {/* Status Badge */}
                  {isInProgress && (
                    <div style={{ position: "absolute", top: "-12px", right: "32px", background: "var(--blue-primary)", color: "#fff", fontSize: "0.7rem", fontWeight: 800, padding: "4px 12px", borderRadius: "99px", letterSpacing: "1px" }}>
                      CONTINUAR
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: isLocked ? "var(--text-tertiary)" : "var(--text-primary)" }}>{mod.title}</h2>
                    {!isLocked && <PlayCircle size={32} color={isCompleted ? "var(--green-primary)" : "var(--blue-primary)"} style={{ opacity: 0.8 }} />}
                  </div>
                  
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "24px" }}>
                    {mod.desc}
                  </p>

                  {/* Lessons List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Aulas do Módulo</span>
                    {mod.lessons.map((lesson, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: isCompleted ? "rgba(0,212,170,0.1)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: isCompleted ? "var(--green-primary)" : "var(--text-tertiary)" }}>{idx + 1}</span>
                        </div>
                        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: isLocked ? "var(--text-tertiary)" : "var(--text-secondary)" }}>{lesson}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
