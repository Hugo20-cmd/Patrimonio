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

  const { status } = await getSubscriptionStatus()

  return <ConnectionsClient initialConnections={connections || []} subscriptionStatus={status} />
}
