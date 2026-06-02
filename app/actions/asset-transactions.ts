'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAssetTransactions() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return []

  const { data, error } = await supabase
    .from('asset_transactions')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('operation_date', { ascending: false })

  if (error) {
    console.error('Error fetching asset transactions:', error)
    return []
  }

  return data
}

export async function deleteAssetTransaction(id: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: 'Not authenticated' }

  // Buscamos a transação antes de excluir para reverter no asset principal, se desejado.
  // Neste MVP, vamos apenas excluir a transação do histórico para não complicar.
  const { error } = await supabase
    .from('asset_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/portfolio')
  return { success: true }
}
