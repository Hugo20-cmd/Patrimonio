const fs = require('fs');

// 1. simulator.ts
let simCode = fs.readFileSync('app/actions/simulator.ts', 'utf8');
const newFunc = `
export async function getSimulatorRanking() {
  const { data: simProfiles } = await supabaseAdmin.from('simulator_profiles').select('*')
  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, name, avatar_url')
  const { data: positions } = await supabaseAdmin.from('simulator_positions').select('*')
  
  if (!simProfiles || !profiles) return []

  const uniqueTickers = [...new Set((positions || []).map(p => p.ticker))]
  
  const { getMultipleQuotes } = await import('./market')
  const quotes = await getMultipleQuotes(uniqueTickers)
  const quotesMap = new Map(quotes.filter((q) => q && q.symbol).map((q) => [q.symbol, q.price]))

  const ranking = simProfiles.map(simProfile => {
    const userProfile = profiles.find(p => p.id === simProfile.user_id) || { name: 'Usuário', avatar_url: null }
    const userPositions = (positions || []).filter(p => p.user_id === simProfile.user_id)
    
    let investedValue = 0
    for (const pos of userPositions) {
      const currentPrice = quotesMap.get(pos.ticker) || pos.average_price
      investedValue += pos.quantity * currentPrice
    }
    
    const totalEquity = Number(simProfile.balance) + investedValue
    const returnPercent = ((totalEquity / 100000) - 1) * 100

    return {
      user_id: simProfile.user_id,
      name: userProfile.name,
      avatar_url: userProfile.avatar_url,
      balance: Number(simProfile.balance),
      totalEquity,
      returnPercent
    }
  })

  ranking.sort((a, b) => b.totalEquity - a.totalEquity)
  return ranking
}
`;
fs.writeFileSync('app/actions/simulator.ts', simCode + '\\n' + newFunc, 'utf8');

// 2. page.tsx
let pageCode = fs.readFileSync('app/(dashboard)/simulador/page.tsx', 'utf8');
pageCode = pageCode.replace(
  'import { getSimulatorAccount, getSimulatorPositions, getSimulatorHistory } from "@/app/actions/simulator";',
  'import { getSimulatorAccount, getSimulatorPositions, getSimulatorHistory, getSimulatorRanking } from "@/app/actions/simulator";'
);
pageCode = pageCode.replace(
  'const history = await getSimulatorHistory();',
  'const history = await getSimulatorHistory();\\n  const ranking = await getSimulatorRanking();'
);
pageCode = pageCode.replace(
  'initialQuotes={quotes}',
  'initialQuotes={quotes}\\n      initialRanking={ranking}'
);
fs.writeFileSync('app/(dashboard)/simulador/page.tsx', pageCode, 'utf8');

// 3. simulador-client.tsx
// To avoid messy replaces, we will do targeted string replacements.
let clientCode = fs.readFileSync('app/(dashboard)/simulador/simulador-client.tsx', 'utf8');

clientCode = clientCode.replace(
  'export default function SimuladorClient({ initialAccount, initialPositions, initialHistory, initialQuotes = [] }: any) {',
  'import { Trophy, Medal, Award } from "lucide-react";\\nexport default function SimuladorClient({ initialAccount, initialPositions, initialHistory, initialQuotes = [], initialRanking = [] }: any) {'
);

clientCode = clientCode.replace(
  'const [account, setAccount] = useState(initialAccount);',
  'const [activeTab, setActiveTab] = useState<"trade" | "ranking">("trade");\\n  const [account, setAccount] = useState(initialAccount);'
);

// Tabs
const headerEnd = '<p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Treine suas estratégias com dinheiro virtual e cotações reais.</p>\\n        </div>';
const headerNew = \`<p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Treine suas estratégias com dinheiro virtual e cotações reais.</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', background: 'var(--bg-card)', padding: '6px', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border-default)' }}>
            <button 
              onClick={() => setActiveTab('trade')}
              style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'trade' ? 'var(--blue-primary)' : 'transparent', color: activeTab === 'trade' ? '#fff' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Operar
            </button>
            <button 
              onClick={() => setActiveTab('ranking')}
              style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: activeTab === 'ranking' ? 'var(--blue-primary)' : 'transparent', color: activeTab === 'ranking' ? '#fff' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Trophy size={16} /> Ranking
            </button>
          </div>
        </div>\`;
clientCode = clientCode.replace(headerEnd, headerNew);

// Tab condition wrapper start
const gridStart = '{/* Ticker Tape Widgets or Overview Metrics */}';
const gridStartNew = \`{activeTab === 'ranking' ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Trophy color="var(--yellow-primary)" /> Ranking Global
            </h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '8px' }}>
              Os maiores investidores do simulador, baseados no patrimônio total (Caixa + Ativos).
            </p>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '0.85rem' }}>POSIÇÃO</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '0.85rem' }}>INVESTIDOR</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '0.85rem' }}>PATRIMÔNIO LÍQUIDO</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>RENTABILIDADE</th>
                </tr>
              </thead>
              <tbody>
                {initialRanking.map((user: any, index: number) => (
                  <tr key={user.user_id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.2rem', color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--text-secondary)' }}>
                        {index === 0 && <Trophy size={20} />}
                        {index === 1 && <Medal size={20} />}
                        {index === 2 && <Award size={20} />}
                        #{index + 1}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gradient-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.9rem', overflow: 'hidden' }}>
                          {user.avatar_url ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.name || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      R$ {user.totalEquity.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 800, color: user.returnPercent >= 0 ? 'var(--green-primary)' : 'var(--red-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        {user.returnPercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {user.returnPercent >= 0 ? '+' : ''}{user.returnPercent.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                ))}
                {initialRanking.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Nenhum dado encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
      {/* Ticker Tape Widgets or Overview Metrics */}\`;
clientCode = clientCode.replace(gridStart, gridStartNew);

// Tab condition wrapper end
const endTag = '    </motion.div>\\n  );\\n}';
const endTagNew = '        </>\\n      )}\\n    </motion.div>\\n  );\\n}';
clientCode = clientCode.replace(endTag, endTagNew);

fs.writeFileSync('app/(dashboard)/simulador/simulador-client.tsx', clientCode, 'utf8');

console.log('SUCCESS');
