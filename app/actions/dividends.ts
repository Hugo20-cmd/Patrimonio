'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDividends() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dividends')
    .select('*')
    .order('payment_date', { ascending: false })

  if (error) {
    console.error('Error fetching dividends:', error)
    return []
  }

  return data.map((div: any) => ({
    id: div.id,
    ticker: div.ticker,
    name: div.name || div.ticker,
    amount: Number(div.amount),
    paymentDate: div.payment_date,
    type: div.type,
    currency: div.currency || 'BRL',
    yieldPercent: Number(div.yield_percent || 0),
  }))
}

export async function addDividend(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const ticker = formData.get('ticker') as string
  const type = formData.get('type') as string
  const amountRaw = formData.get('amount') as string
  const date = formData.get('date') as string
  const currency = formData.get('currency') as string || 'BRL'

  const amount = Number(amountRaw)

  const { error } = await supabase
    .from('dividends')
    .insert({
      user_id: userData.user.id,
      ticker,
      type,
      amount,
      payment_date: date,
      currency,
      name: ticker
    })

  if (error) return { error: error.message }

  revalidatePath('/dividends')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteDividend(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('dividends').delete().eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/dividends')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function editDividend(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const ticker = formData.get('ticker') as string
  const type = formData.get('type') as string
  const amountRaw = formData.get('amount') as string
  const date = formData.get('date') as string
  const currency = formData.get('currency') as string || 'BRL'

  const amount = Number(amountRaw)

  const { error } = await supabase
    .from('dividends')
    .update({
      ticker,
      type,
      amount,
      payment_date: date,
      currency,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) return { error: error.message }

  revalidatePath('/dividends')
  revalidatePath('/dashboard')
  return { success: true }
}
