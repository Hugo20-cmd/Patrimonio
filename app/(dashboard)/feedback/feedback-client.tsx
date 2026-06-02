"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, Send, Loader2 } from "lucide-react";
import { submitFeedback } from "@/app/actions/feedback";

export default function FeedbackClient({ profile, initialFeedbacks }: { profile: any, initialFeedbacks: any[] }) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await submitFeedback(formData);
    if (res?.success) {
      const newFeedback = {
        id: Math.random().toString(),
        content: formData.get("message") as string,
        type: formData.get("category") as string,
        status: "pendente",
        created_at: new Date().toISOString(),
        profiles: { name: profile.name, email: profile.email }
      };
      setFeedbacks([newFeedback, ...feedbacks]);
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filter === "all") return true;
    return f.type === filter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      <div>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Central de Feedbacks</h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Ajude a moldar o futuro do ecossistema Patrimônio+.</p>
      </div>

      <div className="grid-2">
        {/* Nova Sugestão */}
        <div className="glass-card" style={{ padding: "24px", height: "fit-content" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={20} color="var(--green-primary)" />
            Enviar Sugestão
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label>Categoria</label>
              <select name="category" required style={{ width: "100%", marginTop: "8px" }}>
                <option value="feature">Sugestão de Funcionalidade</option>
                <option value="bug">Reportar Bug</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <label>Sua Mensagem</label>
              <textarea 
                name="message" 
                required 
                rows={5} 
                style={{ width: "100%", marginTop: "8px", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", resize: "vertical" }} 
                placeholder="Como podemos melhorar a plataforma para você?"
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? "Enviando..." : "Enviar Feedback"}
            </button>
          </form>
        </div>

        {/* Lista de Feedbacks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px" }}>
            <button onClick={() => setFilter("all")} className={`btn ${filter === "all" ? "btn-primary" : "btn-secondary"} btn-sm`}>Todos</button>
            <button onClick={() => setFilter("feature")} className={`btn ${filter === "feature" ? "btn-primary" : "btn-secondary"} btn-sm`}>Funcionalidades</button>
            <button onClick={() => setFilter("bug")} className={`btn ${filter === "bug" ? "btn-primary" : "btn-secondary"} btn-sm`}>Bugs</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredFeedbacks.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", background: "var(--bg-card)", borderRadius: "12px", border: "1px dashed var(--border-default)" }}>
                <MessageSquare size={32} color="var(--text-tertiary)" style={{ opacity: 0.5, marginBottom: "12px" }} />
                <p style={{ color: "var(--text-secondary)" }}>Nenhum feedback encontrado.</p>
              </div>
            ) : (
              filteredFeedbacks.map((fb: any) => (
                <div key={fb.id} className="glass-card" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--gradient-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>
                        {(fb.profiles?.name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{fb.profiles?.name || "Usuário Anônimo"}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>{new Date(fb.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={fb.status === "pendente" ? "badge badge-blue" : fb.status === "resolvido" ? "badge badge-green" : "badge badge-red"}>
                      {fb.status === "pendente" ? "Em Análise" : fb.status === "resolvido" ? "Implementado" : "Recusado"}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.5, marginTop: "12px" }}>
                    {fb.content}
                  </div>
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {fb.type === 'bug' ? '🐛 Bug' : fb.type === 'feature' ? '✨ Nova Ideia' : '📝 Outro'}
                    </span>
                    <button style={{ background: "none", border: "none", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.8rem", transition: "color 0.2s" }} className="hover:text-green-brand">
                      <ThumbsUp size={14} /> Apoiar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
