'use server'

import { createClient } from '@/utils/supabase/server'

export async function getMarketNews() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) return { error: 'Não autenticado' }

  // Verificar se é Premium ou Admin
  const ADMIN_EMAILS = ['contatopennamc@gmail.com']
  const userEmail = userData.user.email?.toLowerCase().trim() || ''
  const isAdmin = ADMIN_EMAILS.includes(userEmail)

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userData.user.id)
    .single()

  if (profile?.plan !== 'premium' && !isAdmin) {
    return { error: 'premium_required' }
  }

  // Em um ambiente real, aqui faríamos um fetch para NewsAPI, Finnhub ou Alpha Vantage
  // fetch(`https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_KEY}`)
  
  // Mock Realista Atualizado
  return {
    success: true,
    data: [
      {
        id: 1,
        title: "Copom mantém taxa Selic em 10,50% ao ano, em decisão unânime",
        summary: "O Comitê de Política Monetária (Copom) do Banco Central decidiu manter a taxa básica de juros, indicando preocupações com a inflação de serviços e o cenário fiscal.",
        source: "Valor Econômico",
        category: "Política Econômica",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Bolsa fecha em alta puxada por balanços positivos de grandes bancos",
        summary: "O Ibovespa encerrou o pregão com avanço significativo, impulsionado pelos resultados trimestrais acima do esperado do setor financeiro.",
        source: "InfoMoney",
        category: "Mercado Financeiro",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        title: "Petróleo atinge maior valor em três meses com tensões geopolíticas",
        summary: "O barril do Brent ultrapassou a marca de 85 dólares, impactando ações de petroleiras globais e pressionando expectativas de inflação.",
        source: "Exame",
        category: "Commodities",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 4,
        title: "Reforma Tributária: Senado aprova texto-base após longas negociações",
        summary: "Mudanças significativas no sistema de impostos brasileiro avançam no Congresso, com potencial impacto no setor de serviços.",
        source: "G1 Economia",
        category: "Política",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date(Date.now() - 14400000).toISOString()
      }
    ]
  }
}
