"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Headphones, Mail, Send, CheckCircle2, ChevronDown } from "lucide-react";
import { sendSupportTicket } from "@/app/actions/support";

const FAQS = [
  {
    question: "Como funciona a Comunidade VIP?",
    answer: "A Comunidade VIP é um espaço exclusivo para troca de experiências, onde você pode conversar nas salas temáticas (Geral, Ações, FIIs, etc) e tirar dúvidas com outros investidores e com o Administrador."
  },
  {
    question: "Como subo de Nível (XP)?",
    answer: "Você ganha XP participando da plataforma. Cada vez que você acessa, envia uma mensagem no Chat ou realiza uma ação, você ganha pontos que te fazem subir de nível."
  },
  {
    question: "Não encontrei o que procuro, o que fazer?",
    answer: "Utilize o formulário de suporte nesta página para enviar um e-mail diretamente para nossa equipe. Responderemos o mais rápido possível!"
  }
];

export default function SupportClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccess(false);

    const fd = new FormData();
    fd.append("message", message);

    const res = await sendSupportTicket(fd);

    setIsSubmitting(false);

    if (res.success) {
      setSuccess(true);
      setMessage("");
    } else {
      setErrorMsg(res.error || "Erro ao enviar a mensagem. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col gap-10 lg:gap-12 pb-24">
      
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "24px", background: "var(--green-glow)", border: "1px solid rgba(0, 212, 170, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", boxShadow: "0 0 30px rgba(0, 212, 170, 0.15)" }}>
          <Headphones size={32} style={{ color: "var(--green-primary)" }} />
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Central de Ajuda
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", lineHeight: 1.6 }}>
          Como podemos te ajudar hoje? Tire suas dúvidas ou fale diretamente com a nossa equipe.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", alignItems: "start" }}>
        
        {/* Left Column - FAQ */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "32px", boxShadow: "var(--shadow-sm)" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "24px", color: "var(--text-primary)" }}>Perguntas Frequentes</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {FAQS.map((faq, index) => (
                <div 
                  key={index} 
                  style={{ 
                    background: openFaq === index ? "var(--green-glow)" : "var(--bg-elevated)",
                    border: `1px solid ${openFaq === index ? "var(--border-accent)" : "var(--border-subtle)"}`,
                    borderRadius: "12px", 
                    overflow: "hidden", 
                    transition: "all 0.3s ease"
                  }}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", textAlign: "left", fontWeight: 600, color: openFaq === index ? "var(--text-primary)" : "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    <span style={{ paddingRight: "16px" }}>{faq.question}</span>
                    <div style={{ flexShrink: 0, width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: openFaq === index ? "var(--green-glow-strong)" : "var(--bg-card)", transition: "all 0.3s ease" }}>
                      <ChevronDown 
                        size={16} 
                        style={{ color: openFaq === index ? "var(--green-primary)" : "var(--text-tertiary)", transform: openFaq === index ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }} 
                      />
                    </div>
                  </button>
                  
                  <motion.div 
                    initial={false}
                    animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 20px 20px 20px", color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                      {faq.answer}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "32px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Mail size={22} style={{ color: "var(--text-secondary)" }} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.4rem", color: "var(--text-primary)", marginBottom: "4px" }}>Fale com o Suporte</h2>
                <p style={{ fontSize: "0.9rem", color: "var(--text-tertiary)", margin: 0, lineHeight: 1.4 }}>Envie uma mensagem e retornaremos o mais rápido possível no seu e-mail.</p>
              </div>
            </div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ background: "var(--green-glow)", border: "1px solid var(--border-accent)", borderRadius: "16px", padding: "32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}
              >
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--green-glow)", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid rgba(0, 212, 170, 0.1)" }}>
                  <CheckCircle2 size={40} style={{ color: "var(--green-primary)" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Mensagem Enviada!</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Recebemos o seu ticket. Nossa equipe irá responder no e-mail cadastrado em sua conta o mais breve possível.</p>
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="btn btn-secondary"
                  style={{ marginTop: "8px" }}
                >
                  Enviar nova mensagem
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {errorMsg && (
                  <div style={{ padding: "16px", background: "var(--red-glow)", border: "1px solid rgba(255, 77, 109, 0.3)", color: "var(--red-primary)", fontSize: "0.9rem", borderRadius: "12px", fontWeight: 500 }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="message" style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)" }}>Como podemos ajudar?</label>
                  <textarea 
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva seu problema, dúvida ou sugestão com o máximo de detalhes..."
                    style={{
                      width: "100%", minHeight: "160px", padding: "20px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "12px", color: "var(--text-primary)", outline: "none", resize: "vertical", fontSize: "0.95rem", lineHeight: 1.6
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--green-primary)"; e.target.style.boxShadow = "0 0 0 3px var(--green-glow)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border-default)"; e.target.style.boxShadow = "none"; }}
                    disabled={isSubmitting}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !message.trim()}
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "1.05rem", marginTop: "8px" }}
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      Enviar Mensagem
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
