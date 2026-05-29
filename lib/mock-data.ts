// ============================================
// PATRIMÔNIO+ — Mock Data Ultra Realista
// Preparado para substituição com APIs reais:
// Finnhub | Alpha Vantage | Yahoo Finance
// ============================================

export type AssetType = 'ETF' | 'stock' | 'FII' | 'treasury' | 'fixed_income';

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: 'BRL' | 'USD';
  sector?: string;
  broker?: string;
  purchaseDate?: string;
  logoUrl?: string;
}

export interface DividendRecord {
  id: string;
  ticker: string;
  name: string;
  amount: number;
  yieldPercent: number;
  paymentDate: string;
  type: 'dividendo' | 'JCP' | 'rendimento';
}

export interface PatrimonioDataPoint {
  date: string;
  value: number;
  invested: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'patrimônio' | 'reserva' | 'aposentadoria' | 'objetivo';
  color: string;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  xpReward: number;
  rarity: 'comum' | 'raro' | 'épico' | 'lendário';
}

// ============================================
// PORTFÓLIO — Ativos mockados ultra realistas
// ============================================
export const mockAssets: Asset[] = [
  // ETFs Nacionais
  {
    id: '1',
    ticker: 'IVVB11',
    name: 'iShares S&P 500 ETF',
    type: 'ETF',
    quantity: 45,
    averagePrice: 312.40,
    currentPrice: 358.72,
    currency: 'BRL',
    sector: 'ETF Internacional',
    broker: 'XP Investimentos',
    purchaseDate: '2023-03-15',
  },
  {
    id: '2',
    ticker: 'BOVA11',
    name: 'iShares Ibovespa ETF',
    type: 'ETF',
    quantity: 120,
    averagePrice: 108.20,
    currentPrice: 115.84,
    currency: 'BRL',
    sector: 'ETF Nacional',
    broker: 'XP Investimentos',
    purchaseDate: '2023-01-10',
  },
  {
    id: '3',
    ticker: 'SMAL11',
    name: 'iShares Small Cap ETF',
    type: 'ETF',
    quantity: 80,
    averagePrice: 92.30,
    currentPrice: 98.45,
    currency: 'BRL',
    sector: 'ETF Nacional',
    broker: 'Clear',
    purchaseDate: '2023-06-20',
  },
  {
    id: '4',
    ticker: 'HASH11',
    name: 'Hashdex Nasdaq Crypto ETF',
    type: 'ETF',
    quantity: 30,
    averagePrice: 28.50,
    currentPrice: 34.18,
    currency: 'BRL',
    sector: 'ETF Crypto',
    broker: 'Rico',
    purchaseDate: '2024-01-05',
  },
  // Ações
  {
    id: '5',
    ticker: 'WEGE3',
    name: 'WEG S.A.',
    type: 'stock',
    quantity: 150,
    averagePrice: 38.70,
    currentPrice: 47.32,
    currency: 'BRL',
    sector: 'Industria',
    broker: 'XP Investimentos',
    purchaseDate: '2022-11-12',
  },
  {
    id: '6',
    ticker: 'ITUB4',
    name: 'Itaú Unibanco',
    type: 'stock',
    quantity: 200,
    averagePrice: 24.80,
    currentPrice: 32.15,
    currency: 'BRL',
    sector: 'Financeiro',
    broker: 'Nu Invest',
    purchaseDate: '2022-08-20',
  },
  {
    id: '7',
    ticker: 'PETR4',
    name: 'Petrobras',
    type: 'stock',
    quantity: 300,
    averagePrice: 31.20,
    currentPrice: 36.88,
    currency: 'BRL',
    sector: 'Petróleo & Gás',
    broker: 'XP Investimentos',
    purchaseDate: '2023-02-08',
  },
  {
    id: '8',
    ticker: 'MXRF11',
    name: 'Maxi Renda FII',
    type: 'FII',
    quantity: 500,
    averagePrice: 9.82,
    currentPrice: 10.54,
    currency: 'BRL',
    sector: 'FII Papel',
    broker: 'Clear',
    purchaseDate: '2022-12-15',
  },
  {
    id: '9',
    ticker: 'HGLG11',
    name: 'CSHG Logística FII',
    type: 'FII',
    quantity: 80,
    averagePrice: 142.50,
    currentPrice: 158.30,
    currency: 'BRL',
    sector: 'FII Logística',
    broker: 'XP Investimentos',
    purchaseDate: '2023-04-10',
  },
  {
    id: '10',
    ticker: 'KNRI11',
    name: 'Kinea Renda Imobiliária',
    type: 'FII',
    quantity: 60,
    averagePrice: 152.80,
    currentPrice: 168.92,
    currency: 'BRL',
    sector: 'FII Híbrido',
    broker: 'Nu Invest',
    purchaseDate: '2023-07-22',
  },
  // Tesouro Direto
  {
    id: '11',
    ticker: 'SELIC2027',
    name: 'Tesouro Selic 2027',
    type: 'treasury',
    quantity: 1,
    averagePrice: 14850.00,
    currentPrice: 15420.50,
    currency: 'BRL',
    sector: 'Renda Fixa',
    broker: 'Tesouro Direto',
    purchaseDate: '2023-01-30',
  },
  {
    id: '12',
    ticker: 'IPCA2035',
    name: 'Tesouro IPCA+ 2035',
    type: 'treasury',
    quantity: 1,
    averagePrice: 4200.00,
    currentPrice: 4580.80,
    currency: 'BRL',
    sector: 'Renda Fixa',
    broker: 'Tesouro Direto',
    purchaseDate: '2023-03-20',
  },
];

