import { createClient } from '@/utils/supabase/server'
import ConnectionsClient from './connections-client'
import { getSubscriptionStatus } from '@/app/actions/subscription'

export default async function ConnectionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch current connections
  const { data: connections } = await supabase
    .from('pluggy_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch all user assets to calculate balances
  const { data: assets } = await supabase
    .from('assets')
    .select('pluggy_item_id, quantity, current_price')
    .eq('user_id', user.id)

  let globalTotal = 0
  
  const connectionsWithBalances = (connections || []).map(conn => {
    const connAssets = (assets || []).filter(a => a.pluggy_item_id === conn.pluggy_item_id)
    const totalBalance = connAssets.reduce((sum, a) => sum + (a.quantity * a.current_price), 0)
    globalTotal += totalBalance
    return {
      ...conn,
      totalBalance
    }
  })

  const { status } = await getSubscriptionStatus()

  return <ConnectionsClient initialConnections={connectionsWithBalances} globalTotal={globalTotal} subscriptionStatus={status} />
}
