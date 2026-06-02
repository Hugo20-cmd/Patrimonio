"use client";

import { useState, useEffect } from "react";
import { PluggyConnect } from "react-pluggy-connect";
import { Landmark, RefreshCw, Trash2, CheckCircle2, AlertCircle, Loader2, Link2 } from "lucide-react";
import { savePluggyItem, getPluggyItems, removePluggyItem } from "@/app/actions/pluggy";

export default function PluggyConnectSection() {
  const [connectToken, setConnectToken]   = useState<string | null>(null);
  const [showWidget, setShowWidget]       = useState(false);
  const [syncing, setSyncing]             = useState(false);
  const [connectedItems, setConnectedItems] = useState<any[]>([]);
  const [statusMsg, setStatusMsg]         = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loadingToken, setLoadingToken]   = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const items = await getPluggyItems();
    setConnectedItems(items);
  }

  async function handleConnect() {
    setLoadingToken(true);
    setStatusMsg(null);
    try {
      const res  = await fetch("/api/connect-token", { method: "POST" });
      const data = await res.json();
      if (data.accessToken) {
        setConnectToken(data.accessToken);
        setShowWidget(true);
      } else {
        setStatusMsg({ type: "error", text: "Não foi possí­Â­vel gerar o token de conexão." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Erro ao conectar com o servidor." });
    }
    setLoadingToken(false);
  }

  async function handleSuccess(itemData: any) {
    setShowWidget(false);
    setSyncing(true);
    setStatusMsg(null);

    const res = await savePluggyItem(itemData.item.id);
    setSyncing(false);

    if (res?.success) {
      setStatusMsg({ type: "success", text: "Corretora conectada! Seus ativos foram sincronizados automaticamente." });
      loadItems();
    } else {
      setStatusMsg({ type: "error", text: res?.error || "Erro ao sincronizar ativos." });
    }
  }

  async function handleRemove(itemId: string) {
    if (!confirm("Deseja desconectar esta corretora?")) return;
    await removePluggyItem(itemId);
    loadItems();
    setStatusMsg({ type: "success", text: "Corretora desconectada com sucesso." });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #4f6ef7, #00d4aa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Landmark size={17} color="#fff" />
            </div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Open Finance í¢ÂÂ Conectar Corretora</h2>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-tertiary)", maxWidth: "480px" }}>
            Conecte sua corretora via <strong style={{ color: "var(--text-secondary)" }}>Pluggy</strong> e seus ativos serão importados automaticamente í¢ÂÂ sem digitar nada.
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ gap: "8px", flexShrink: 0 }}
          onClick={handleConnect}
          disabled={loadingToken || syncing}
        >
          {loadingToken ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Link2 size={15} />}
          {loadingToken ? "Aguarde..." : "Conectar Corretora"}
        </button>
      </div>

      {/* Status message */}
      {statusMsg && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "12px 16px", borderRadius: "10px",
          background: statusMsg.type === "success" ? "rgba(0,212,170,0.08)" : "rgba(255,80,80,0.08)",
          border: `1px solid ${statusMsg.type === "success" ? "rgba(0,212,170,0.2)" : "rgba(255,80,80,0.2)"}`,
        }}>
          {statusMsg.type === "success"
            ? <CheckCircle2 size={16} color="var(--green-primary)" />
            : <AlertCircle  size={16} color="var(--red-primary)"   />
          }
          <span style={{ fontSize: "0.85rem", color: statusMsg.type === "success" ? "var(--green-primary)" : "var(--red-primary)" }}>
            {statusMsg.text}
          </span>
        </div>
      )}

      {/* Syncing indicator */}
      {syncing && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(79,110,247,0.06)", border: "1px solid rgba(79,110,247,0.15)", borderRadius: "10px" }}>
          <Loader2 size={18} color="var(--blue-primary)" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>Sincronizando sua carteira...</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Importando ativos da corretora conectada</div>
          </div>
        </div>
      )}

      {/* Connected Institutions */}
      {connectedItems.length > 0 && (
        <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Corretoras Conectadas
          </div>
          {connectedItems.map((item) => (
            <div key={item.item_id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle2 size={17} color="var(--green-primary)" />
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {item.institution_name || "Corretora conectada"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
                    Sincronizado em {new Date(item.synced_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={async () => {
                    setSyncing(true);
                    await savePluggyItem(item.item_id);
                    setSyncing(false);
                    setStatusMsg({ type: "success", text: "Carteira re-sincronizada com sucesso!" });
                  }}
                  style={{ background: "none", border: "1px solid var(--border-default)", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem" }}
                >
                  <RefreshCw size={13} /> Re-sincronizar
                </button>
                <button
                  onClick={() => handleRemove(item.item_id)}
                  style={{ background: "none", border: "1px solid rgba(255,80,80,0.2)", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: "var(--red-primary)", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.78rem" }}
                >
                  <Trash2 size={13} /> Desconectar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supported institutions info */}
      {connectedItems.length === 0 && !syncing && (
        <div style={{ padding: "24px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "12px", textAlign: "center" }}>
          <Landmark size={32} color="var(--text-tertiary)" style={{ opacity: 0.4, marginBottom: "12px" }} />
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>Nenhuma corretora conectada</div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
            Compatí­Â­vel com XP, Clear, Rico, BTG, Nubank, Inter e mais de 30 instituiçí­Âµes
          </div>
        </div>
      )}

      {/* Pluggy Widget */}
      {showWidget && connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={true}
          onSuccess={handleSuccess}
          onError={(error) => {
            console.error("[Pluggy] Connection failed:", error);
            setShowWidget(false);
            setStatusMsg({ type: "error", text: "Falha na conexão com a corretora. Tente novamente." });
          }}
          onClose={() => setShowWidget(false)}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
