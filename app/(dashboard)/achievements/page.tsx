"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Lock, Zap, Flame, Trophy, Star } from "lucide-react";
import { mockAchievements } from "@/lib/mock-data";
import { getProfile } from "@/app/actions/profile";

export default function AchievementsPage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  const levelProgress = profile ? (profile.xp / profile.xpToNextLevel) * 100 : 0;

  const rarityColors = {
    comum: "var(--text-secondary)",
    raro: "var(--blue-primary)",
    épico: "var(--purple-primary)",
    lendário: "var(--orange-primary)",
  };

  const rarityGlows = {
    comum: "rgba(255,255,255,0.05)",
    raro: "rgba(79,110,247,0.15)",
    épico: "rgba(139,92,246,0.15)",
    lendário: "rgba(251,146,60,0.15)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}
    >
      <div>
        <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Conquistas</h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Sua jornada como investidor, recompensada.</p>
      </div>

      {/* User Level Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(79,110,247,0.1) 0%, rgba(0,212,170,0.05) 100%)",
        border: "1px solid var(--border-accent)",
        borderRadius: "16px",
        padding: "32px",
        display: "flex",
        alignItems: "center",
        gap: "32px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute", top: "-50px", left: "-50px",
          width: "200px", height: "200px",
          background: "radial-gradient(circle, rgba(79,110,247,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          width: "100px", height: "100px", borderRadius: "24px",
          background: "var(--gradient-blue)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "3rem", fontWeight: 900, color: "#fff",
          boxShadow: "0 10px 30px rgba(79,110,247,0.4)",
          position: "relative", zIndex: 1,
        }}>
          {profile?.level || 1}
        </div>

        <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "12px" }}>
            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "4px" }}>Investidor Iniciante</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <Flame size={14} color="var(--orange-primary)" fill="var(--orange-primary)" />
                Começando sua jornada agora
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--blue-primary)" }}>{profile?.xp || 0} XP</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>Faltam {(profile?.xpToNextLevel || 1000) - (profile?.xp || 0)} XP para Nível {(profile?.level || 1) + 1}</div>
            </div>
          </div>

          <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.3)", borderRadius: "999px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ height: "100%", background: "var(--gradient-blue)", borderRadius: "999px" }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Trophy size={18} color="var(--green-primary)" /> Suas Conquistas
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {mockAchievements.map((ach) => {
            const isUnlocked = false; // Bloquear todas as conquistas provisoriamente
            const color = rarityColors[ach.rarity as keyof typeof rarityColors];
            const glow = rarityGlows[ach.rarity as keyof typeof rarityGlows];

            return (
              <motion.div
                key={ach.id}
                whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
                style={{
                  background: isUnlocked ? "var(--bg-card)" : "var(--bg-primary)",
                  border: `1px solid ${isUnlocked ? color + "40" : "var(--border-subtle)"}`,
                  borderRadius: "16px",
                  padding: "20px",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  opacity: isUnlocked ? 1 : 0.6,
                  filter: isUnlocked ? "none" : "grayscale(100%)",
                }}
              >
                {isUnlocked && (
                  <div style={{
                    position: "absolute", top: 0, left: 0,
                    width: "100%", height: "100%",
                    background: `radial-gradient(circle at top left, ${glow} 0%, transparent 60%)`,
                    pointerEvents: "none",
                  }} />
                )}

                <div style={{
                  width: "56px", height: "56px", borderRadius: "14px",
                  background: isUnlocked ? glow : "var(--bg-elevated)",
                  border: `1px solid ${isUnlocked ? color + "50" : "var(--border-default)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.8rem",
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 1,
                }}>
                  {isUnlocked ? ach.icon : <Lock size={20} color="var(--text-tertiary)" />}
                </div>

                <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, color: isUnlocked ? "var(--text-primary)" : "var(--text-secondary)" }}>
                      {ach.title}
                    </h4>
                    {isUnlocked && (
                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--blue-primary)", display: "flex", alignItems: "center", gap: "2px" }}>
                        <Zap size={10} fill="currentColor" /> {ach.xpReward}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", lineHeight: 1.4, marginBottom: "8px" }}>
                    {ach.description}
                  </p>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.05em", padding: "2px 8px", border: `1px solid ${color}30`, borderRadius: "4px", background: `${color}10` }}>
                      {ach.rarity}
                    </div>
                    {isUnlocked && ach.unlockedAt && (
                      <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
                        {new Date(ach.unlockedAt).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
