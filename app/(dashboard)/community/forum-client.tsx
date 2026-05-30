"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Heart, ShieldCheck, Flame, Plus, X, Send, AlertTriangle } from "lucide-react";
import { createForumPost } from "@/app/actions/forum";

export default function ForumClient({ initialPosts }: { initialPosts: any[] }) {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreatePost = async () => {
    if (!title || !content) {
      setErrorMsg("Preencha título e conteúdo.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg("");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("content", content);

    const res = await createForumPost(fd);

    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setIsComposeOpen(false);
      setTitle("");
      setContent("");
      window.location.reload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Comunidade VIP</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={14} color="var(--green-primary)" />
            Ambiente monitorado pelo Bot Anti-Spam. Diga não a golpes.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ gap: "8px" }}
          onClick={() => setIsComposeOpen(true)}
        >
          <Plus size={16} />
          Nova Postagem
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {initialPosts.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", background: "var(--bg-card)", borderRadius: "16px", border: "1px dashed var(--border-default)" }}>
            <MessageSquare size={32} color="var(--text-tertiary)" style={{ margin: "0 auto 16px auto" }} />
            <h3 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>Nenhuma postagem ainda</h3>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Seja o primeiro a começar uma discussão!</p>
          </div>
        )}

        {initialPosts.map((post) => (
          <motion.div
            key={post.id}
            whileHover={{ y: -2 }}
            style={{
              background: post.is_pinned ? "var(--bg-elevated)" : "var(--bg-card)",
              border: `1px solid ${post.is_pinned ? "var(--purple-primary)50" : "var(--border-default)"}`,
              borderRadius: "16px",
              padding: "24px",
              transition: "border-color 0.3s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden"
                }}>
                  {post.author.avatarUrl ? (
                    <img src={post.author.avatarUrl} alt={post.author.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                      {post.author.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{post.author.name}</span>
                    <span style={{ fontSize: "0.7rem", padding: "2px 6px", background: "rgba(0,212,170,0.1)", color: "var(--green-primary)", borderRadius: "4px", display: "flex", alignItems: "center", gap: "2px" }}>
                      <Flame size={10} /> Lvl {post.author.level}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                    {new Date(post.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              
              {post.is_pinned && (
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--purple-primary)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                  📌 Fixado
                </span>
              )}
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              {post.title}
            </h3>
            
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
              {post.content}
            </p>

            <div style={{ display: "flex", gap: "16px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
              <button style={{ background: "none", border: "none", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.9rem" }}>
                <Heart size={16} /> {post.likes_count} Curtidas
              </button>
              <button style={{ background: "none", border: "none", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.9rem" }}>
                <MessageSquare size={16} /> {post.comments_count} Respostas
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", width: "100%", maxWidth: "600px", overflow: "hidden" }}
            >
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Nova Postagem</h3>
                <button onClick={() => setIsComposeOpen(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: "24px" }}>
                {errorMsg && (
                  <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#ef4444", fontSize: "0.9rem", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                    {errorMsg}
                  </div>
                )}

                <div style={{ marginBottom: "20px" }}>
                  <label>Título da Discussão</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Dúvidas sobre FIIs de Tijolo" />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label>Conteúdo</label>
                  <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="O que você quer compartilhar com a comunidade?" rows={6} style={{ resize: "vertical" }} />
                  <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "8px" }}>
                    Links maliciosos e propagandas são bloqueados automaticamente pelo nosso sistema.
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button className="btn btn-ghost" onClick={() => setIsComposeOpen(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleCreatePost} disabled={isSubmitting} style={{ gap: "8px" }}>
                    <Send size={16} /> {isSubmitting ? "Enviando..." : "Publicar"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
