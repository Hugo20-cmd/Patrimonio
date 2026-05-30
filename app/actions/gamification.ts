'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Lista de conquistas estáticas base do sistema
const BASE_ACHIEVEMENTS = [
  { key: 'primeira_transacao', title: 'Primeiros Passos', xp: 50 },
  { key: 'primeira_acao', title: 'Primeira Ação', xp: 100 },
  { key: 'primeiro_fii', title: 'Primeiro FII', xp: 100 },
  { key: 'primeiro_etf', title: 'Primeiro ETF', xp: 100 },
  { key: '1k_investido', title: 'Investidor Aprendiz (R$ 1K)', xp: 200 },
  { key: '5k_investido', title: 'Caminho Certo (R$ 5K)', xp: 300 },
  { key: '10k_investido', title: 'R$ 10.000 Investidos', xp: 500 },
  { key: '100k_lendario', title: 'Centenário (100K)', xp: 2000 },
  { key: 'rei_dividendos', title: 'Rei dos Dividendos', xp: 1500 },
  { key: 'primeira_meta', title: 'Sonhador', xp: 150 },
  { key: 'meta_concluida', title: 'Realizador de Sonhos', xp: 1000 },
];

export async function addXp(userId: string, xpAmount: number) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level, xp_to_next_level')
    .eq('id', userId)
    .maybeSingle()

  let newXp = (profile?.xp || 0) + xpAmount
  let newLevel = profile?.level || 1
  let newXpToNext = profile?.xp_to_next_level || 1000

  // Sistema simples de progressão de nível
  while (newXp >= newXpToNext) {
    newLevel += 1
    newXp -= newXpToNext
    newXpToNext = Math.floor(newXpToNext * 1.5) // Próximo nível requer 50% a mais de XP
  }

  await supabase
    .from('profiles')
    .upsert({
      id: userId,
      xp: newXp,
      level: newLevel,
      xp_to_next_level: newXpToNext
    }, { onConflict: 'id' })
}

export async function unlockAchievement(userId: string, achievementKey: string) {
  const supabase = await createClient()

  // Tenta inserir a conquista
  const { error } = await supabase
    .from('user_achievements')
    .insert({ user_id: userId, achievement_key: achievementKey })

  // Se der erro (ex: já existe por causa do UNIQUE constraint), apenas ignora
  if (error) return { unlocked: false, error: error.message }

  // Descobre o XP base da conquista, se existir na nossa lista
  const baseAch = BASE_ACHIEVEMENTS.find(a => a.key === achievementKey)
  const xpReward = baseAch ? baseAch.xp : 200 // XP padrão para conquistas dinâmicas

  await addXp(userId, xpReward)
  
  return { unlocked: true, xpReward }
}

export async function checkTransactionAchievements(userId: string) {
  const supabase = await createClient()

  // Analisa histórico do usuário
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, category')
    .eq('user_id', userId)

  if (!transactions || transactions.length === 0) return

  const results = [];

  // 1. Primeira transação
  if (transactions.length >= 1) {
    results.push(await unlockAchievement(userId, 'primeira_transacao'))
  }

  // 2. Primeiros Ativos (Ação, FII, ETF)
  const hasAcao = transactions.some(t => t.category && t.category.toLowerCase().includes('açã'))
  if (hasAcao) results.push(await unlockAchievement(userId, 'primeira_acao'))

  const hasFII = transactions.some(t => t.category && t.category.toLowerCase().includes('fii'))
  if (hasFII) results.push(await unlockAchievement(userId, 'primeiro_fii'))

  const hasETF = transactions.some(t => t.category && t.category.toLowerCase().includes('etf'))
  if (hasETF) results.push(await unlockAchievement(userId, 'primeiro_etf'))

  // 3. Patrimônio / Investido (soma de entradas)
  const totalInvested = transactions
    .filter(t => t.type === 'income') // Ou expense dependendo de como está configurado no app, assumimos income como aporte
    .reduce((acc, t) => acc + Number(t.amount), 0)

  if (totalInvested >= 1000) results.push(await unlockAchievement(userId, '1k_investido'))
  if (totalInvested >= 5000) results.push(await unlockAchievement(userId, '5k_investido'))
  if (totalInvested >= 10000) results.push(await unlockAchievement(userId, '10k_investido'))
  if (totalInvested >= 100000) results.push(await unlockAchievement(userId, '100k_lendario'))

  return { totalInvested, results }
}

export async function checkGoalAchievements(userId: string, goalId: string) {
  const supabase = await createClient()

  const { data: goal } = await supabase
    .from('goals')
    .select('current_amount, target_amount, title')
    .eq('id', goalId)
    .single()

  if (!goal) return

  const percentage = (Number(goal.current_amount) / Number(goal.target_amount)) * 100

  if (percentage >= 50 && percentage < 100) {
    // Conquista dinâmica
    await unlockAchievement(userId, `meta_50pct_${goalId}`)
  } else if (percentage >= 100) {
    await unlockAchievement(userId, 'meta_concluida')
    await unlockAchievement(userId, `meta_100pct_${goalId}`)
  }
}

export async function getUserAchievements() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return []

  const { data: achievements, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userData.user.id)
    
  if (error) console.error("Error fetching achievements:", error)

  return achievements || []
}

export async function syncRetroactiveXp() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const userId = userData.user.id

  // 1. Recalcular conquistas baseadas no histórico
  const achievementsResult = await checkTransactionAchievements(userId)

  // 2. Dar XP por transações antigas que talvez não tenham dado XP
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, category')
    .eq('user_id', userId)

  let totalXpToGive = 0;
  if (transactions && transactions.length > 0) {
    const investmentCategories = ['ação', 'ações', 'etf', 'fii', 'cripto', 'investimento', 'renda fixa', 'tesouro']
    
    transactions.forEach(t => {
      if (t.category && investmentCategories.some(c => t.category.toLowerCase().includes(c))) {
        const xpBase = Math.floor(Number(t.amount) / 5)
        const xpFinal = xpBase > 0 ? xpBase : 2
        totalXpToGive += xpFinal
      }
    });

    // Se tiver XP pra dar, a gente dá. (Pode gerar XP duplicado se já recebeu antes, mas como é pra corrigir retroativo, vale a pena)
    if (totalXpToGive > 0) {
      await addXp(userId, totalXpToGive)
    }
  }

  return { success: true, achievementsResult, totalXpToGive }
}
