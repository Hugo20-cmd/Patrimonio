'use client'

import * as Dialog from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, Zap, ArrowRight, ShieldCheck } from "lucide-react"
import { useState } from "react"

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
}

export default function PaywallModal({ 
  isOpen, 
  onClose,
  title = "Limite do Plano Grátis Atingido",
  description = "Faça o upgrade para o Premium e libere todo o potencial da sua organização financeira."
}: PaywallModalProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erro ao iniciar checkout')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao conectar com servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(5px)",
                  zIndex: 9999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px"
                }}
              >
                <Dialog.Content asChild>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    style={{
                      background: "var(--bg-primary)",
                      borderRadius: "24px",
                      width: "100%",
                      maxWidth: "500px",
                      position: "relative",
                      overflow: "hidden",
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    }}
                  >
                    {/* Header Decoration */}
                    <div style={{ 
                      height: "120px", 
                      background: "linear-gradient(135deg, rgba(0,212,170,0.2) 0%, rgba(79,110,247,0.2) 100%)",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{
                        width: "64px", height: "64px",
                        background: "linear-gradient(135deg, #00d4aa 0%, #4f6ef7 100%)",
                        borderRadius: "16px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 10px 25px rgba(0,212,170,0.4)",
                        transform: "translateY(32px)"
                      }}>
                        <Zap size={32} color="#000" fill="#000" />
                      </div>
                      
                      <button 
                        onClick={onClose}
                        style={{
                          position: "absolute",
                          top: "16px", right: "16px",
                          background: "rgba(0,0,0,0.5)", border: "none",
                          width: "32px", height: "32px", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", cursor: "pointer",
                          transition: "background 0.2s"
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ padding: "48px 32px 32px", textAlign: "center" }}>
                      <Dialog.Title style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "12px", color: "var(--text-primary)" }}>
                        {title}
                      </Dialog.Title>
                      <Dialog.Description style={{ color: "var(--text-tertiary)", fontSize: "1rem", lineHeight: 1.5, marginBottom: "32px" }}>
                        {description}
                      </Dialog.Description>

                      <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left", marginBottom: "32px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <CheckCircle2 size={20} color="var(--green-primary)" />
                          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Corretoras Ilimitadas (Pluggy)</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <CheckCircle2 size={20} color="var(--green-primary)" />
                          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Ativos Ilimitados na Carteira</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <CheckCircle2 size={20} color="var(--green-primary)" />
                          <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Calendário de Dividendos (Em breve)</span>
                        </div>
                      </div>

                      <div style={{ background: "var(--bg-elevated)", borderRadius: "16px", padding: "16px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>Plano Premium</div>
                          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>
                            R$ 19,90<span style={{ fontSize: "1rem", color: "var(--text-tertiary)", fontWeight: 500 }}>/míªs</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={handleCheckout}
                        disabled={loading}
                        style={{
                          width: "100%", padding: "16px",
                          background: "var(--gradient-green)",
                          border: "none", borderRadius: "12px",
                          color: "#000", fontSize: "1.1rem", fontWeight: 700,
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                          boxShadow: "0 8px 20px rgba(0,212,170,0.3)",
                          opacity: loading ? 0.7 : 1
                        }}
                      >
                        {loading ? "Redirecionando..." : "Desbloquear Premium"}
                        {!loading && <ArrowRight size={20} />}
                      </button>

                      <div style={{ marginTop: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--text-tertiary)", fontSize: "0.8rem" }}>
                        <ShieldCheck size={14} /> Pagamento 100% seguro via Stripe
                      </div>
                    </div>
                  </motion.div>
                </Dialog.Content>
              </motion.div>
            </Dialog.Overlay>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
