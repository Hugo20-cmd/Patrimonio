'use server'

import { createClient } from '@/utils/supabase/server'

export async function getSubscriptionStatus() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { status: 'free' }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userData.user.id)
    .single()

  if (!subscription) return { status: 'free' }

  // Check if active or past due
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    return { status: 'premium', current_period_end: subscription.current_period_end }
  }

  return { status: 'free' }
}

export async function getUserLimits() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return { assetCount: 0, connectionCount: 0 }

  const { count: assetCount } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.user.id)

  const { count: connectionCount } = await supabase
    .from('pluggy_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.user.id)

  return { assetCount: assetCount || 0, connectionCount: connectionCount || 0 }
}
