"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ShieldCheck, Building, Rocket, Bitcoin, MapPin, Info } from "lucide-react";
import { addAsset } from "@/app/actions/assets";
import CryptoScreener from "@/components/market/CryptoScreener";

function EduTooltip({ title, text, value }: { title: string, text: string, value: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <div 
        style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-tertiary)", borderBottom: "1px dashed var(--text-tertiary)", textTransform: "uppercase" }}>
          {title}
        </span>
        <Info size={10} color="var(--blue-primary)" />
        
        {show && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
            background: "var(--bg-elevated)", border: "1px solid var(--blue-primary)",
            padding: "12px", borderRadius: "12px", width: "max-content", maxWidth: "220px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.8)", zIndex: 100,
            animation: "fadeIn 0.2s ease"
          }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-primary)", lineHeight: 1.5, margin: 0, fontWeight: 500, textAlign: "center" }}>
              {text}
            </p>
            <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: "10px", height: "10px", background: "var(--bg-elevated)", borderLeft: "1px solid var(--blue-primary)", borderTop: "1px solid var(--blue-primary)", rotate: "45deg" }} />
          </div>
        )}
      </div>
      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)" }}>{value}</span>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translate(-50%, 5px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
    </div>
  );
}

const MACRO_DATA = [
  { label: "Dí³lar Comercial", value: "R$ 5,06", desc: "Moeda forte mundial. Protege seu patrimônio contra a inflação local e crises." },
  { label: "Taxa Selic", value: "10,50%", desc: "A taxa básica de juros do Brasil. Se a Selic sobe, a Renda Fixa paga mais." },
  { label: "IPCA (Inflação)", value: "4,50%", desc: "Mede o custo de vida. Seu dinheiro precisa render sempre MAIS que o IPCA." },
  { label: "Euro", value: "R$ 5,45", desc: "A moeda oficial de 20 paí­ses da Europa. Forte reserva de valor." }
];

