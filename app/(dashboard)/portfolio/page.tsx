"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Filter, ArrowUpDown, MoreVertical, X,
  Save, AlertCircle
} from "lucide-react";
import { 
  mockAssets, calcPortfolioMetrics, formatCurrency, 
  formatPercent, assetTypeColor, assetTypeLabel, AssetType
} from "@/lib/mock-data";

export default function PortfolioPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | AssetType>("ALL");

  const metrics = calcPortfolioMetrics(mockAssets);

  // Filter and sort
  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (asset.name && asset.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "ALL" || asset.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice)); // sort by size desc

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Minha Carteira</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Gerencie seus ativos, registre compras e vendas.</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ gap: "8px" }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={16} />
          Adicionar Ativo
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Total Investido</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(metrics.totalInvested)}</div>
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Saldo Atual</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(metrics.totalCurrent)}</div>
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Resultado</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: metrics.totalProfit >= 0 ? "var(--green-primary)" : "var(--red-primary)" }}>
            {formatCurrency(metrics.totalProfit)}
          </div>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: metrics.totalProfit >= 0 ? "var(--green-primary)" : "var(--red-primary)" }}>
            {formatPercent(metrics.totalProfitPercent)}
          </div>
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Posições</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>{mockAssets.length} ativos</div>
        </div>
      </div>

      {/* Filters & Table */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}>
        {/* Controls */}
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
            {/* Search */}
            <div style={{ position: "relative", maxWidth: "300px", width: "100%" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input 
                type="text" 
                placeholder="Buscar ativo..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                  borderRadius: "8px", padding: "8px 12px 8px 36px", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none",
                }}
              />
            </div>

            {/* Type Filter */}
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{
                background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">Todas as Classes</option>
              <option value="ETF">ETFs</option>
              <option value="stock">Ações</option>
              <option value="FII">FIIs</option>
              <option value="treasury">Tesouro Direto</option>
            </select>
          </div>

          <button className="btn btn-ghost btn-sm" style={{ gap: "6px" }}>
            <Filter size={14} /> Filtros avançados
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="table-premium" style={{ minWidth: "900px" }}>
            <thead>
              <tr>
                <th><div style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>Ativo <ArrowUpDown size={12} /></div></th>
                <th>Tipo</th>
                <th style={{ textAlign: "right" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", cursor: "pointer" }}>Qtd <ArrowUpDown size={12} /></div></th>
                <th style={{ textAlign: "right" }}>Preço Médio</th>
                <th style={{ textAlign: "right" }}>Preço Atual</th>
                <th style={{ textAlign: "right" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", cursor: "pointer" }}>Total <ArrowUpDown size={12} /></div></th>
                <th style={{ textAlign: "right" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", cursor: "pointer" }}>Resultado <ArrowUpDown size={12} /></div></th>
                <th style={{ width: "40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ color: "var(--text-tertiary)", marginBottom: "8px" }}>Nenhum ativo encontrado</div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  const totalInvested = asset.quantity * asset.averagePrice;
                  const totalCurrent = asset.quantity * asset.currentPrice;
                  const profit = totalCurrent - totalInvested;
                  const profitPercent = (profit / totalInvested) * 100;
                  
                  return (
                    <tr key={asset.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                            {asset.ticker.substring(0,2)}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>{asset.ticker}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{asset.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="badge" style={{ background: `${assetTypeColor[asset.type]}15`, color: assetTypeColor[asset.type], border: `1px solid ${assetTypeColor[asset.type]}30` }}>
                          {assetTypeLabel[asset.type]}
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>{asset.quantity}</td>
                      <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>{formatCurrency(asset.averagePrice, asset.currency)}</td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrency(asset.currentPrice, asset.currency)}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(totalCurrent, asset.currency)}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>{((totalCurrent / metrics.totalCurrent) * 100).toFixed(1)}% da carteira</div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ color: profit >= 0 ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 700 }}>
                          {formatCurrency(profit, asset.currency)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: profit >= 0 ? "var(--green-primary)" : "var(--red-primary)", fontWeight: 600 }}>
                          {formatPercent(profitPercent)}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: "4px" }}>
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
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
              {/* Header */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-elevated)" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Novo Lançamento</h3>
                <button onClick={() => setIsAddModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ flex: 1 }}>
                    <label>Tipo de Ativo</label>
                    <select style={{ width: "100%" }}>
                      <option value="ETF">ETF</option>
                      <option value="stock">Ação</option>
                      <option value="FII">FII</option>
                      <option value="treasury">Tesouro Direto</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Operação</label>
                    <select style={{ width: "100%" }}>
                      <option value="buy">Compra</option>
                      <option value="sell">Venda</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label>Ticker (Código do Ativo)</label>
                  <input type="text" placeholder="Ex: IVVB11, PETR4..." style={{ textTransform: "uppercase" }} />
                </div>

                <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ flex: 1 }}>
                    <label>Quantidade</label>
                    <input type="number" placeholder="0" min="1" step="any" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Preço Unitário (R$)</label>
                    <input type="number" placeholder="0,00" min="0" step="0.01" />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label>Data da Operação</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>

                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "8px", padding: "12px", display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "24px" }}>
                  <AlertCircle size={16} color="var(--blue-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                    O preço atual será sincronizado automaticamente com as APIs de mercado após salvar.
                  </p>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                  <button className="btn btn-primary" style={{ gap: "8px" }} onClick={() => setIsAddModalOpen(false)}>
                    <Save size={16} /> Salvar Lançamento
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
