"use client";

import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, Clock, Globe } from "lucide-react";

export default function NewsClient({ initialNews }: { initialNews: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "4px" }}>Hub de Informações</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.9rem" }}>Notícias do mercado atualizadas em tempo real para assinantes.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {initialNews.map((news) => (
          <motion.a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            key={news.id}
            whileHover={{ y: -4 }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "16px",
              overflow: "hidden",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--blue-primary)40";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(79,110,247,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {/* Imagem (Se houver) */}
            <div style={{ width: "100%", height: "160px", background: `url(${news.imageUrl}) center/cover no-repeat`, borderBottom: "1px solid var(--border-subtle)" }} />

            <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-primary)", textTransform: "uppercase", background: "rgba(79,110,247,0.1)", padding: "4px 8px", borderRadius: "4px" }}>
                  {news.category}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={12} />
                  {new Date(news.publishedAt).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", lineHeight: 1.4 }}>
                {news.title}
              </h3>
              
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "16px", flex: 1 }}>
                {news.summary}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", marginTop: "auto" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Globe size={14} /> {news.source}
                </span>
                <ExternalLink size={16} color="var(--text-secondary)" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
