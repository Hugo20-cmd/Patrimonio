"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Hash, CornerDownRight, Smile, ShieldCheck } from "lucide-react";
import { sendChatMessage, getChatMessages } from "@/app/actions/chat";

const CHANNELS = [
  { id: 'geral', name: 'Geral', desc: 'Discussões gerais sobre finanças' },
  { id: 'acoes', name: 'Ações', desc: 'B3, mercado de capitais e análises' },
  { id: 'fiis', name: 'FIIs', desc: 'Fundos Imobiliários e dividendos' },
  { id: 'cripto', name: 'Cripto', desc: 'Bitcoin, Ethereum e altcoins' },
];

export default function ChatClient({ initialMessages }: { initialMessages: any[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [activeChannel, setActiveChannel] = useState('geral');
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChannelMessages = async (channelId: string) => {
    setActiveChannel(channelId);
    const res = await getChatMessages(channelId);
    if (res.success) {
      setMessages(res.data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("channel", activeChannel);
    fd.append("content", content);
    if (replyTo) {
      fd.append("reply_to_id", replyTo.id);
    }

    const res = await sendChatMessage(fd);
    setIsSubmitting(false);

    if (res.success) {
      setContent("");
      setReplyTo(null);
      // Recarregar mensagens (idealmente usar WebSocket/Supabase Realtime, mas polling rápido funciona pro demo)
      loadChannelMessages(activeChannel);
    }
  };

  const getReplyMessage = (replyId: string) => {
    return messages.find(m => m.id === replyId);
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 120px)", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-default)", overflow: "hidden" }}>
      
      {/* Sidebar de Canais */}
      <div style={{ width: "240px", borderRight: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} color="var(--green-primary)" />
            Chat VIP
          </h2>
        </div>
        <div style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 12px" }}>
            Salas Temáticas
          </div>
          {CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => loadChannelMessages(ch.id)}
              style={{
                background: activeChannel === ch.id ? "rgba(255,255,255,0.08)" : "transparent",
                color: activeChannel === ch.id ? "var(--text-primary)" : "var(--text-secondary)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: activeChannel === ch.id ? 600 : 400,
                transition: "background 0.2s"
              }}
            >
              <Hash size={16} color={activeChannel === ch.id ? "var(--green-primary)" : "var(--text-tertiary)"} />
              {ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* Área Principal do Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-primary)" }}>
        
        {/* Chat Header */}
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", gap: "12px" }}>
          <Hash size={20} color="var(--text-secondary)" />
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{CHANNELS.find(c => c.id === activeChannel)?.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{CHANNELS.find(c => c.id === activeChannel)?.desc}</p>
          </div>
        </div>

        {/* Lista de Mensagens */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-tertiary)", marginTop: "40px" }}>
              Seja o primeiro a enviar uma mensagem na sala #{activeChannel}!
            </div>
          ) : (
            messages.map((msg) => {
              const repliedMsg = msg.reply_to_id ? getReplyMessage(msg.reply_to_id) : null;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", gap: "12px", group: "msg" }}
                  className="msg-container"
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, color: "var(--text-secondary)" }}>
                    {msg.profiles?.name?.charAt(0) || "U"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{msg.profiles?.name || "Usuário"}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                        {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "rgba(0,212,170,0.1)", color: "var(--green-primary)", borderRadius: "4px" }}>
                        Lvl {msg.profiles?.level || 1}
                      </span>
                    </div>

                    {/* Reply Bubble */}
                    {repliedMsg && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "0.85rem", color: "var(--text-tertiary)", background: "var(--bg-elevated)", padding: "4px 10px", borderRadius: "6px", borderLeft: "2px solid var(--green-primary)", width: "fit-content" }}>
                        <CornerDownRight size={12} />
                        <span style={{ fontWeight: 600 }}>{repliedMsg.profiles?.name}:</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{repliedMsg.content}</span>
                      </div>
                    )}

                    <div style={{ color: "var(--text-secondary)", lineHeight: 1.5, fontSize: "0.95rem" }}>
                      {msg.content}
                    </div>

                    <div style={{ marginTop: "4px" }}>
                      <button 
                        onClick={() => setReplyTo(msg)}
                        style={{ background: "none", border: "none", color: "var(--text-tertiary)", fontSize: "0.8rem", cursor: "pointer", padding: "0" }}
                        className="hover:text-primary"
                      >
                        Responder
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Digitação */}
        <div style={{ padding: "20px", background: "var(--bg-elevated)", borderTop: "1px solid var(--border-subtle)" }}>
          {replyTo && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", padding: "8px 12px", borderRadius: "8px", marginBottom: "8px", borderLeft: "3px solid var(--green-primary)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Respondendo a {replyTo.profiles?.name}:</span> {replyTo.content.substring(0, 50)}...
              </div>
              <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>✕</button>
            </div>
          )}

          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button type="button" onClick={() => {
              // Simulação de Emoji picker nativo inserindo um emoji direto
              setContent(c => c + " 🚀");
            }} style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", cursor: "pointer", flexShrink: 0 }}>
              <Smile size={20} />
            </button>
            <input 
              type="text" 
              value={content} 
              onChange={e => setContent(e.target.value)}
              placeholder={`Conversar em #${CHANNELS.find(c => c.id === activeChannel)?.name}`}
              style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", background: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-primary)", outline: "none" }}
            />
            <button type="submit" disabled={isSubmitting || !content.trim()} className="btn btn-primary" style={{ width: "44px", height: "44px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px", flexShrink: 0 }}>
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
