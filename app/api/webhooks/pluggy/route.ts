import { PluggyClient } from 'pluggy-sdk'
import { createClient } from '@/utils/supabase/server'

// Map Pluggy investment types to our asset types
function mapAssetType(subtype: string): string {
  const s = (subtype || '').toLowerCase()
  if (s.includes('fii') || s.includes('fundo imobiliário')) return 'FII'
  if (s.includes('etf')) return 'ETF'
  if (s.includes('tesouro') || s.includes('treasury') || s.includes('debenture') || s.includes('cdb') || s.includes('lci') || s.includes('lca')) return 'treasury'
  return 'stock'
}

export async function syncPluggyItem(itemId: string, userId: string) {
  const supabase = await createClient()

  const pluggy = new PluggyClient({
    clientId: process.env.PLUGGY_CLIENT_ID!,
    clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
  })

  // Get investment accounts for this item
  const accounts = await pluggy.fetchAccounts(itemId, 'INVESTMENT')

  for (const account of accounts.results) {
    const investments = await pluggy.fetchInvestments(account.id)

    for (const inv of investments.results) {
      if (!inv.code) continue // Skip if no ticker

      const ticker    = inv.code.trim().toUpperCase()
      const quantity  = inv.quantity  || 0
      const avgPrice  = inv.amount && inv.quantity ? inv.amount / inv.quantity : (inv.lastMonthRate || 0)
      const currPrice = inv.value && inv.quantity  ? inv.value  / inv.quantity : avgPrice

      // Upsert into assets table
      const { data: existing } = await supabase
        .from('assets')
        .select('id')
        .eq('user_id', userId)
        .eq('ticker', ticker)
        .single()

      if (existing) {
        await supabase
          .from('assets')
          .update({
            quantity:      parseFloat(quantity.toFixed(8)),
            average_price: parseFloat(avgPrice.toFixed(8)),
            current_price: parseFloat(currPrice.toFixed(8)),
            name:          inv.name || ticker,
            updated_at:    new Date().toISOString(),
          })
          .eq('id', existing.id)
      } else {
        await supabase.from('assets').insert({
          user_id:       userId,
          ticker,
          name:          inv.name || ticker,
          type:          mapAssetType(inv.subtype || ''),
          quantity:      parseFloat(quantity.toFixed(8)),
          average_price: parseFloat(avgPrice.toFixed(8)),
          current_price: parseFloat(currPrice.toFixed(8)),
          purchase_date: new Date().toISOString().split('T')[0],
          pluggy_item_id: itemId,
        })
      }
    }
  }

  // Save item reference so we can re-sync later
  await supabase.from('pluggy_items').upsert({
    user_id:    userId,
    item_id:    itemId,
    synced_at:  new Date().toISOString(),
  }, { onConflict: 'user_id,item_id' })
}

export async function POST(req: Request) {
  try {
    const event = await req.json()
    console.log('[Pluggy Webhook]', event.event, event.itemId)

    if (event.event === 'item/created' || event.event === 'item/updated') {
      const supabase = await createClient()

      // Find user by itemId in pluggy_items table
      const { data: pluggyItem } = await supabase
        .from('pluggy_items')
        .select('user_id')
        .eq('item_id', event.itemId)
        .single()

      if (pluggyItem) {
        await syncPluggyItem(event.itemId, pluggyItem.user_id)
      }
    }

    return Response.json({ received: true })
  } catch (err: any) {
    console.error('[Pluggy Webhook] Error:', err)
    return Response.json({ received: true }) // Always return 2xx
  }
}