const EDUCATIONAL_COLLECTIONS = [
  {
    id: "iniciantes",
    title: "O \"Feijão com Arroz\" (Para Iniciantes)",
    description: "ETFs que compram dezenas de empresas de uma vez sí³. O jeito mais fácil, barato e seguro de começar a investir sem ter que escolher.",
    icon: <ShieldCheck size={24} color="var(--green-primary)" />,
    assets: [
      { ticker: "BOVA11", name: "iShares Ibovespa", reason: "Compra as 80 maiores empresas do Brasil de uma sí³ vez.", tags: ["Brasil", "Diversificado"], fundamentals: { var12m: "+12,5%" } },
      { ticker: "IVVB11", name: "iShares S&P 500", reason: "Investe nas 500 maiores empresas dos Estados Unidos. Proteção em dí³lar.", tags: ["EUA", "Dí³lar"], fundamentals: { var12m: "+24,1%" } },
    ]
  },
  {
    id: "renda",
    title: "Construindo Renda (Imí³veis e Dividendos)",
    description: "Ativos focados em te pagar dinheiro limpo na conta todo míªs (como se fossem aluguéis).",
    icon: <Building size={24} color="var(--blue-primary)" />,
    assets: [
      { ticker: "MXRF11", name: "Maxi Renda FII", reason: "Fundo imobiliário muito popular que paga dividendos todos os meses.", tags: ["FII", "Renda Mensal"], fundamentals: { dy: "12,4%", pvp: "1,03", var12m: "+5,2%" } },
      { ticker: "HGLG11", name: "CSHG Logí­stica", reason: "Dono de galpíµes logí­sticos alugados para grandes empresas no Brasil.", tags: ["FII", "Imí³veis"], fundamentals: { dy: "9,1%", pvp: "0,95", var12m: "+8,7%" } },
      { ticker: "BBAS3", name: "Banco do Brasil", reason: "Banco sí³lido famoso por distribuir í³timos lucros aos sí³cios.", tags: ["Ação", "Dividendos"], fundamentals: { dy: "11,2%", pvp: "0,88", var12m: "+18,5%" } }
    ]
  },
  {
    id: "reits",
    title: "REITs (Imí³veis em Dí³lar)",
    description: "Receba 'aluguéis' em dí³lar investindo nos maiores galpíµes, shoppings e hospitais dos Estados Unidos.",
    icon: <MapPin size={24} color="#ff8c00" />,
    assets: [
      { ticker: "O", name: "Realty Income", reason: "Conhecido como 'The Monthly Dividend Company', paga dividendos todo míªs nos EUA.", tags: ["REIT", "Mensal"], fundamentals: { dy: "5,8%", pvp: "1,41", var12m: "+13,8%" } },
      { ticker: "PLD", name: "Prologis", reason: "Lí­der global em galpíµes logí­sticos, alugando espaço para gigantes como Amazon.", tags: ["REIT", "Logí­stica"], fundamentals: { dy: "2,8%", pvp: "2,29", var12m: "+36,6%" } }
    ]
  },
  {
    id: "tecnologia",
    title: "Gigantes Globais (Crescimento)",
    description: "Seja sí³cio das empresas que estão dominando a inteligíªncia artificial e a internet.",
    icon: <Rocket size={24} color="var(--purple-primary)" />,
    assets: [
      { ticker: "AAPL", name: "Apple Inc.", reason: "A fabricante do iPhone e uma das empresas mais valiosas do planeta.", tags: ["Ação EUA", "Tecnologia"], fundamentals: { mcap: "US$ 3.1T", var12m: "+15,2%" } },
      { ticker: "NVDA", name: "Nvidia Corp.", reason: "A rainha da inteligíªncia artificial. Fabrica os chips mais procurados do mundo.", tags: ["Ação EUA", "IA"], fundamentals: { mcap: "US$ 2.8T", var12m: "+210%" } },
    ]
  },
  {
    id: "cripto",
    title: "Criptomoedas (A Nova Economia)",
    description: "Ativos digitais descentralizados. Altí­ssimo potencial de crescimento, mas com altí­ssima volatilidade.",
    icon: <Bitcoin size={24} color="#f7931a" />,
    assets: [
      { ticker: "BTC", name: "Bitcoin", reason: "O ouro digital. A primeira, mais segura e maior criptomoeda do mundo.", tags: ["Cripto", "Reserva"], fundamentals: { mcap: "US$ 1.3T", var12m: "+120%" } },
      { ticker: "ETH", name: "Ethereum", reason: "A base da internet descentralizada. Usada para contratos inteligentes e Web3.", tags: ["Cripto", "Web3"], fundamentals: { mcap: "US$ 400B", var12m: "+85%" } }
    ]
  }
];

