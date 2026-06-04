'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function getSubscriptionStatus() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { status: 'free' }

  // 👑 ADMIN BYPASS (Acesso Vitalício)
  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br']
  const userEmail = userData.user.email?.toLowerCase().trim() || ''
  if (ADMIN_EMAILS.includes(userEmail)) {
    return { status: 'premium', current_period_end: '2099-12-31' }
  }

  // Use Admin Client to bypass RLS on subscriptions table
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subscription } = await supabaseAdmin
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

export async function getActiveSubscribersCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .in('status', ['active', 'trialing'])
    
  return count || 0
}
