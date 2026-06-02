'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAssets() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userData.user.id)
    .single()

  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br'];
  const isAdmin = ADMIN_EMAILS.includes(userData.user.email?.toLowerCase().trim() || '');
  const isFree = !isAdmin && (profile?.plan === 'Free' || profile?.plan === 'free' || !profile?.plan);

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: true }) // Get oldest first

  if (error) {
    console.error('Error fetching assets:', error)
    return []
  }

  let finalData = data || []
  if (isFree && finalData.length > 5) {
    finalData = finalData.slice(0, 5)
  }
  
  // Sort descending for UI
  finalData = finalData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Map to the format expected by the frontend
  return finalData.map((asset: any) => ({
    id: asset.id,
    ticker: asset.ticker,
    name: asset.name || asset.ticker,
    type: asset.type,
    quantity: Number(asset.quantity),
    averagePrice: Number(asset.average_price),
    currentPrice: Number(asset.current_price),
    currency: asset.currency,
    sector: asset.sector,
    broker: asset.broker,
    purchaseDate: asset.purchase_date,
  }))
}

export async function addAsset(formData: FormData) {
  const supabase = await createClient()
  
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userData.user.id)
    .single()

  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br'];
  const isAdmin = ADMIN_EMAILS.includes(userData.user.email?.toLowerCase().trim() || '');
  const isFree = !isAdmin && (profile?.plan === 'Free' || profile?.plan === 'free' || !profile?.plan);

  const ticker = formData.get('ticker') as string
  const type = formData.get('type') as string
  const operation = formData.get('operation') as string // buy or sell
  const quantityRaw = formData.get('quantity') as string
  const priceRaw = formData.get('price') as string
  const date = formData.get('date') as string
  const currency = formData.get('currency') as string || 'BRL'

  let quantity = Number(quantityRaw)
  const price = Number(priceRaw)

  if (operation === 'sell') {
    quantity = -Math.abs(quantity)
  } else {
    quantity = Math.abs(quantity)
  }

  // Basic check to see if asset already exists
  const { data: existingAsset } = await supabase
    .from('assets')
    .select('*')
    .eq('ticker', ticker)
    .single()

  // Enforce limit if Free plan
  if (isFree && !existingAsset) {
    const { count } = await supabase
      .from('assets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userData.user.id)

    if (count !== null && count >= 5) {
      return { error: 'Limite do plano Free atingido (5 ativos). Faça upgrade para Premium para adicionar mais ativos.' }
    }
  }

  if (existingAsset) {
    // Update existing — round to 8 decimals to avoid float precision errors
    const newQuantity = parseFloat((Number(existingAsset.quantity) + quantity).toFixed(8))
    
    // Calculate new average price (only if buying)
    let newAveragePrice = Number(existingAsset.average_price)
    if (operation === 'buy') {
      const totalInvestedBefore = Number(existingAsset.quantity) * newAveragePrice
      const newInvestment = quantity * price
      newAveragePrice = parseFloat(((totalInvestedBefore + newInvestment) / newQuantity).toFixed(8))
    }

    const { error } = await supabase
      .from('assets')
      .update({
        quantity: newQuantity,
        average_price: newAveragePrice,
        current_price: price,
        currency: currency,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAsset.id)

    if (error) return { error: error.message }
  } else {
    // Create new
    if (operation === 'sell') {
      return { error: 'Cannot sell an asset you do not own' }
    }

    const { error } = await supabase
      .from('assets')
      .insert({
        user_id: userData.user.id,
        ticker,
        type,
        quantity,
        average_price: price,
        current_price: price, // Optimistic update
        currency: currency,
        purchase_date: date,
        name: ticker // Defaults to ticker, could be enhanced with external API
      })

    if (error) return { error: error.message }
  }

  const { syncRetroactiveXp } = await import('./gamification')
  await syncRetroactiveXp()

  revalidatePath('/portfolio')
  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteAsset(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('assets').delete().eq('id', id)
  
  if (error) return { error: error.message }
  
  const { syncRetroactiveXp } = await import('./gamification')
  await syncRetroactiveXp()

  revalidatePath('/portfolio')
  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function editAsset(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { error: 'Not authenticated' }

  const quantityRaw = formData.get('quantity') as string
  const priceRaw = formData.get('price') as string
  const date = formData.get('date') as string
  const currency = formData.get('currency') as string || 'BRL'
  const ticker = formData.get('ticker') as string
  const type = formData.get('type') as string

  const quantity = parseFloat(Number(quantityRaw).toFixed(8))
  const price = parseFloat(Number(priceRaw).toFixed(8))

  const { error } = await supabase
    .from('assets')
    .update({
      ticker,
      type,
      name: ticker,
      quantity,
      average_price: price,
      purchase_date: date,
      currency: currency,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) return { error: error.message }

  const { syncRetroactiveXp } = await import('./gamification')
  await syncRetroactiveXp()

  revalidatePath('/portfolio')
  revalidatePath('/dashboard')
  revalidatePath('/', 'layout')
  return { success: true }
}
