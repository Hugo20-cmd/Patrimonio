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

import { createNotification } from './notifications'

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
  let leveledUp = false

  // Sistema simples de progressão de nível
  while (newXp >= newXpToNext) {
    newLevel += 1
    newXp -= newXpToNext
    newXpToNext = Math.floor(newXpToNext * 1.5) // Próximo nível requer 50% a mais de XP
    leveledUp = true
  }

  await supabase
    .from('profiles')
    .upsert({
      id: userId,
      xp: newXp,
      level: newLevel,
      xp_to_next_level: newXpToNext
    }, { onConflict: 'id' })

  if (leveledUp) {
    await createNotification(
      'Nível Alcançado!',
      `Parabéns! Você alcançou o Nível ${newLevel}. Continue investindo para crescer ainda mais!`,
      'achievement',
      userId
    )
  }
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
  
  await createNotification(
    'Nova Conquista!',
    `Você desbloqueou "${baseAch?.title || achievementKey}" e ganhou ${xpReward} XP.`,
    'achievement',
    userId
  )
  
  return { unlocked: true, xpReward }
}

export async function checkTransactionAchievements(userId: string) {
  const supabase = await createClient()

  // Analisa histórico do usuário (Lançamentos e Carteira)
  const { data: transactions } = await supabase
    .from('asset_transactions')
    .select('price, quantity, operation, asset_type')
    .eq('user_id', userId)

  const { data: assets } = await supabase
    .from('assets')
    .select('quantity, average_price, type')
    .eq('user_id', userId)

  const eligibleKeys = new Set<string>();
  let totalInvested = 0;

  if (transactions && transactions.length > 0) {
    if (transactions.length >= 1) eligibleKeys.add('primeira_transacao');

    totalInvested += transactions
      .filter(t => t.operation === 'buy')
      .reduce((acc, t) => acc + (Number(t.price) * Number(t.quantity)), 0)
  }

  // Apenas usamos os ativos atuais para conquistas de tipos (primeira_acao, etc)
  if (assets && assets.length > 0) {
    if (assets.length >= 1) eligibleKeys.add('primeira_transacao');
  }

  const hasAcao = (assets && assets.some(a => a.type === 'stock'));
  if (hasAcao) eligibleKeys.add('primeira_acao');

  const hasFII = (assets && assets.some(a => a.type === 'FII'));
  if (hasFII) eligibleKeys.add('primeiro_fii');

  const hasETF = (assets && assets.some(a => a.type === 'ETF'));
  if (hasETF) eligibleKeys.add('primeiro_etf');

  if (totalInvested >= 1000) eligibleKeys.add('1k_investido')
  if (totalInvested >= 5000) eligibleKeys.add('5k_investido')
  if (totalInvested >= 10000) eligibleKeys.add('10k_investido')
  if (totalInvested >= 100000) eligibleKeys.add('100k_lendario')

  const transactionAchievementKeys = ['primeira_transacao', 'primeira_acao', 'primeiro_fii', 'primeiro_etf', '1k_investido', '5k_investido', '10k_investido', '100k_lendario'];

  const { data: existing } = await supabase
    .from('user_achievements')
    .select('achievement_key')
    .eq('user_id', userId)
    .in('achievement_key', transactionAchievementKeys)

  const existingKeys = new Set(existing?.map(e => e.achievement_key) || [])
  const results = [];

  for (const key of eligibleKeys) {
    if (!existingKeys.has(key)) {
      results.push(await unlockAchievement(userId, key))
    }
  }

  for (const key of existingKeys) {
    if (!eligibleKeys.has(key)) {
      await supabase.from('user_achievements').delete().eq('user_id', userId).eq('achievement_key', key)
    }
  }

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

  // 1. Tentar desbloquear novas conquistas baseadas no histórico de transações
  const achievementsResult = await checkTransactionAchievements(userId)

  // 2. Buscar TODAS as conquistas que o usuário possui no banco
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('achievement_key')
    .eq('user_id', userId)

  let totalXpToGive = 0;

  // 3. Somar o XP de todas as conquistas já desbloqueadas
  if (achievements && achievements.length > 0) {
    achievements.forEach(ach => {
      const baseAch = BASE_ACHIEVEMENTS.find(a => a.key === ach.achievement_key)
      if (baseAch) {
        totalXpToGive += baseAch.xp
      } else {
        totalXpToGive += 200 // Valor padrão para dinâmicas como metas concluídas
      }
    })
  }

  // 4. Somar o XP de transações antigas (Lançamentos e Carteira)
  const { data: transactions } = await supabase
    .from('asset_transactions')
    .select('price, quantity, operation')
    .eq('user_id', userId)

  if (transactions && transactions.length > 0) {
    transactions
      .filter(t => t.operation === 'buy')
      .forEach(t => {
        const xpBase = Math.floor((Number(t.price) * Number(t.quantity)) / 5)
        const xpFinal = xpBase > 0 ? xpBase : 2
        totalXpToGive += xpFinal
      });
  }

  // We no longer calculate XP from 'assets' because 'asset_transactions' already contains all the buys.
  // This prevents double counting XP.

  // 5. Atualizar o Perfil com o valor total recalibrado do zero
  let newLevel = 1
  let newXpToNext = 1000
  let remainingXp = totalXpToGive

  while (remainingXp >= newXpToNext) {
    newLevel += 1
    remainingXp -= newXpToNext
    newXpToNext = Math.floor(newXpToNext * 1.5)
  }

  await supabase
    .from('profiles')
    .upsert({
      id: userId,
      xp: totalXpToGive,
      level: newLevel,
      xp_to_next_level: newXpToNext
    }, { onConflict: 'id' })

  return { success: true, achievementsResult, totalCalculatedXp: totalXpToGive }
}
