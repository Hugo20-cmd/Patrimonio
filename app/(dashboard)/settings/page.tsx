"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User, Image as ImageIcon, Bell, AlertTriangle } from "lucide-react";
import { getProfile, updateProfile, deleteAccount } from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import OneSignal from "react-onesignal";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [newsNotifications, setNewsNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm("CUIDADO: Você está prestes a excluir sua conta definitivamente. Todos os seus dados, lançamentos e XP serão perdidos para sempre. Deseja continuar?");
    if (!confirm1) return;
    
    const confirm2 = window.prompt("Para confirmar a exclusão, digite a palavra 'DELETAR' abaixo:");
    if (confirm2 !== "DELETAR") {
      alert("Exclusão cancelada.");
      return;
    }

    setIsDeleting(true);
    const result = await deleteAccount();
    if (result.error) {
      alert("Erro ao deletar conta: " + result.error);
      setIsDeleting(false);
    } else {
      await logout();
    }
  };

  useEffect(() => {
    // Load local settings
    const storedNewsPref = localStorage.getItem("news_notifications");
    if (storedNewsPref === "true") {
      setNewsNotifications(true);
    }

    getProfile().then((p) => {
      setProfile(p);
      if (p) {
        setName(p.name);
        setAvatarUrl(p.avatarUrl || "");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Save local preferences
    localStorage.setItem("news_notifications", newsNotifications.toString());

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccessMsg("Perfil e preferências atualizados com sucesso!");
      setAvatarUrl(result.avatarUrl);
    }
    // Refresh profile data from server to sync UI
    const refreshed = await getProfile();
    if (refreshed) {
      setProfile(refreshed);
      setName(refreshed.name);
      setAvatarUrl(refreshed.avatarUrl || "");
    }
    // Limpa a pré‑visualização, pois já temos a URL definitiva
    setPreviewUrl("");
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  if (!profile) return <div style={{ padding: "40px" }}>Carregando...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "600px" }}
    >
      <div>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Configurações do Perfil</h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Personalize a sua conta e foto de avatar.</p>
      </div>

      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "16px",
        padding: "32px",
      }}>
        {errorMsg && (
          <div style={{ background: "rgba(255,0,0,0.1)", color: "var(--red-primary)", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85rem", border: "1px solid rgba(255,0,0,0.2)" }}>
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div style={{ background: "rgba(0,212,170,0.1)", color: "var(--green-primary)", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85rem", border: "1px solid rgba(0,212,170,0.2)" }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Avatar Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "16px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "var(--gradient-blue)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", fontWeight: 700, color: "#fff",
              overflow: "hidden",
              border: "2px solid var(--bg-elevated)",
            }}>
              {(previewUrl || avatarUrl) ? (
                <img src={previewUrl || avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (name || "Inv").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <label htmlFor="avatar" style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600 }}>
                Foto de Perfil
              </label>
              <div style={{ position: "relative", display: "inline-block" }}>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  style={{
                    position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer"
                  }}
                />
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 16px", background: "var(--bg-elevated)",
                  border: "1px dashed var(--border-strong)", borderRadius: "8px",
                  color: "var(--text-secondary)", fontSize: "0.85rem", pointerEvents: "none"
                }}>
                  <ImageIcon size={16} />
                  Escolher nova imagem
                </div>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600 }}>Nome de Exibição</label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", color: "var(--text-tertiary)",
              }} />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%", padding: "12px 16px 12px 42px",
                  background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                  borderRadius: "10px", color: "var(--text-primary)", outline: "none",
                }}
              />
            </div>
          </div>

          {/* Email Field (Disabled) */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>E-mail (Apenas leitura)</label>
            <input
              type="email"
              value={profile.email}
              disabled
              style={{
                width: "100%", padding: "12px 16px",
                background: "var(--bg-primary)", border: "1px solid var(--border-subtle)",
                borderRadius: "10px", color: "var(--text-tertiary)", outline: "none", cursor: "not-allowed"
              }}
            />
          </div>

          {/* Notifications Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ padding: "8px", background: "rgba(0, 212, 170, 0.1)", borderRadius: "8px", color: "var(--green-primary)" }}>
                <Bell size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>Notícias e Alertas de Mercado</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", margin: "4px 0 0 0" }}>Receba informações sobre investimentos, ações e ETFs.</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={async () => {
                const newValue = !newsNotifications;
                setNewsNotifications(newValue);
                if (newValue) {
                  try {
                    // Try the native browser permission prompt first (most reliable)
                    if (OneSignal.Notifications && OneSignal.Notifications.requestPermission) {
                      await OneSignal.Notifications.requestPermission();
                    } else if (OneSignal.Slidedown && OneSignal.Slidedown.promptPush) {
                      await OneSignal.Slidedown.promptPush();
                    }
                    // Force OneSignal login just to be sure Ext ID is set
                    if (profile && profile.id) {
                      await OneSignal.login(profile.id);
                    }
                  } catch(e) {
                    console.error("OneSignal prompt erro:", e);
                  }
                }
              }}
              style={{
                width: "44px", height: "24px",
                borderRadius: "12px",
                background: newsNotifications ? "var(--green-primary)" : "var(--border-strong)",
                position: "relative",
                border: "none",
                cursor: "pointer",
                transition: "background 0.3s"
              }}
            >
              <div style={{
                width: "20px", height: "20px",
                background: "#fff",
                borderRadius: "50%",
                position: "absolute",
                top: "2px",
                left: newsNotifications ? "22px" : "2px",
                transition: "left 0.3s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }} />
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: "8px 16px", fontSize: "0.85rem", background: "transparent", border: "1px solid var(--border-subtle)" }}
              onClick={async () => {
                try {
                  const state = await OneSignal.User.PushSubscription.optedIn;
                  const token = await OneSignal.User.PushSubscription.id;
                  const extId = OneSignal.User.externalId;
                  const initErr = (window as any).oneSignalError || "Nenhum erro de inicio";
                  alert(`OneSignal Debug:\nOpted In: ${state}\nToken ID: ${token}\nExt ID: ${extId}\nApp ID: ${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID?.substring(0,8)}...\nInit Erro: ${initErr}`);
                } catch(e: any) {
                  alert("Debug error: " + e.message);
                }
              }}
            >
              Diagnóstico OneSignal
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              onClick={async () => {
                try {
                  const { createNotification } = await import('@/app/actions/notifications');
                  const res = await createNotification("🚀 Teste de Notificação", "As suas notificações estão funcionando perfeitamente no Patrimônio+", "info");
                  if (res && res.error) {
                    alert("Erro ao disparar: " + res.error);
                  } else if (res && res.warning) {
                    alert("Aviso: " + res.warning);
                  } else {
                    alert("Notificação enviada! Olhe a tela do seu aparelho e o sininho no topo.");
                  }
                } catch (e) {
                  console.error(e);
                  alert("Erro ao executar ação.");
                }
              }}
            >
              Disparar Notificação de Teste
            </button>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ gap: "8px" }}
            >
              <Save size={16} />
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>


      {/* Sync Retroactive XP Section */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "16px",
        padding: "32px",
        marginTop: "24px"
      }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "8px", color: "var(--text-primary)" }}>Sincronização de Conquistas</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
          Se você realizou compras antes do sistema de níveis ser implementado e não recebeu seu XP, clique no botão abaixo para o sistema recalcular todo o seu histórico.
        </p>
        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/sync');
              const data = await res.json();
              console.log("SYNC RESULT:", data);
              
              if (res.ok) {
                alert("Sincronização executada com sucesso! Seu novo XP total é: " + (data.result.totalCalculatedXp || 0));
                window.location.reload();
              } else {
                alert("Erro ao sincronizar.");
              }
            } catch (err) {
              alert("Erro na conexão.");
            }
          }}
          className="btn"
          style={{ background: "rgba(0,212,170,0.1)", color: "var(--green-primary)", border: "1px solid var(--green-primary)", padding: "10px 16px", fontWeight: 600 }}
        >
          Sincronizar Histórico e XP
        </button>
      </div>

      {/* Delete Account Section */}
      <div style={{
        background: "rgba(255, 77, 109, 0.05)",
        border: "1px solid rgba(255, 77, 109, 0.3)",
        borderRadius: "16px",
        padding: "32px",
        marginTop: "24px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <AlertTriangle size={24} color="var(--red-primary)" />
          <h2 style={{ fontSize: "1.2rem", margin: 0, color: "var(--red-primary)" }}>Excluir Conta</h2>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
          Esta ação é <strong>irreversível</strong>. Ao excluir sua conta, todos os seus dados de lançamentos, investimentos, metas e conquistas serão removidos permanentemente dos nossos servidores.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="btn"
          style={{ background: "var(--red-primary)", color: "#fff", border: "none", padding: "10px 16px", fontWeight: 600, opacity: isDeleting ? 0.7 : 1 }}
        >
          {isDeleting ? "Excluindo..." : "Excluir minha conta definitivamente"}
        </button>
      </div>

    </motion.div>
  );
}
