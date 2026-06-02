"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Headphones, Mail, Send, CheckCircle2, ChevronDown } from "lucide-react";
import { sendSupportTicket } from "@/app/actions/support";

const FAQS = [
  {
    question: "Como funciona a Comunidade VIP?",
    answer: "A Comunidade VIP é um espaço exclusivo para troca de experiíªncias, onde vocíª pode conversar nas salas temáticas (Geral, Açíµes, FIIs, etc) e tirar díºvidas com outros investidores e com o Administrador."
  },
  {
    question: "Como subo de Ní­vel (XP)?",
    answer: "Vocíª ganha XP participando da plataforma. Cada vez que vocíª acessa, envia uma mensagem no Chat ou realiza uma ação, vocíª ganha pontos que te fazem subir de ní­vel."
  },
  {
    question: "Não encontrei o que procuro, o que fazer?",
    answer: "Utilize o formulário de suporte nesta página para enviar um e-mail diretamente para nossa equipe. Responderemos o mais rápido possí­vel!"
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
    <div className="flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Headphones size={28} className="text-green-400" />
            Central de Ajuda
          </h1>
          <p className="text-gray-400 mt-1">Como podemos te ajudar hoje?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - FAQ */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Perguntas Frequentes</h2>
            
            <div className="flex flex-col gap-3">
              {FAQS.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-[#2a2a2e] rounded-xl overflow-hidden transition-all duration-300"
                  style={{ background: openFaq === index ? 'rgba(0,212,170,0.05)' : 'transparent' }}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-200 hover:text-white"
                  >
                    {faq.question}
                    <ChevronDown 
                      size={18} 
                      className={`text-gray-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-green-400' : ''}`} 
                    />
                  </button>
                  
                  <motion.div 
                    initial={false}
                    animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 text-gray-400 text-sm leading-relaxed border-t border-[#2a2a2e]/50">
                      {faq.answer}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#1c1c1f] border border-[#2a2a2e] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Mail size={20} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Fale com o Suporte</h2>
                <p className="text-sm text-gray-400">Envie uma mensagem diretamente para nossa equipe.</p>
              </div>
            </div>

            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Mensagem Enviada!</h3>
                  <p className="text-gray-400 text-sm">Recebemos o seu ticket. Nossa equipe irá responder no e-mail cadastrado em sua conta o mais breve possí­vel.</p>
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-6 py-2 bg-[#2a2a2e] hover:bg-[#3a3a3e] text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Enviar outra mensagem
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-300">Como podemos ajudar?</label>
                  <textarea 
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva seu problema ou díºvida em detalhes..."
                    className="w-full min-h-[150px] p-4 bg-[#141417] border border-[#2a2a2e] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-y transition-all"
                    disabled={isSubmitting}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00d4aa] to-[#00b08e] hover:from-[#00b08e] hover:to-[#00967a] text-black font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Enviar Mensagem
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Vocíª receberá a resposta no seu e-mail cadastrado.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
