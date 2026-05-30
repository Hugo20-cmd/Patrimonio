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
    .single()

  if (!profile) return

  let newXp = (profile.xp || 0) + xpAmount
  let newLevel = profile.level || 1
  let newXpToNext = profile.xp_to_next_level || 1000

  // Sistema simples de progressão de nível
  while (newXp >= newXpToNext) {
    newLevel += 1
    newXp -= newXpToNext
    newXpToNext = Math.floor(newXpToNext * 1.5) // Próximo nível requer 50% a mais de XP
  }

  await supabase
    .from('profiles')
    .update({
      xp: newXp,
      level: newLevel,
      xp_to_next_level: newXpToNext
    })
    .eq('id', userId)
}

export async function unlockAchievement(userId: string, achievementKey: string) {
  const supabase = await createClient()

  // Tenta inserir a conquista
  const { error } = await supabase
    .from('user_achievements')
    .insert({ user_id: userId, achievement_key: achievementKey })

  // Se der erro (ex: já existe por causa do UNIQUE constraint), apenas ignora
  if (error) return { unlocked: false }

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

  // 1. Primeira transação
  if (transactions.length === 1) {
    await unlockAchievement(userId, 'primeira_transacao')
  }

  // 2. Primeiros Ativos (Ação, FII, ETF)
  const hasAcao = transactions.some(t => t.category && t.category.toLowerCase().includes('açã'))
  if (hasAcao) await unlockAchievement(userId, 'primeira_acao')

  const hasFII = transactions.some(t => t.category && t.category.toLowerCase().includes('fii'))
  if (hasFII) await unlockAchievement(userId, 'primeiro_fii')

  const hasETF = transactions.some(t => t.category && t.category.toLowerCase().includes('etf'))
  if (hasETF) await unlockAchievement(userId, 'primeiro_etf')

  // 3. Patrimônio / Investido (soma de entradas)
  const totalInvested = transactions
    .filter(t => t.type === 'income') // Ou expense dependendo de como está configurado no app, assumimos income como aporte
    .reduce((acc, t) => acc + Number(t.amount), 0)

  if (totalInvested >= 1000) await unlockAchievement(userId, '1k_investido')
  if (totalInvested >= 5000) await unlockAchievement(userId, '5k_investido')
  if (totalInvested >= 10000) await unlockAchievement(userId, '10k_investido')
  if (totalInvested >= 100000) await unlockAchievement(userId, '100k_lendario')
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

  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('unlocked_at', { ascending: false })

  return achievements || []
}
