'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkTransactionAchievements } from './gamification'

export async function getTransactions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data.map((t: any) => ({
    id: t.id,
    description: t.description,
    amount: Number(t.amount),
    date: t.date,
    type: t.type, // 'income' ou 'expense'
    category: t.category,
  }))
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const description = formData.get('description') as string
  const type = formData.get('type') as string
  const amountRaw = formData.get('amount') as string
  const date = formData.get('date') as string
  const category = formData.get('category') as string

  const amount = Number(amountRaw)

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userData.user.id,
      description,
      type,
      amount,
      date,
      category,
    })

  if (error) return { error: error.message }

  // Disparar gatilho de gamificação (milestones)
  await checkTransactionAchievements(userData.user.id)

  // XP dinâmico por Aporte / Compra de Ativos
  // O usuário ganha XP proporcional ao valor investido (Ex: 1 XP a cada R$ 5)
  const investmentCategories = ['ação', 'ações', 'etf', 'fii', 'cripto', 'investimento', 'renda fixa', 'tesouro']
  if (investmentCategories.some(c => category.toLowerCase().includes(c))) {
    const xpBase = Math.floor(amount / 5) // 1 XP a cada 5 reais investidos
    const xpFinal = xpBase > 0 ? xpBase : 2 // Pelo menos 2 XP por qualquer compra
    
    const { addXp } = await import('./gamification')
    await addXp(userData.user.id, xpFinal)
  }

  revalidatePath('/transactions')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/transactions')
  return { success: true }
}

export async function editTransaction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const description = formData.get('description') as string
  const type = formData.get('type') as string
  const amountRaw = formData.get('amount') as string
  const date = formData.get('date') as string
  const category = formData.get('category') as string

  const amount = Number(amountRaw)

  const { error } = await supabase
    .from('transactions')
    .update({
      description,
      type,
      amount,
      date,
      category,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) return { error: error.message }

  revalidatePath('/transactions')
  return { success: true }
}
