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
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
          <Headphones size={32} className="text-green-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Central de Ajuda
        </h1>
        <p className="text-gray-400 text-lg max-w-lg">
          Como podemos te ajudar hoje? Tire suas dúvidas ou fale diretamente com a nossa equipe.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column - FAQ */}
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-gradient-to-b from-[#1c1c1f] to-[#141417] border border-[#2a2a2e] rounded-[24px] p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">Perguntas Frequentes</h2>
            
            <div className="flex flex-col gap-3">
              {FAQS.map((faq, index) => (
                <div 
                  key={index} 
                  className="bg-[#141417] border border-[#2a2a2e] hover:border-[#3a3a3e] rounded-2xl overflow-hidden transition-all duration-300"
                  style={{ 
                    background: openFaq === index ? 'rgba(0,212,170,0.03)' : '#141417',
                    borderColor: openFaq === index ? 'rgba(0,212,170,0.3)' : '#2a2a2e'
                  }}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex justify-between items-center p-5 text-left font-semibold text-gray-200 hover:text-white"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${openFaq === index ? 'bg-green-500/10' : 'bg-[#2a2a2e]'}`}>
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-green-400' : 'text-gray-400'}`} 
                      />
                    </div>
                  </button>
                  
                  <motion.div 
                    initial={false}
                    animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 text-gray-400 text-[0.95rem] leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-gradient-to-b from-[#1c1c1f] to-[#141417] border border-[#2a2a2e] rounded-[24px] p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-[#2a2a2e]/50">
              <div className="w-12 h-12 rounded-2xl bg-[#141417] border border-[#2a2a2e] flex items-center justify-center flex-shrink-0 shadow-inner">
                <Mail size={22} className="text-gray-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Fale com o Suporte</h2>
                <p className="text-[0.9rem] text-gray-400 leading-snug">Envie uma mensagem e retornaremos o mais rápido possível no seu e-mail.</p>
              </div>
            </div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-5"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500/10">
                  <CheckCircle2 size={40} className="text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Mensagem Enviada!</h3>
                  <p className="text-gray-400 text-[0.95rem] leading-relaxed">Recebemos o seu ticket. Nossa equipe irá responder no e-mail cadastrado em sua conta o mais breve possível.</p>
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-2 px-8 py-3 bg-[#2a2a2e] hover:bg-[#3a3a3e] border border-[#4a4a4e] text-white rounded-xl transition-colors text-[0.95rem] font-bold shadow-lg"
                >
                  Enviar nova mensagem
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {errorMsg && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-[0.95rem] font-bold text-gray-200">Como podemos ajudar?</label>
                  <textarea 
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva seu problema, dúvida ou sugestão com o máximo de detalhes..."
                    className="w-full min-h-[160px] p-5 bg-[#141417] border border-[#2a2a2e] rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 resize-y transition-all text-[0.95rem] leading-relaxed shadow-inner"
                    disabled={isSubmitting}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !message.trim()}
                  className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-black font-black py-4 px-6 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 active:translate-y-0 text-lg"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
