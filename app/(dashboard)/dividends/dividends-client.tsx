"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, Calendar, TrendingUp, Filter, ChevronLeft, ChevronRight,
  DownloadCloud, Plus, X, Edit2
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/mock-data";
import { addDividend, editDividend, deleteDividend } from "@/app/actions/dividends";

export default function DividendsClient({ initialDividends }: { initialDividends: any[] }) {
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [dividends, setDividends] = useState(initialDividends);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [ticker, setTicker] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("dividendo");
  const [currency, setCurrency] = useState("BRL");

  // Filters
  const filteredDividends = dividends.filter(d => {
    const dYear = new Date(d.paymentDate).getFullYear();
    return dYear === activeYear;
  });

  const totalYear = filteredDividends.reduce((sum, item) => sum + item.amount, 0);
  const avgMonth = totalYear / 12;

  // Agrupar por mí­Âªs para o gráfico
  const monthlyData = Array(12).fill(0).map((_, i) => {
    const date = new Date(activeYear, i, 1);
    return {
      month: date.toLocaleDateString("pt-BR", { month: "short" }),
      value: 0
    };
  });

  filteredDividends.forEach(d => {
    const month = new Date(d.paymentDate).getMonth();
    monthlyData[month].value += d.amount;
  });

  function resetForm() {
    setTicker("");
    setAmount("");
    setDate("");
    setType("dividendo");
    setCurrency("BRL");
    setEditingId(null);
    setErrorMsg("");
  }

  function openEdit(div: any) {
    setTicker(div.ticker);
    setAmount(div.amount.toString());
    setDate(div.paymentDate);
    setType(div.type);
    setCurrency(div.currency || "BRL");
    setEditingId(div.id);
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
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Dividendos e Proventos</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Acompanhe sua renda passiva mensal e histí­Â³rica.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" style={{ gap: "8px" }}>
            <DownloadCloud size={16} /> Exportar
          </button>
          <button className="btn btn-primary btn-sm" style={{ gap: "8px" }} onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={16} /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "rgba(251,146,60,0.15)", color: "var(--orange-primary)" }}>
              <DollarSign size={18} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-elevated)", padding: "4px 12px", borderRadius: "100px", border: "1px solid var(--border-default)" }}>
              <button onClick={() => setActiveYear(y => y-1)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}><ChevronLeft size={14} /></button>
              <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{activeYear}</span>
              <button onClick={() => setActiveYear(y => y+1)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}><ChevronRight size={14} /></button>
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Recebido em {activeYear}</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(totalYear)}</div>
        </div>

        <div className="metric-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ padding: "8px", borderRadius: "8px", background: "var(--green-glow)", color: "var(--green-primary)" }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Média Mensal ({activeYear})</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(avgMonth)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }} className="dividends-grid">
        
        {/* Chart */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex", flexDirection: "column",
        }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "24px" }}>Histí­Â³rico {activeYear}</h3>
          <div style={{ flex: 1, minHeight: "280px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-tertiary)" }} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                <Tooltip 
                  cursor={{ fill: "var(--bg-elevated)", opacity: 0.5 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="custom-tooltip">
                          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: "4px" }}>{label} {activeYear}</p>
                          <p style={{ color: "var(--green-primary)", fontWeight: 700, fontSize: "1rem" }}>{formatCurrency(Number(payload[0].value))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={"var(--green-primary)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
            <h3 style={{ fontSize: "1.1rem" }}>Lançamentos {activeYear}</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table className="table-premium" style={{ minWidth: "100%" }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: "24px" }}>Data</th>
                  <th>Ativo</th>
                  <th style={{ textAlign: "right" }}>Valor</th>
                  <th style={{ textAlign: "right", paddingRight: "24px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredDividends.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "24px", color: "var(--text-tertiary)" }}>Nenhum dividendo registrado.</td>
                  </tr>
                ) : filteredDividends.map((div) => {
                  const dateObj = new Date(div.paymentDate);
                  const formattedDate = dateObj.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' }).replace('.', '');
                  
                  return (
                    <tr key={div.id}>
                      <td style={{ paddingLeft: "24px" }}>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{formattedDate}</div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                            {div.ticker.substring(0,2)}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{div.ticker}</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>{div.type}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--green-primary)" }}>+{formatCurrency(div.amount, div.currency)}</div>
                      </td>
                      <td style={{ textAlign: "right", paddingRight: "24px" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button onClick={() => openEdit(div)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}><Edit2 size={14} /></button>
                          <button onClick={async () => {
                            if(confirm("Excluir?")){
                              await deleteDividend(div.id);
                              setDividends(prev => prev.filter(d => d.id !== div.id));
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
                <h3>{editingId ? "Editar Dividendo" : "Novo Dividendo"}</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}><X size={20} /></button>
              </div>
              <div style={{ padding: "20px" }}>
                {errorMsg && <div style={{ color: "var(--red-primary)", marginBottom: "12px", fontSize: "0.85rem" }}>{errorMsg}</div>}
                <form action={async (formData) => {
                  setLoading(true);
                  const res = editingId ? await editDividend(editingId, formData) : await addDividend(formData);
                  if (res?.error) setErrorMsg(res.error);
                  else window.location.reload();
                  setLoading(false);
                }}>
                  <div style={{ marginBottom: "12px" }}>
                    <label>Ticker (Ex: MXRF11)</label>
                    <input name="ticker" required value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} style={{ width: "100%" }} />
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label>Valor Total Recebido</label>
                    <input name="amount" type="number" step="0.01" required value={amount} onChange={e=>setAmount(e.target.value)} style={{ width: "100%" }} />
                  </div>
                  <div style={{ marginBottom: "12px", display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label>Data Pagamento</label>
                      <input name="date" type="date" required value={date} onChange={e=>setDate(e.target.value)} style={{ width: "100%" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Moeda</label>
                      <select name="currency" value={currency} onChange={e=>setCurrency(e.target.value)} style={{ width: "100%" }}>
                        <option value="BRL">BRL</option><option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label>Tipo</label>
                    <select name="type" value={type} onChange={e=>setType(e.target.value)} style={{ width: "100%" }}>
                      <option value="dividendo">Dividendo</option><option value="JCP">JCP</option><option value="rendimento">Rendimento</option><option value="outro">Outro</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Lançamento"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        @media (max-width: 1024px) {
          .dividends-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
}
