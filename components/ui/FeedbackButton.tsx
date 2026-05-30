"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { submitFeedback } from "@/app/actions/feedback";

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{type: "error" | "success", msg: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);
    const formData = new FormData(e.currentTarget);
    const res = await submitFeedback(formData);
    
    if (res?.error) {
      setStatusMsg({ type: "error", msg: res.error });
    } else {
      setStatusMsg({ type: "success", msg: "Obrigado pelo seu feedback!" });
      setTimeout(() => {
        setIsOpen(false);
        setStatusMsg(null);
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "var(--green-primary)",
          color: "#000",
          border: "none",
          borderRadius: "50%",
          width: "56px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,212,170,0.4)",
          cursor: "pointer",
          zIndex: 900
        }}
      >
        <MessageSquare size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", width: "100%", maxWidth: "400px", overflow: "hidden" }}
            >
              <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between" }}>
                <h3>Enviar Feedback</h3>
                <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <div style={{ padding: "20px" }}>
                {statusMsg && (
                  <div style={{ 
                    color: statusMsg.type === "success" ? "var(--green-primary)" : "var(--red-primary)", 
                    marginBottom: "12px", fontSize: "0.85rem",
                    background: statusMsg.type === "success" ? "rgba(0,212,170,0.1)" : "rgba(255,0,0,0.1)",
                    padding: "8px", borderRadius: "8px"
                  }}>
                    {statusMsg.msg}
                  </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label>Categoria</label>
                    <select name="category" required style={{ width: "100%", marginTop: "8px" }}>
                      <option value="bug">Reportar Bug</option>
                      <option value="feature">Sugestão de Funcionalidade</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label>Mensagem</label>
                    <textarea name="message" required rows={4} style={{ width: "100%", marginTop: "8px", padding: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "8px", color: "var(--text-primary)", resize: "none" }} placeholder="Como podemos melhorar?"></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                    {loading ? "Enviando..." : "Enviar"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
