"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, Plus, Calendar, Edit2, Trash2, X, Save
} from "lucide-react";
import { formatCompact, formatPercent } from "@/lib/mock-data";
import { addGoal, deleteGoal, addProgressToGoal } from "@/app/actions/goals";

export default function GoalsClient({ initialGoals }: { initialGoals: any[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [goals, setGoals] = useState(initialGoals);
  
  // States for the form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("objetivo");

  // State for Add Progress
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState("");

  const handleAddGoal = async () => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("targetAmount", targetAmount);
    fd.append("deadline", deadline);
    fd.append("category", category);
    
    await addGoal(fd);
    setIsAddModalOpen(false);
    // Para simplificar, num projeto real farí­amos refetch aqui ou usarí­amos startTransition,
    // mas o Next cache revalidatePath cuidará do recarregamento de página.
    window.location.reload();
  };

  const handleAddProgress = async () => {
    if (!selectedGoalId || !progressAmount) return;
    await addProgressToGoal(selectedGoalId, Number(progressAmount));
    setSelectedGoalId(null);
    setProgressAmount("");
    window.location.reload();
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deletar esta meta?")) {
      await deleteGoal(id);
      window.location.reload();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Metas Financeiras</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Defina e acompanhe seus objetivos de vida e independíªncia.</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ gap: "8px" }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={16} />
          Nova Meta
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {goals.length === 0 && (
          <div style={{ color: "var(--text-tertiary)" }}>Nenhuma meta criada. Crie uma nova meta!</div>
        )}
        {goals.map((goal) => {
          const progressPercent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          
          return (
            <motion.div
              key={goal.id}
              whileHover={{ y: -4 }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "16px",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = goal.color + "40";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${goal.color}15`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Corner glow */}
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: "100px", height: "100px",
                background: `radial-gradient(circle at top right, ${goal.color}15 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "12px",
                    background: `${goal.color}15`, color: goal.color,
                    border: `1px solid ${goal.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{goal.title}</h3>
                    <div className="badge" style={{ background: "transparent", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", marginTop: "4px", padding: "2px 8px", fontSize: "0.65rem" }}>
                      {goal.category}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setSelectedGoalId(goal.id)} style={{ background: "none", border: "none", color: "var(--green-primary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" }}>+ Progresso</button>
                  <button onClick={() => handleDelete(goal.id)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}><Trash2 size={14} /></button>
                </div>
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginBottom: "24px", lineHeight: 1.5, minHeight: "40px" }}>
                {goal.description}
              </p>

              {/* Progress */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {formatCompact(goal.currentAmount)}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", fontWeight: 600 }}>
                    de {formatCompact(goal.targetAmount)}
                  </div>
                </div>

                <div style={{ width: "100%", height: "8px", background: "var(--bg-elevated)", borderRadius: "999px", overflow: "hidden" }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ height: "100%", background: goal.color, borderRadius: "999px", boxShadow: `0 0 10px ${goal.color}60` }}
                  />
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: goal.color }}>
                    {formatPercent(progressPercent)} concluí­do
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                    <Calendar size={12} /> Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Progress Modal */}
      <AnimatePresence>
        {selectedGoalId && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", width: "100%", maxWidth: "400px", padding: "24px" }}
            >
              <h3 style={{ marginBottom: "16px", fontSize: "1.2rem" }}>Registrar Progresso</h3>
              <div style={{ marginBottom: "20px" }}>
                <label>Valor Alcançado (R$)</label>
                <input type="number" value={progressAmount} onChange={(e) => setProgressAmount(e.target.value)} placeholder="Ex: 500" />
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setSelectedGoalId(null)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleAddProgress}>Salvar Progresso</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            zIndex: 999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px"
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                borderRadius: "20px",
                width: "100%", maxWidth: "500px",
                boxShadow: "var(--shadow-lg), 0 0 40px rgba(0,212,170,0.1)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Nova Meta</h3>
                <button onClick={() => setIsAddModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <label>Tí­tulo da Meta</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Liberdade Financeira, Carro Novo..." />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label>Descrição (Opcional)</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Por que essa meta é importante?" rows={3} style={{ resize: "none" }} />
                </div>

                <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ flex: 1 }}>
                    <label>Valor Alvo (R$)</label>
                    <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="Ex: 100000" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Prazo</label>
                    <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label>Categoria</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%" }}>
                    <option value="patrimonio">Patrimônio</option>
                    <option value="reserva">Reserva de Emergíªncia</option>
                    <option value="aposentadoria">Aposentadoria</option>
                    <option value="objetivo">Objetivo Especí­fico (Carro, Casa, Viagem)</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                  <button className="btn btn-primary" style={{ gap: "8px" }} onClick={handleAddGoal}>
                    <Save size={16} /> Salvar Meta
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
