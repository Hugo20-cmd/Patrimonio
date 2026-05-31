"use client";

import { useState } from "react";
import { PlayCircle, Lock, CheckCircle2, Crown, BrainCircuit, TrendingUp, ShieldAlert, Building2, Briefcase, Globe2, X, ChevronRight, ChevronLeft, PieChart, AlertOctagon, ShieldCheck } from "lucide-react";

const MODULE_1_SLIDES = [
  {
    title: "O Mindset Correto",
    content: "Muitas pessoas entram no mercado financeiro achando que é um cassino ou um esquema para ficar rico rápido. O verdadeiro investidor sabe que a bolsa de valores é um lugar para **se tornar sócio das melhores empresas do país**.\n\nInvestir não é sobre 'apostar', é sobre **plantar sementes com paciência hoje para colher uma floresta amanhã**.",
    icon: <BrainCircuit size={48} color="var(--blue-primary)" />
  },
  {
    title: "A Regra 50/30/20",
    content: "Como dividir o seu salário para nunca faltar dinheiro?\n\n• **50% Gastos Essenciais**: Aluguel, supermercado, contas básicas.\n• **30% Estilo de Vida**: Lazer, restaurantes, hobbies (você precisa viver!).\n• **20% O Seu Futuro**: O dinheiro sagrado que vai para seus investimentos todos os meses.\n\nA regra de ouro é: **Pague a si mesmo primeiro**.",
    icon: <PieChart size={48} color="var(--purple-primary)" />
  },
  {
    title: "O Veneno das Dívidas",
    content: "Nenhum investimento seguro do mundo rende mais do que os juros do cartão de crédito (que chegam a absurdos 400% ao ano no Brasil).\n\nSe você tem dívidas rotativas, **pare tudo**. O seu primeiro e melhor 'investimento' é quitar todas as suas dívidas ruins. Limpar o terreno é o primeiro passo para construir um castelo.",
    icon: <AlertOctagon size={48} color="#FF4B4B" />
  },
  {
    title: "O Colchão Financeiro",
    content: "Antes de comprar a primeira ação, você precisa da sua **Reserva de Emergência**.\n\nEla deve cobrir de **3 a 6 meses do seu custo de vida mensal**. Esse dinheiro não é para render muito, é para te dar paz! Deve ficar em um lugar seguro e que você possa sacar a qualquer momento (como o Tesouro Selic ou um CDB 100% CDI).\n\nÉ a verdadeira blindagem do seu patrimônio!",
    icon: <ShieldCheck size={48} color="var(--green-primary)" />
  }
];

const CURRICULUM = [
  {
    id: 1,
    title: "Módulo 1: A Fundação",
    desc: "Ajuste de mindset. Investir não é loteria, é plantio. Aprenda a eliminar dívidas ruins e a montar a sua Reserva de Emergência intocável.",
    icon: <ShieldAlert size={28} />,
    status: "in-progress", // Changed to in-progress so user can click
    lessons: ["Mentalidade do Investidor", "A Regra 50/30/20", "O Colchão Financeiro"],
    color: "var(--blue-primary)",
    slides: MODULE_1_SLIDES
  },
  {
    id: 2,
    title: "Módulo 2: O Motor da Riqueza",
    desc: "A mágica dos Juros Compostos. Entenda matematicamente por que o tempo e a constância vencem a genialidade e o timing de mercado.",
    icon: <TrendingUp size={28} />,
    status: "locked",
    lessons: ["A Matemática do Bola de Neve", "Por que o Tempo é Rei", "Roteiro do Primeiro Milhão"],
    color: "var(--text-tertiary)"
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
  const [progress, setProgress] = useState(0); 
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleModuleClick = (mod: any) => {
    if (mod.status === "locked") {
      alert("🔒 Este módulo está bloqueado. Conclua as aulas anteriores ou assine o plano PRO para liberar.");
    } else {
      setActiveModule(mod.id);
      setCurrentSlide(0);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
  };

  const closeSlides = () => {
    setActiveModule(null);
    document.body.style.overflow = "auto";
  };

  const activeModData = CURRICULUM.find(m => m.id === activeModule);
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
          {CURRICULUM.map((mod, index) => {
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
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