// ============================================
// CÁLCULOS DE PORTFÓLIO
// ============================================
export function calcPortfolioMetrics(assets: Asset[]) {
  const totalInvested = assets.reduce((sum, a) => sum + a.quantity * a.averagePrice, 0);
  const totalCurrent = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
  const totalProfit = totalCurrent - totalInvested;
  const totalProfitPercent = (totalProfit / totalInvested) * 100;

  const byType: Record<string, number> = {};
  for (const a of assets) {
    const val = a.quantity * a.currentPrice;
    byType[a.type] = (byType[a.type] || 0) + val;
  }

  return {
    totalInvested,
    totalCurrent,
    totalProfit,
    totalProfitPercent,
    byType,
  };
}

// ============================================
// DIVIDENDOS — Histórico mockado
// ============================================
export const mockDividends: DividendRecord[] = [
  { id: '1', ticker: 'MXRF11', name: 'Maxi Renda', amount: 527.50, yieldPercent: 10.2, paymentDate: '2026-05-14', type: 'rendimento' },
  { id: '2', ticker: 'HGLG11', name: 'CSHG Logística', amount: 384.00, yieldPercent: 8.5, paymentDate: '2026-05-10', type: 'rendimento' },
  { id: '3', ticker: 'KNRI11', name: 'Kinea Renda', amount: 312.00, yieldPercent: 7.8, paymentDate: '2026-05-08', type: 'rendimento' },
  { id: '4', ticker: 'ITUB4', name: 'Itaú Unibanco', amount: 460.80, yieldPercent: 6.4, paymentDate: '2026-04-30', type: 'dividendo' },
  { id: '5', ticker: 'PETR4', name: 'Petrobras', amount: 1080.00, yieldPercent: 12.1, paymentDate: '2026-04-25', type: 'dividendo' },
  { id: '6', ticker: 'WEGE3', name: 'WEG S.A.', amount: 183.00, yieldPercent: 2.3, paymentDate: '2026-04-18', type: 'JCP' },
  { id: '7', ticker: 'MXRF11', name: 'Maxi Renda', amount: 527.50, yieldPercent: 10.2, paymentDate: '2026-04-12', type: 'rendimento' },
  { id: '8', ticker: 'HGLG11', name: 'CSHG Logística', amount: 384.00, yieldPercent: 8.5, paymentDate: '2026-04-10', type: 'rendimento' },
  { id: '9', ticker: 'PETR4', name: 'Petrobras', amount: 1020.00, yieldPercent: 11.8, paymentDate: '2026-03-25', type: 'dividendo' },
  { id: '10', ticker: 'KNRI11', name: 'Kinea Renda', amount: 312.00, yieldPercent: 7.8, paymentDate: '2026-03-08', type: 'rendimento' },
  { id: '11', ticker: 'ITUB4', name: 'Itaú Unibanco', amount: 440.00, yieldPercent: 6.1, paymentDate: '2026-03-01', type: 'dividendo' },
  { id: '12', ticker: 'MXRF11', name: 'Maxi Renda', amount: 505.00, yieldPercent: 9.8, paymentDate: '2026-03-14', type: 'rendimento' },
];

// Dividendos agrupados por mês
export const mockDividendsByMonth = [
  { month: 'Dez', value: 1820 },
  { month: 'Jan', value: 2140 },
  { month: 'Fev', value: 1980 },
  { month: 'Mar', value: 2278 },
  { month: 'Abr', value: 2635 },
  { month: 'Mai', value: 2969 },
];

// ============================================
// PATRIMÔNIO — Evolução histórica
// ============================================
export const mockPatrimonioHistory: PatrimonioDataPoint[] = [
  { date: 'Jun/24', value: 42000, invested: 38000 },
  { date: 'Jul/24', value: 44500, invested: 40000 },
  { date: 'Ago/24', value: 43800, invested: 41500 },
  { date: 'Set/24', value: 46200, invested: 43000 },
  { date: 'Out/24', value: 49800, invested: 45000 },
  { date: 'Nov/24', value: 51200, invested: 46500 },
  { date: 'Dez/24', value: 54600, invested: 48000 },
  { date: 'Jan/25', value: 57400, invested: 50000 },
  { date: 'Fev/25', value: 59200, invested: 51500 },
  { date: 'Mar/25', value: 62800, invested: 53000 },
  { date: 'Abr/25', value: 65100, invested: 54500 },
  { date: 'Mai/25', value: 68450, invested: 56000 },
];

