"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Hash, CornerDownRight, Smile, ShieldCheck, Menu, X, Pin, Trash2, Edit2 } from "lucide-react";
import { sendChatMessage, getChatMessages, togglePinMessage, deleteChatMessage, editChatMessage } from "@/app/actions/chat";

const CHANNELS = [
  { id: 'geral', name: 'Geral', desc: 'Discussões gerais sobre finanças' },
  { id: 'acoes', name: 'Ações', desc: 'B3, mercado de capitais e análises' },
  { id: 'etfs', name: 'ETFs', desc: 'Fundos de Índice e exterior' },
  { id: 'fiis', name: 'FIIs', desc: 'Fundos Imobiliários e dividendos' },
  { id: 'cripto', name: 'Cripto', desc: 'Bitcoin, Ethereum e altcoins' },
];

export default function ChatClient({ initialMessages, isAdmin = false, currentUserId }: { initialMessages: any[], isAdmin?: boolean, currentUserId?: string }) {
  const [messages, setMessages] = useState(initialMessages);
  const [activeChannel, setActiveChannel] = useState('geral');
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingMsg, setEditingMsg] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para mobile
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

  // Auto-scroll apenas quando chegar mensagem nova
  useEffect(() => {
    scrollToBottom();
  }, [lastMessageId]);

  // Polling para simular Realtime (Atualiza a cada 3 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      // Re-busca as mensagens silenciosamente
      getChatMessages(activeChannel).then(res => {
        if (res.success) setMessages(res.data);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChannel]);

  const loadChannelMessages = async (channelId: string) => {
    setActiveChannel(channelId);
    setIsSidebarOpen(false); // Fecha a sidebar no mobile ao trocar de sala
    const res = await getChatMessages(channelId);
    if (res.success) {
      setMessages(res.data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    if (editingMsg) {
      const res = await editChatMessage(editingMsg.id, content);
      setIsSubmitting(false);
      if (res.success) {
        setContent("");
        setEditingMsg(null);
        loadChannelMessages(activeChannel);
      } else {
        alert("Erro ao editar mensagem: " + (res.error || "Tente novamente."));
      }
      return;
    }

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
      loadChannelMessages(activeChannel);
    } else {
      alert("Erro ao enviar mensagem: " + (res.error || "Tente novamente."));
    }
  };

  const handlePin = async (id: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    const res = await togglePinMessage(id, currentStatus);
    if (res.success) {
      loadChannelMessages(activeChannel);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja apagar sua mensagem?")) {
      const res = await deleteChatMessage(id);
      if (res.success) loadChannelMessages(activeChannel);
    }
  };

  const getReplyMessage = (replyId: string) => {
    return messages.find(m => m.id === replyId);
  };

  return (
    <div style={{ position: "relative", display: "flex", height: "calc(100vh - 120px)", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border-default)", overflow: "hidden" }}>
      
      {/* Botão Mobile para abrir Salas */}
      <button 
        className="mobile-only-btn"
        onClick={() => setIsSidebarOpen(true)}
        style={{
          position: "absolute", top: "12px", right: "12px", zIndex: 50,
          background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
          borderRadius: "8px", padding: "8px", color: "var(--text-primary)", cursor: "pointer",
          display: "none"
        }}
      >
        <Menu size={24} />
      </button>

      {/* Estilos injetados para responsividade */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .chat-sidebar {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .chat-sidebar.open {
            transform: translateX(0);
          }
          .mobile-only-btn {
            display: flex !important;
          }
          .chat-header-title {
            max-width: 200px;
          }
        }
      `}} />

      {/* Overlay Escuro para Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar de Canais */}
      <div className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ width: "240px", borderRight: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} color="var(--green-primary)" />
            Chat VIP
          </h2>
          <button className="mobile-only-btn" onClick={() => setIsSidebarOpen(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", display: "none" }}>
            <X size={20} />
          </button>
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
          <div className="chat-header-title">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{CHANNELS.find(c => c.id === activeChannel)?.name}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{CHANNELS.find(c => c.id === activeChannel)?.desc}</p>
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
                  const isAdminUser = msg.profiles?.name?.includes('Patrimônio+');
                  const isMyMessage = msg.user_id === currentUserId;
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: "flex", gap: "12px", group: "msg" }}
                      className="msg-container"
                    >
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: msg.is_pinned ? "var(--purple-primary)" : "var(--bg-card)", color: msg.is_pinned ? "#fff" : "var(--text-secondary)", border: `1px solid ${msg.is_pinned ? "transparent" : "var(--border-subtle)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, overflow: "hidden" }}>
                        {isAdminUser ? <img src="/logo.png" alt="Patrimônio+" style={{width: "100%", height: "100%", objectFit: "cover"}} /> : 
                        (msg.is_pinned ? <Pin size={18} /> : 
                        (msg.profiles?.avatar_url ? <img src={msg.profiles.avatar_url} style={{width: "100%", height: "100%", objectFit: "cover"}} /> : 
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${msg.profiles?.name || 'User'}`} style={{width: "100%", height: "100%", objectFit: "cover", background: "rgba(255,255,255,0.05)"}} />))}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 600, color: msg.is_pinned ? "var(--purple-primary)" : "var(--text-primary)" }}>{msg.profiles?.name || "Usuário"}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                            {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!isAdminUser && (
                            <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "rgba(0,212,170,0.1)", color: "var(--green-primary)", borderRadius: "4px" }}>
                              Lvl {msg.profiles?.level || 1}
                            </span>
                          )}
                          {msg.is_pinned && (
                            <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "rgba(168, 85, 247, 0.1)", color: "var(--purple-primary)", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                              Fixado
                            </span>
                          )}
                        </div>

                    {/* Reply Bubble */}
                    {repliedMsg && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "0.85rem", color: "var(--text-tertiary)", background: "var(--bg-elevated)", padding: "4px 10px", borderRadius: "6px", borderLeft: "2px solid var(--green-primary)", width: "fit-content", maxWidth: "100%" }}>
                        <CornerDownRight size={12} flexShrink={0} />
                        <span style={{ fontWeight: 600, flexShrink: 0 }}>{repliedMsg.profiles?.name}:</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{repliedMsg.content}</span>
                      </div>
                    )}

                    <div style={{ color: msg.is_pinned ? "var(--text-primary)" : "var(--text-secondary)", lineHeight: 1.5, fontSize: "0.95rem", fontWeight: msg.is_pinned ? 500 : 400, background: msg.is_pinned ? "rgba(168, 85, 247, 0.05)" : "transparent", padding: msg.is_pinned ? "8px 12px" : "0", borderRadius: "8px", borderLeft: msg.is_pinned ? "3px solid var(--purple-primary)" : "none" }}>
                      {msg.content}
                    </div>

                    <div style={{ marginTop: msg.is_pinned ? "8px" : "4px", display: "flex", gap: "16px", alignItems: "center" }}>
                      <button 
                        onClick={() => { setReplyTo(msg); setEditingMsg(null); }}
                        style={{ background: "none", border: "none", color: "var(--text-tertiary)", fontSize: "0.8rem", cursor: "pointer", padding: "0", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
                        className="hover:text-primary"
                      >
                        <CornerDownRight size={14} /> Responder
                      </button>
                      
                      {isMyMessage && !msg.is_pinned && (
                        <button 
                          onClick={() => { setEditingMsg(msg); setContent(msg.content); setReplyTo(null); }}
                          style={{ background: "none", border: "none", color: "var(--blue-primary)", fontSize: "0.8rem", cursor: "pointer", padding: "0", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
                        >
                          <Edit2 size={12} /> Editar
                        </button>
                      )}
                      
                      {(isMyMessage || isAdmin) && !msg.is_pinned && (
                        <button 
                          onClick={() => handleDelete(msg.id)}
                          style={{ background: "none", border: "none", color: "var(--red-primary)", fontSize: "0.8rem", cursor: "pointer", padding: "0", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
                        >
                          <Trash2 size={12} /> Excluir
                        </button>
                      )}

                      {isAdmin && (
                        <button 
                          onClick={() => handlePin(msg.id, msg.is_pinned)}
                          style={{ background: "none", border: "none", color: msg.is_pinned ? "var(--purple-primary)" : "var(--text-tertiary)", fontSize: "0.8rem", cursor: "pointer", padding: "0", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}
                        >
                          <Pin size={12} /> {msg.is_pinned ? 'Desfixar' : 'Fixar'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Digitação */}
        <div className="chat-input-container" style={{ padding: "20px", background: "var(--bg-elevated)", borderTop: "1px solid var(--border-subtle)" }}>
          <style dangerouslySetInnerHTML={{__html: `
            @media (max-width: 768px) {
              .chat-input-container {
                padding-bottom: 90px !important; /* Espaço para os botões flutuantes globais */
              }
            }
          `}} />
          {replyTo && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", padding: "8px 12px", borderRadius: "8px", marginBottom: "8px", borderLeft: "3px solid var(--green-primary)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Respondendo a {replyTo.profiles?.name}:</span> {replyTo.content}
              </div>
              <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", flexShrink: 0, marginLeft: "8px" }}><X size={16} /></button>
            </div>
          )}

          {editingMsg && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0, 112, 243, 0.1)", padding: "8px 12px", borderRadius: "8px", marginBottom: "8px", borderLeft: "3px solid var(--blue-primary)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--blue-primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <Edit2 size={14} /> Editando sua mensagem
              </div>
              <button onClick={() => { setEditingMsg(null); setContent(""); }} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", flexShrink: 0, marginLeft: "8px", fontSize: "0.8rem", fontWeight: 700 }}>Cancelar</button>
            </div>
          )}

          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input 
              type="text" 
              value={content} 
              onChange={e => setContent(e.target.value)}
              placeholder={`Mensagem em #${CHANNELS.find(c => c.id === activeChannel)?.name}`}
              style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", background: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-primary)", outline: "none", minWidth: 0 }}
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
