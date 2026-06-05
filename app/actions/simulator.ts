'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 1. Iniciar ou obter conta do Simulador
export async function getSimulatorAccount() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return null

  const userId = userData.user.id

  // Tenta buscar a conta
  const { data: account } = await supabase
    .from('simulator_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (account) return account

  // Se não existir, cria com saldo inicial de 100.000
  const { data: newAccount, error } = await supabase
    .from('simulator_profiles')
    .insert({ user_id: userId, balance: 100000 })
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar conta simulador:", error)
    return null
  }
  
  return newAccount
}

export async function getSimulatorPositions() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return []

  const { data: positions } = await supabase
    .from('simulator_positions')
    .select('*')
    .eq('user_id', userData.user.id)

  return positions || []
}

export async function getSimulatorHistory() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return []

  const { data: history } = await supabase
    .from('simulator_history')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })

  return history || []
}

// 2. Executar Ordem de Compra ou Venda
export async function executeSimulatorOrder(ticker: string, quantity: number, price: number, operation: 'buy' | 'sell') {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }
  const userId = userData.user.id

  const totalValue = quantity * price
  if (totalValue <= 0) return { error: 'Valor inválido' }

  const account = await getSimulatorAccount()
  if (!account) return { error: 'Conta não encontrada' }

  // Busca posição atual se existir
  const { data: position } = await supabase
    .from('simulator_positions')
    .select('*')
    .eq('user_id', userId)
    .eq('ticker', ticker)
    .single()

  if (operation === 'buy') {
    if (account.balance < totalValue) {
      return { error: 'Saldo insuficiente para a compra.' }
    }

    // Desconta o saldo
    const newBalance = Number(account.balance) - totalValue
    const { error: err1 } = await supabaseAdmin.from('simulator_profiles').update({ balance: newBalance }).eq('user_id', userId)
    if (err1) return { error: 'Erro ao atualizar saldo: ' + err1.message }

    // Atualiza ou cria posição
    if (position) {
      const oldQuantity = Number(position.quantity)
      const oldAvgPrice = Number(position.average_price)
      const newQuantity = oldQuantity + quantity
      const newAvgPrice = ((oldQuantity * oldAvgPrice) + totalValue) / newQuantity

      const { error: err2 } = await supabaseAdmin.from('simulator_positions').update({
        quantity: newQuantity,
        average_price: newAvgPrice
      }).eq('id', position.id)
      if (err2) return { error: 'Erro ao atualizar posição: ' + err2.message }
    } else {
      const { error: err3 } = await supabaseAdmin.from('simulator_positions').insert({
        user_id: userId,
        ticker,
        quantity,
        average_price: price
      })
      if (err3) return { error: 'Erro ao criar posição: ' + err3.message }
    }
  } else if (operation === 'sell') {
    if (!position || Number(position.quantity) < quantity) {
      return { error: 'Você não tem ativos suficientes para vender.' }
    }

    // Aumenta o saldo
    const newBalance = Number(account.balance) + totalValue
    const { error: err4 } = await supabaseAdmin.from('simulator_profiles').update({ balance: newBalance }).eq('user_id', userId)
    if (err4) return { error: 'Erro ao atualizar saldo: ' + err4.message }

    // Atualiza posição
    const newQuantity = Number(position.quantity) - quantity
    if (newQuantity <= 0) {
      const { error: err5 } = await supabaseAdmin.from('simulator_positions').delete().eq('id', position.id)
      if (err5) return { error: 'Erro ao deletar posição: ' + err5.message }
    } else {
      const { error: err6 } = await supabaseAdmin.from('simulator_positions').update({
        quantity: newQuantity
      }).eq('id', position.id)
      if (err6) return { error: 'Erro ao atualizar posição: ' + err6.message }
    }
  }

  // Registra no histórico
  await supabaseAdmin.from('simulator_history').insert({
    user_id: userId,
    ticker,
    operation,
    quantity,
    price
  })

  revalidatePath('/homebroker')
  return { success: true }
}

export async function resetSimulatorAccount() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }
  const userId = userData.user.id

  await supabase.from('simulator_history').delete().eq('user_id', userId)
  await supabase.from('simulator_positions').delete().eq('user_id', userId)
  await supabase.from('simulator_profiles').update({ balance: 100000 }).eq('user_id', userId)

  revalidatePath('/homebroker')
  return { success: true }
}

export async function getSimulatorRanking() {
  const { data: simProfiles } = await supabaseAdmin.from('simulator_profiles').select('*')
  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, name, avatar_url, email')
  const { data: positions } = await supabaseAdmin.from('simulator_positions').select('*')
  
  if (!profiles) return []

  const adminEmails = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br']
  const filteredProfiles = profiles.filter(p => !adminEmails.includes(p.email))

  const uniqueTickers = [...new Set((positions || []).map(p => p.ticker))]
  
  const { getMultipleQuotes } = await import('./market')
  const quotes = await getMultipleQuotes(uniqueTickers)
  const quotesMap = new Map(quotes.filter((q: any) => q && q.symbol).map((q: any) => [q.symbol, q.price]))

  const ranking = filteredProfiles.map(userProfile => {
    const simProfile = (simProfiles || []).find(sp => sp.user_id === userProfile.id) || { balance: 100000 }
    const userPositions = (positions || []).filter(p => p.user_id === userProfile.id)
    
    let investedValue = 0
    for (const pos of userPositions) {
      const currentPrice = quotesMap.get(pos.ticker) || pos.average_price
      investedValue += pos.quantity * currentPrice
    }
    
    const totalEquity = Number(simProfile.balance) + investedValue
    const returnPercent = ((totalEquity / 100000) - 1) * 100

    return {
      user_id: userProfile.id,
      name: userProfile.name || 'Investidor P+',
      avatar_url: userProfile.avatar_url,
      balance: Number(simProfile.balance),
      totalEquity,
      returnPercent
    }
  })

  ranking.sort((a, b) => b.totalEquity - a.totalEquity)
  return ranking
}
