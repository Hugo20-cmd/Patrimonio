"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User, Image as ImageIcon, Bell, AlertTriangle, Copy, Sparkles, Medal, Award, Target, Trophy, Star, Globe } from "lucide-react";
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

    localStorage.setItem("news_notifications", newsNotifications.toString());

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccessMsg("Perfil atualizado com sucesso!");
      setAvatarUrl(result.avatarUrl);
    }
    const refreshed = await getProfile();
    if (refreshed) {
      setProfile(refreshed);
      setName(refreshed.name);
      setAvatarUrl(refreshed.avatarUrl || "");
    }
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

  const handleCopyReferral = () => {
    const text = `Estou usando a Patrimônio+ para organizar meus investimentos e automatizar o controle do meu dinheiro com inteligência artificial. Cadastre-se pelo meu link: https://patrimoniomais.com.br/invite/${profile?.id}`;
    navigator.clipboard.writeText(text);
    alert("Texto copiado com sucesso! Agora é só colar no WhatsApp.");
  };

  if (!profile) return <div style={{ padding: "40px" }}>Carregando Perfil...</div>;

  // Mock Badges Logic for Gamification
  const badges = [
    { id: 1, icon: <Medal size={28} color="#FFD700" />, title: "Primeiro Aporte", desc: "Você começou sua jornada.", unlocked: true },
    { id: 2, icon: <Globe size={28} color="#00F0FF" />, title: "Investidor Global", desc: "Cadastrou ativos internacionais.", unlocked: true },
    { id: 3, icon: <Award size={28} color="#8A2BE2" />, title: "Visionário", desc: "Mais de 10 conexões via Open Finance.", unlocked: false },
    { id: 4, icon: <Trophy size={28} color="#00FF66" />, title: "Mestre dos Dividendos", desc: "Ultrapassou a marca de R$ 1.000 em renda passiva.", unlocked: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "800px", margin: "0 auto", paddingBottom: "80px" }}
    >
      <div>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "8px", background: "linear-gradient(90deg, #fff, #a5a5a5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Seu Perfil</h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "1rem" }}>Acompanhe seu status, conquistas e configurações pessoais.</p>
      </div>

      {/* 1. CARTÃO PATRIMÔNIO+ BLACK (INDIQUE E GANHE) */}
      <div style={{
        background: "linear-gradient(135deg, #111 0%, #2a2a2a 100%)",
        borderRadius: "20px",
        padding: "32px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)",
        border: "1px solid #444",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "220px"
      }}>
        {/* Metal Texture & Shine */}
        <div style={{ position: "absolute", top: 0, left: "-100%", width: "50%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", transform: "skewX(-20deg)", animation: "shine 6s infinite" }} />
        <div style={{ position: "absolute", top: "-50%", right: "-20%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(138,43,226,0.15) 0%, transparent 70%)", borderRadius: "50%" }} />
        
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Sparkles size={20} color="#FFD700" />
              <span style={{ color: "#FFD700", fontWeight: 700, letterSpacing: "2px", fontSize: "0.9rem" }}>MEMBRO EXCLUSIVO</span>
            </div>
            <h2 style={{ color: "#fff", fontSize: "1.8rem", margin: 0, fontWeight: 300, letterSpacing: "1px" }}>Patrimônio+ <strong style={{ fontWeight: 800 }}>Black</strong></h2>
          </div>
          <div style={{ width: "50px", height: "30px", background: "linear-gradient(135deg, #FFD700, #B8860B)", borderRadius: "6px", boxShadow: "inset 0 1px 3px rgba(255,255,255,0.5)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "40px" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 4px 0" }}>Titular da Conta</p>
            <p style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", margin: 0 }}>{profile.name || "INVESTIDOR"}</p>
          </div>
          
          <button 
            onClick={handleCopyReferral}
            style={{ 
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", 
              padding: "10px 20px", color: "#fff", fontWeight: 600, cursor: "pointer", 
              display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(10px)",
              transition: "all 0.2s"
            }}
            className="hover-glow"
          >
            <Copy size={16} /> Indique e Ganhe
          </button>
        </div>

        <style jsx>{`
          @keyframes shine {
            0% { left: -100%; }
            20% { left: 200%; }
            100% { left: 200%; }
          }
          .hover-glow:hover {
            background: rgba(255,255,255,0.2) !important;
            box-shadow: 0 0 15px rgba(255,255,255,0.3);
          }
        `}</style>
      </div>

      {/* 2. MURAL DE CONQUISTAS (GAMIFICAÇÃO) */}
      <div>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Star color="#FFD700" size={24} /> Conquistas Desbloqueadas
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
          {badges.map(badge => (
            <div key={badge.id} style={{
              background: badge.unlocked ? "var(--bg-card)" : "rgba(255,255,255,0.02)",
              border: badge.unlocked ? "1px solid var(--border-default)" : "1px dashed var(--border-subtle)",
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center",
              opacity: badge.unlocked ? 1 : 0.5,
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.2s",
              cursor: "default"
            }}>
              {badge.unlocked && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "50%", height: "4px", background: "var(--gradient-blue)", borderRadius: "0 0 4px 4px" }} />}
              <div style={{ 
                width: "64px", height: "64px", borderRadius: "50%", margin: "0 auto 12px",
                background: badge.unlocked ? "var(--bg-elevated)" : "transparent",
                border: badge.unlocked ? "none" : "2px solid var(--border-subtle)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: badge.unlocked ? "0 4px 15px rgba(0,0,0,0.2)" : "none"
              }}>
                {badge.icon}
              </div>
              <h3 style={{ fontSize: "0.95rem", margin: "0 0 8px 0", color: badge.unlocked ? "var(--text-primary)" : "var(--text-tertiary)" }}>{badge.title}</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", margin: 0, lineHeight: "1.4" }}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DADOS PESSOAIS E CONFIGURAÇÕES (FORMULÁRIO) */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "16px",
        padding: "32px",
      }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "24px", color: "var(--text-primary)" }}>Dados Pessoais</h2>
        
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
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "var(--gradient-blue)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", fontWeight: 700, color: "#fff",
              overflow: "hidden",
              border: "2px solid var(--border-default)",
            }}>
              {(previewUrl || avatarUrl) ? (
                <img src={previewUrl || avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (name || "Inv").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <label htmlFor="avatar" style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600 }}>Foto de Perfil</label>
              <div style={{ position: "relative", display: "inline-block" }}>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  style={{ position: "absolute", width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                />
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 16px", background: "var(--bg-elevated)",
                  border: "1px dashed var(--border-strong)", borderRadius: "8px",
                  color: "var(--text-secondary)", fontSize: "0.85rem", pointerEvents: "none"
                }}>
                  <ImageIcon size={16} /> Escolher nova imagem
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Name Field */}
            <div>
              <label htmlFor="name" style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600 }}>Nome de Exibição</label>
              <div style={{ position: "relative" }}>
                <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "12px 16px 12px 42px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "10px", color: "var(--text-primary)", outline: "none" }}
                />
              </div>
            </div>

            {/* Email Field (Disabled) */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>E-mail (Acesso Seguro)</label>
              <input
                type="email"
                value={profile.email}
                disabled
                style={{ width: "100%", padding: "12px 16px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-subtle)", borderRadius: "10px", color: "var(--text-tertiary)", outline: "none", cursor: "not-allowed" }}
              />
            </div>
          </div>

          {/* Notifications Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ padding: "8px", background: "rgba(0, 212, 170, 0.1)", borderRadius: "8px", color: "var(--green-primary)" }}>
                <Bell size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>Notícias e Alertas de Mercado</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", margin: "4px 0 0 0" }}>Receba insights e alertas de dividendos na tela do celular.</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={async () => {
                const newValue = !newsNotifications;
                setNewsNotifications(newValue);
                if (newValue) {
                  try {
                    if (OneSignal.Notifications && OneSignal.Notifications.requestPermission) {
                      await OneSignal.Notifications.requestPermission();
                    } else if (OneSignal.Slidedown && OneSignal.Slidedown.promptPush) {
                      await OneSignal.Slidedown.promptPush();
                    }
                    if (profile && profile.id) {
                      await OneSignal.login(profile.id);
                    }
                  } catch(e) {
                    console.error("OneSignal prompt erro:", e);
                  }
                }
              }}
              style={{
                width: "44px", height: "24px", borderRadius: "12px",
                background: newsNotifications ? "var(--green-primary)" : "var(--border-strong)",
                position: "relative", border: "none", cursor: "pointer", transition: "background 0.3s"
              }}
            >
              <div style={{
                width: "20px", height: "20px", background: "#fff", borderRadius: "50%",
                position: "absolute", top: "2px", left: newsNotifications ? "22px" : "2px",
                transition: "left 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }} />
            </button>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: "8px" }}>
              <Save size={16} /> {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Account Section */}
      <div style={{
        background: "rgba(255, 77, 109, 0.05)",
        border: "1px solid rgba(255, 77, 109, 0.3)",
        borderRadius: "16px",
        padding: "32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <AlertTriangle size={24} color="var(--red-primary)" />
          <h2 style={{ fontSize: "1.2rem", margin: 0, color: "var(--red-primary)" }}>Zona de Risco</h2>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
          Esta ação é irreversível. Todos os seus dados de patrimônio e conexões Open Finance serão excluídos.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="btn"
          style={{ background: "transparent", color: "var(--red-primary)", border: "1px solid var(--red-primary)", padding: "10px 16px", fontWeight: 600, opacity: isDeleting ? 0.7 : 1 }}
        >
          {isDeleting ? "Excluindo..." : "Excluir minha conta definitivamente"}
        </button>
      </div>

    </motion.div>
  );
}
