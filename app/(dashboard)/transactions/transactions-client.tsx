"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, Edit2, ArrowDownCircle, ArrowUpCircle, Filter
} from "lucide-react";
import { formatCurrency } from "@/lib/mock-data";
import { addTransaction, editTransaction, deleteTransaction } from "@/app/actions/transactions";

export default function TransactionsClient({ initialTransactions }: { initialTransactions: any[] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Outros");

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  function resetForm() {
    setDescription("");
    setAmount("");
    setDate("");
    setType("expense");
    setCategory("Outros");
    setEditingId(null);
    setErrorMsg("");
  }

  function openEdit(t: any) {
    setDescription(t.description);
    setAmount(t.amount.toString());
    setDate(t.date);
    setType(t.type);
    setCategory(t.category || "Outros");
    setEditingId(t.id);
    setIsModalOpen(true);
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
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Lançamentos</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Controle suas receitas e despesas.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-sm" style={{ gap: "8px" }} onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={16} /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div className="metric-card">
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Receitas</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--green-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <ArrowUpCircle size={24} /> {formatCurrency(totalIncome)}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Despesas</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--red-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <ArrowDownCircle size={24} /> {formatCurrency(totalExpense)}
          </div>
        </div>

        <div className="metric-card">
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Saldo Líquido</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(balance)}</div>
        </div>
      </div>

      {/* List */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "16px",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1.1rem" }}>Histórico</h3>
          <button className="btn btn-ghost btn-sm" style={{ padding: "4px" }}>
            <Filter size={16} />
          </button>
        </div>
        
        <div style={{ flex: 1, overflowX: "auto" }}>
          <table className="table-premium" style={{ minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: "24px" }}>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th style={{ textAlign: "right" }}>Valor</th>
                <th style={{ textAlign: "right", paddingRight: "24px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "var(--text-tertiary)" }}>Nenhum lançamento registrado.</td>
                </tr>
              ) : transactions.map((t) => {
                const dateObj = new Date(t.date);
                const formattedDate = dateObj.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', year: 'numeric' });
                
                return (
                  <tr key={t.id}>
                    <td style={{ paddingLeft: "24px" }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{formattedDate}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{t.description}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>{t.category}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: t.type === 'income' ? "var(--green-primary)" : "var(--red-primary)" }}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", paddingRight: "24px" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button onClick={() => openEdit(t)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}><Edit2 size={14} /></button>
                        <button onClick={async () => {
                          if(confirm("Excluir?")){
                            await deleteTransaction(t.id);
                            setTransactions(prev => prev.filter(tr => tr.id !== t.id));
                          }
                        }} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "20px", width: "100%", maxWidth: "400px", overflow: "hidden" }}
            >
              <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between" }}>
                <h3>{editingId ? "Editar Lançamento" : "Novo Lançamento"}</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <div style={{ padding: "20px" }}>
                {errorMsg && <div style={{ color: "var(--red-primary)", marginBottom: "12px", fontSize: "0.85rem" }}>{errorMsg}</div>}
                <form action={async (formData) => {
                  setLoading(true);
                  const res = editingId ? await editTransaction(editingId, formData) : await addTransaction(formData);
                  if (res?.error) setErrorMsg(res.error);
                  else window.location.reload();
                  setLoading(false);
                }}>
                  <div style={{ marginBottom: "12px" }}>
                    <label>Descrição</label>
                    <input name="description" required value={description} onChange={e=>setDescription(e.target.value)} style={{ width: "100%" }} placeholder="Ex: Salário" />
                  </div>
                  <div style={{ marginBottom: "12px", display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label>Valor</label>
                      <input name="amount" type="number" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)} style={{ width: "100%" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Data</label>
                      <input name="date" type="date" required value={date} onChange={e=>setDate(e.target.value)} style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: "12px", display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label>Tipo</label>
                      <select name="type" value={type} onChange={e=>setType(e.target.value)} style={{ width: "100%" }}>
                        <option value="income">Receita</option>
                        <option value="expense">Despesa</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Categoria</label>
                      <input name="category" required value={category} onChange={e=>setCategory(e.target.value)} style={{ width: "100%" }} placeholder="Ex: Alimentação" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }} disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Lançamento"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