export default function AtivosIndexPage() {
  const [ticker, setTicker] = useState("");
  const [addingTicker, setAddingTicker] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      router.push(`/ativos/${ticker.trim().toUpperCase()}`);
    }
  };

  const handleAddAsset = async (e: React.MouseEvent, assetTicker: string) => {
    e.stopPropagation(); 
    setAddingTicker(assetTicker);
    try {
      const formData = new FormData();
      formData.append("ticker", assetTicker);
      formData.append("name", assetTicker);
      formData.append("type", "stock");
      formData.append("quantity", "1");
      formData.append("averagePrice", "10.00"); 
      
      const res = await addAsset(formData);
      if (res.error) alert(res.error);
      else {
        alert(`${assetTicker} adicionado í  sua carteira com sucesso!`);
      }
    } catch (err) {
      alert("Erro ao adicionar ativo.");
    } finally {
      setAddingTicker(null);
    }
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      
      {/* MACRO PANEL */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "32px", paddingBottom: "8px" }}>
        {MACRO_DATA.map(macro => (
          <div key={macro.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", borderRadius: "16px", padding: "16px 20px", minWidth: "200px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <EduTooltip title={macro.label} text={macro.desc} value={macro.value} />
          </div>
        ))}
      </div>

      {/* Header Search */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px", background: "var(--bg-card)", padding: "32px", borderRadius: "24px", border: "1px solid var(--border-default)" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800 }}>Explorar Mercado</h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "1.05rem", maxWidth: "600px", lineHeight: 1.5 }}>
          Não sabe por onde começar? Explore nossas Trilhas Educativas abaixo para descobrir os melhores ativos para o seu perfil. Ou busque qualquer ticker global diretamente na barra.
        </p>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "500px", marginTop: "8px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              type="text"
              placeholder="Buscar um ticker especí­fico (ex: PETR4, NVDA)..."
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: "12px", border: "1px solid var(--border-accent)", background: "rgba(0,0,0,0.2)", color: "var(--text-primary)", fontSize: "1rem", outline: "none", transition: "border-color 0.2s" }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: "0 24px" }} disabled={!ticker.trim()}>
            Buscar
          </button>
        </form>
      </div>

      {/* Educational Collections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
        {EDUCATIONAL_COLLECTIONS.map(collection => (
          <section key={collection.id}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "24px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--bg-elevated)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {collection.icon}
              </div>
              <div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "4px" }}>{collection.title}</h2>
                <p style={{ color: "var(--text-tertiary)", fontSize: "0.95rem", lineHeight: 1.5 }}>{collection.description}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {collection.assets.map(asset => (
                <div
                  key={asset.ticker}
                  onClick={() => router.push(`/ativos/${asset.ticker}`)}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "20px",
                    padding: "24px",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                    display: "flex", flexDirection: "column",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "var(--blue-primary)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "var(--border-default)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-primary)" }}>{asset.ticker}</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>{asset.name}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {asset.tags.map(tag => (
                      <span key={tag} style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: "8px", color: "var(--text-tertiary)", fontWeight: 700 }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Fundamentals Strip */}
                  <div style={{ display: "flex", gap: "16px", marginBottom: "16px", background: "var(--bg-elevated)", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
                    {asset.fundamentals.dy && (
                      <EduTooltip title="DY" text="Dividend Yield: A porcentagem que este ativo te devolveu em formato de lucro/aluguel nos íºltimos 12 meses. Dinheiro no seu bolso." value={asset.fundamentals.dy} />
                    )}
                    {asset.fundamentals.pvp && (
                      <EduTooltip title="P/VP" text="Preço / Valor Patrimonial: Mostra se está caro ou barato. P/VP = 1 é preço justo. Abaixo de 1 significa que está com desconto!" value={asset.fundamentals.pvp} />
                    )}
                    {asset.fundamentals.mcap && (
                      <EduTooltip title="Valor de Mercado" text="Market Cap: Qual o tamanho total e valor dessa empresa hoje no mercado mundial." value={asset.fundamentals.mcap} />
                    )}
                    {asset.fundamentals.var12m && (
                      <EduTooltip title="Variação (1A)" text="O quanto a cotação (preço do ativo) subiu ou caiu no perí­odo de 1 ano." value={asset.fundamentals.var12m} />
                    )}
                  </div>

                  {/* Educational Reason */}
                  <div style={{ background: "rgba(79,110,247,0.05)", borderLeft: "3px solid var(--blue-primary)", padding: "12px 16px", borderRadius: "0 8px 8px 0", marginBottom: "24px", flex: 1 }}>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      <strong style={{ color: "var(--blue-primary)", display: "block", marginBottom: "4px", fontSize: "0.75rem", textTransform: "uppercase" }}>Por que investir?</strong>
                      {asset.reason}
                    </p>
                  </div>
                  
                  {/* Action */}
                  <button
                    onClick={(e) => handleAddAsset(e, asset.ticker)}
                    disabled={addingTicker === asset.ticker}
                    className="btn btn-secondary"
                    style={{
                      width: "100%", justifyContent: "center", gap: "8px",
                      background: "transparent", color: "var(--text-primary)",
                      border: "1px solid var(--border-default)", padding: "12px",
                      borderRadius: "12px"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0, 212, 170, 0.1)"; e.currentTarget.style.color = "var(--green-primary)"; e.currentTarget.style.borderColor = "var(--green-primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
                  >
                    {addingTicker === asset.ticker ? (
                      "Adicionando..."
                    ) : (
                      <>
                        <Plus size={16} /> Adicionar Rápido
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Crypto Screener */}
      <CryptoScreener />
    </div>
  );
}
