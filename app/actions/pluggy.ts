'use server'

import { createClient } from '@/utils/supabase/server'
import { PluggyClient, Investment } from 'pluggy-sdk'
import { revalidatePath } from 'next/cache'

const getPluggyClient = () => new PluggyClient({
  clientId: process.env.PLUGGY_CLIENT_ID!,
  clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
})

export async function savePluggyItem(itemId: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: 'Not authenticated' }

  try {
    const pluggy = getPluggyClient()
    const item = await pluggy.fetchItem(itemId)
    const connector = await pluggy.fetchConnector(item.connectorId)

    const { error } = await supabase
      .from('pluggy_items')
      .insert({
        user_id: userData.user.id,
        pluggy_item_id: itemId,
        connector_name: connector.name,
        status: item.status
      })

    if (error) {
      if (error.code === '23505') return { error: 'Essa conta já está conectada.' }
      throw error
    }

    // Trigger initial sync
    await syncPluggyItem(itemId, userData.user.id)

    revalidatePath('/connections')
    revalidatePath('/portfolio')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (err: any) {
    console.error('Error saving pluggy item:', err)
    return { error: err.message || 'Erro ao salvar conexão' }
  }
}

export async function syncPluggyItem(itemId: string, userId?: string) {
  const supabase = await createClient()

  // If userId not provided (e.g. from webhook), fetch from db
  if (!userId) {
    const { data: itemData } = await supabase
      .from('pluggy_items')
      .select('user_id')
      .eq('pluggy_item_id', itemId)
      .single()
    if (!itemData) return { error: 'Item not found in DB' }
    userId = itemData.user_id
  }

  try {
    const pluggy = getPluggyClient()
    
    // Fetch investments
    const investments = await pluggy.fetchInvestments(itemId)
    
    // Map to our assets format
    const newAssets = investments.results.map((inv: Investment) => {
      // Basic mapping - Pluggy returns detailed data, we map to our MVP format
      // Pluggy types: MUTUAL_FUND, SECURITY, EQUITY, FIXED_INCOME, ETF
      let type = 'stock'
      if (inv.type === 'ETF' || inv.subtype === 'ETF') type = 'ETF'
      else if (inv.type === 'FIXED_INCOME') type = 'fixed_income'
      else if (inv.type === 'MUTUAL_FUND') type = 'FII' // Approximation for now
      
      return {
        user_id: userId,
        pluggy_item_id: itemId,
        ticker: inv.code || inv.name.substring(0, 10).toUpperCase(),
        name: inv.name,
        type: type,
        quantity: inv.quantity || 1,
        average_price: inv.value ? (inv.value / (inv.quantity || 1)) : 0,
        current_price: inv.value ? (inv.value / (inv.quantity || 1)) : 0,
        currency: inv.currencyCode || 'BRL',
        purchase_date: inv.date || new Date().toISOString()
      }
    })

    // Transaction-like behavior: Delete old synced assets for this item, insert new
    await supabase
      .from('assets')
      .delete()
      .eq('pluggy_item_id', itemId)

    if (newAssets.length > 0) {
      const { error } = await supabase
        .from('assets')
        .insert(newAssets)
      
      if (error) throw error
    }

    // Update status
    const item = await pluggy.fetchItem(itemId)
    await supabase
      .from('pluggy_items')
      .update({ status: item.status, updated_at: new Date().toISOString() })
      .eq('pluggy_item_id', itemId)

    return { success: true }
  } catch (err: any) {
    console.error('Error syncing pluggy item:', err)
    
    // Update status to error
    await supabase
      .from('pluggy_items')
      .update({ status: 'ERROR', updated_at: new Date().toISOString() })
      .eq('pluggy_item_id', itemId)

    return { error: err.message || 'Erro ao sincronizar' }
  }
}

export async function deletePluggyItem(itemId: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: 'Not authenticated' }

  try {
    const pluggy = getPluggyClient()
    await pluggy.deleteItem(itemId) // Delete from Pluggy

    // DB deletion handles cascade for assets
    const { error } = await supabase
      .from('pluggy_items')
      .delete()
      .eq('pluggy_item_id', itemId)

    if (error) throw error

    revalidatePath('/connections')
    revalidatePath('/portfolio')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (err: any) {
    console.error('Error deleting pluggy item:', err)
    return { error: err.message || 'Erro ao excluir conexão' }
  }
}