// ============================================
// METAS FINANCEIRAS
// ============================================
export const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Liberdade Financeira',
    description: 'Patrimônio que gera R$10.000/mês em dividendos',
    targetAmount: 1500000,
    currentAmount: 68450,
    deadline: '2035-12-31',
    category: 'aposentadoria',
    color: '#00d4aa',
  },
  {
    id: '2',
    title: 'Reserva de Emergência',
    description: '12 meses de gastos em renda fixa',
    targetAmount: 36000,
    currentAmount: 28400,
    deadline: '2025-12-31',
    category: 'reserva',
    color: '#4f6ef7',
  },
  {
    id: '3',
    title: 'Primeiro R$100K',
    description: 'Marco patrimonial de 100 mil reais',
    targetAmount: 100000,
    currentAmount: 68450,
    deadline: '2026-06-30',
    category: 'patrimônio',
    color: '#fb923c',
  },
  {
    id: '4',
    title: 'Viagem Internacional',
    description: 'Fundo para viagem à Europa com a família',
    targetAmount: 25000,
    currentAmount: 14200,
    deadline: '2026-11-30',
    category: 'objetivo',
    color: '#8b5cf6',
  },
];

// ============================================
// GAMIFICAÇÃO — Conquistas
// ============================================
export const mockAchievements: Achievement[] = [
  {
    id: '1',
    key: 'primeiro_etf',
    title: 'Primeiro ETF',
    description: 'Comprou seu primeiro ETF',
    icon: '🚀',
    unlockedAt: '2023-01-10',
    xpReward: 100,
    rarity: 'comum',
  },
  {
    id: '2',
    key: '10k_investido',
    title: 'R$10.000 Investidos',
    description: 'Alcançou R$10.000 em patrimônio',
    icon: '💎',
    unlockedAt: '2023-06-15',
    xpReward: 500,
    rarity: 'raro',
  },
  {
    id: '3',
    key: '12_meses',
    title: 'Maratonista',
    description: '12 meses consecutivos investindo',
    icon: '🏆',
    unlockedAt: '2024-01-10',
    xpReward: 1000,
    rarity: 'épico',
  },
  {
    id: '4',
    key: 'primeiro_dividendo',
    title: 'Renda Passiva',
    description: 'Recebeu seu primeiro dividendo',
    icon: '💰',
    unlockedAt: '2022-12-15',
    xpReward: 200,
    rarity: 'comum',
  },
  {
    id: '5',
    key: '50k_patrimonio',
    title: 'Meio Caminho',
    description: 'Patrimônio ultrapassou R$50.000',
    icon: '⭐',
    unlockedAt: '2025-01-20',
    xpReward: 750,
    rarity: 'raro',
  },
  {
    id: '6',
    key: 'diversificador',
    title: 'Diversificador',
    description: 'Possui 5 tipos de ativos diferentes',
    icon: '🎯',
    unlockedAt: '2023-08-01',
    xpReward: 300,
    rarity: 'comum',
  },
  {
    id: '7',
    key: '100k_lendario',
    title: 'Centenário',
    description: 'Patrimônio ultrapassou R$100.000',
    icon: '👑',
    xpReward: 2000,
    rarity: 'lendário',
  },
  {
    id: '8',
    key: 'rei_dividendos',
    title: 'Rei dos Dividendos',
    description: 'Recebeu mais de R$5.000 em dividendos no ano',
    icon: '🌟',
    xpReward: 1500,
    rarity: 'épico',
  },
];

// ============================================
// DADOS DO USUÁRIO (MOCK)
// ============================================
export const mockUser = {
  id: 'mock-user-1',
  name: 'João Investidor',
  email: 'joao@patrimônioplus.com.br',
  avatarUrl: null,
  plan: 'premium' as const,
  level: 7,
  xp: 3850,
  xpToNextLevel: 5000,
  streak: 14,
  joinedAt: '2022-11-01',
};

// ============================================
// HELPERS DE FORMATAÇÃO
// ============================================
export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatCompact(value: number, currency: string = 'BRL'): string {
  const symbol = currency === 'USD' ? 'US$' : 'R$';
  if (value >= 1_000_000) return `${symbol} ${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${symbol} ${(value / 1_000).toFixed(1)}K`;
  return formatCurrency(value, currency);
}

// Dicionário legível para tipo de ativo
export const assetTypeLabel: Record<AssetType, string> = {
  ETF: 'ETF',
  stock: 'Ação',
  FII: 'FII',
  treasury: 'Tesouro',
  fixed_income: 'Renda Fixa',
};

// Cores por tipo de ativo (para gráficos)
export const assetTypeColor: Record<string, string> = {
  ETF: '#00d4aa',
  stock: '#4f6ef7',
  FII: '#fb923c',
  treasury: '#ffd60a',
  fixed_income: '#8b5cf6',
};
