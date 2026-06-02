"use client";

import { useState, useEffect } from "react";
import { PlayCircle, Lock, CheckCircle2, Crown, BrainCircuit, TrendingUp, ShieldAlert, Building2, Briefcase, Globe2, X, ChevronRight, ChevronLeft, PieChart, AlertOctagon, ShieldCheck } from "lucide-react";
import { getSubscriptionStatus } from "@/app/actions/subscription";

import { supabase } from "@/lib/supabase";

import { CURRICULUM } from "@/lib/data/curriculum";

export default function AcademiaPage() {
  const [progress, setProgress] = useState(0); 
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br'].includes(data.user?.email || '')) {
        setIsAdmin(true);
      }
    });
  }, []);

  const displayCurriculum = CURRICULUM.map(mod => ({
    ...mod,
    status: isAdmin ? "in-progress" : mod.status
  }));

  const handleModuleClick = (mod: any) => {
    if (mod.status === "locked") {
      setShowPaywall(true);
      document.body.style.overflow = "hidden"; // Prevent scroll
    } else {
      setActiveModule(mod.id);
      setCurrentSlide(0);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
  };

  const closePaywall = () => {
    setShowPaywall(false);
    document.body.style.overflow = "auto";
  };

  const closeSlides = () => {
    setActiveModule(null);
    document.body.style.overflow = "auto";
  };

  const activeModData = displayCurriculum.find(m => m.id === activeModule);
  const slides = activeModData?.slides || [];
  const isLastSlide = currentSlide === slides.length - 1;

  const nextSlide = () => {
    if (!isLastSlide) setCurrentSlide(curr => curr + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
  };

  const completeModule = () => {
    setProgress(18); // Simulation of gaining progress
    alert("🎉 Módulo Concluído com Sucesso! O Módulo 2 foi desbloqueado (simulação).");
    closeSlides();
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
          {displayCurriculum.map((mod, index) => {
            const isLocked = mod.status === "locked";
            // For MVP demo, if progress > 0 we mark mod 1 as completed visually
            const isCompleted = mod.id === 1 && progress > 0;
            const isInProgress = mod.status === "in-progress" && !isCompleted;

            return (
              <div 
                key={mod.id} 
                onClick={() => handleModuleClick(mod)}
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
                  {isInProgress && (
                    <div style={{ position: "absolute", top: "-12px", right: "32px", background: "var(--blue-primary)", color: "#fff", fontSize: "0.7rem", fontWeight: 800, padding: "4px 12px", borderRadius: "99px", letterSpacing: "1px" }}>
                      COMEÇAR
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

      {/* SLIDESHOW MODAL (OVERLAY) */}
      {activeModule && slides.length > 0 && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.3s ease"
        }}>
          <div style={{
            width: "90%", maxWidth: "600px", background: "var(--bg-card)",
            borderRadius: "24px", border: "1px solid var(--border-accent)",
            overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            maxHeight: "90vh"
          }}>
            
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border-default)" }}>
              <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                {slides.map((_, i) => (
                  <div key={i} style={{ 
                    height: "4px", flex: 1, borderRadius: "2px", 
                    background: i <= currentSlide ? "var(--blue-primary)" : "var(--border-default)",
                    transition: "background 0.3s"
                  }} />
                ))}
              </div>
              <button onClick={closeSlides} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", marginLeft: "16px" }}>
                <X size={24} />
              </button>
            </div>

            {/* Slide Content */}
            <div style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, overflowY: "auto" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "20px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                {slides[currentSlide].icon}
              </div>
              <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "24px", color: "var(--text-primary)" }}>
                {slides[currentSlide].title}
              </h2>
              {/* Splitting content by double newline to create paragraphs */}
              <div style={{ fontSize: "1.1rem", color: "var(--text-secondary)", lineHeight: 1.6, textAlign: "left", width: "100%" }}>
                {slides[currentSlide].content.split("\n\n").map((paragraph, i) => (
                  <p key={i} style={{ marginBottom: "16px" }} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }} />
                ))}
              </div>
            </div>

            {/* Modal Footer / Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "24px", borderTop: "1px solid var(--border-default)", background: "var(--bg-elevated)" }}>
              <button 
                onClick={prevSlide}
                disabled={currentSlide === 0}
                style={{ 
                  display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "12px",
                  background: "transparent", color: currentSlide === 0 ? "var(--text-tertiary)" : "var(--text-primary)",
                  border: "none", cursor: currentSlide === 0 ? "not-allowed" : "pointer", fontWeight: 700
                }}
              >
                <ChevronLeft size={20} /> Anterior
              </button>
              
              {!isLastSlide ? (
                <button 
                  onClick={nextSlide}
                  className="btn btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "12px" }}
                >
                  Próximo <ChevronRight size={20} />
                </button>
              ) : (
                <button 
                  onClick={completeModule}
                  style={{ 
                    display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "12px",
                    background: "var(--green-primary)", color: "#000", border: "none", cursor: "pointer", fontWeight: 800
                  }}
                >
                  <CheckCircle2 size={20} /> Concluir Módulo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAYWALL MODAL */}
      {showPaywall && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.3s ease", padding: "20px"
        }}>
          <div style={{
            width: "100%", maxWidth: "480px", background: "var(--bg-card)",
            borderRadius: "24px", border: "1px solid rgba(255,215,0,0.3)",
            overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)", position: "relative"
          }}>
            {/* Background Glow */}
            <div style={{ position: "absolute", top: "-50px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "200px", background: "rgba(255, 215, 0, 0.15)", filter: "blur(60px)", borderRadius: "50%", pointerEvents: "none" }} />

            {/* Header */}
            <div style={{ padding: "32px 32px 16px 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
              <button onClick={closePaywall} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.1)", border: "none", color: "var(--text-secondary)", cursor: "pointer", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>
              
              <div style={{ width: "64px", height: "64px", background: "rgba(255,215,0,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", border: "1px solid rgba(255,215,0,0.3)" }}>
                <Crown size={32} color="#FFD700" />
              </div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", marginBottom: "8px" }}>
                Desbloqueie o PRO
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                Você está a um passo de dominar a construção de riqueza e proteger o seu futuro.
              </p>
            </div>

            {/* Benefits */}
            <div style={{ padding: "0 32px 24px 32px", position: "relative", zIndex: 1 }}>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: "16px", border: "1px solid var(--border-subtle)" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <CheckCircle2 size={18} color="var(--green-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Acesso **Vitalício** a todos os Módulos.</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <CheckCircle2 size={18} color="var(--green-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Todas as atualizações futuras inclusas gratuitas.</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <CheckCircle2 size={18} color="var(--green-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>Direto ao ponto, sem enrolação.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pricing Action */}
            <div style={{ background: "linear-gradient(to right, rgba(255,215,0,0.05), rgba(255,215,0,0.1))", padding: "32px", borderTop: "1px solid rgba(255,215,0,0.2)", textAlign: "center" }}>
              <div style={{ marginBottom: "16px" }}>
                <span style={{ display: "block", color: "var(--text-tertiary)", fontSize: "0.85rem", textDecoration: "line-through", marginBottom: "4px" }}>De R$ 197,00</span>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px" }}>
                  <span style={{ fontSize: "1.2rem", color: "#FFD700", fontWeight: 700 }}>R$</span>
                  <span style={{ fontSize: "3.5rem", color: "#FFD700", fontWeight: 900, lineHeight: 1 }}>29</span>
                  <span style={{ fontSize: "1.5rem", color: "#FFD700", fontWeight: 700 }}>,90</span>
                </div>
                <span style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: "99px", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, marginTop: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Pagamento Único
                </span>
              </div>
              
              <button 
                onClick={() => { window.location.href = "https://buy.stripe.com/9B64gz602gLR4Vz8gicwg01"; }}
                style={{ 
                  width: "100%", background: "linear-gradient(90deg, #D4AF37, #FFD700)", color: "#000", 
                  border: "none", padding: "16px", borderRadius: "16px", fontSize: "1.1rem", fontWeight: 900, 
                  cursor: "pointer", boxShadow: "0 10px 20px rgba(255,215,0,0.3)",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Desbloquear Acesso Agora
              </button>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "16px" }}>
                Sem mensalidades. Sem pegadinhas. Acesso para sempre.
              </p>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
