'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'

// Usar o service role key para ter permissão total
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'
)

export async function getAdminStats() {
  const supabase = await createServerClient()
  const { data: userData } = await supabase.auth.getUser()

  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br']
  const userEmail = userData?.user?.email?.toLowerCase().trim() || ''

  if (!ADMIN_EMAILS.includes(userEmail)) {
    return { error: 'Unauthorized' }
  }

  // Pegar total de usuários (profiles)
  const { count: totalUsers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Pegar usuários premium
  const { count: premiumUsers } = await supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // Novos usuários hoje
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: newUsersToday } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  const MRR = (premiumUsers || 0) * 19.99 // Exemplo de preço

  // Pegar últimos usuários
  const { data: latestUsers } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email, plan, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  // Atualizar planos dos latestUsers baseado nas subscriptions
  const userIds = latestUsers?.map(u => u.id) || []
  const { data: subs } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, status')
    .in('user_id', userIds)
    .eq('status', 'active')

  const premiumUserIds = new Set(subs?.map(s => s.user_id) || [])

  const formattedUsers = latestUsers?.map(u => ({
    id: u.id,
    name: u.name || 'Sem nome',
    email: u.email,
    plan: premiumUserIds.has(u.id) || ADMIN_EMAILS.includes(u.email?.toLowerCase().trim()) ? 'Premium' : 'Free',
    date: new Date(u.created_at).toLocaleDateString('pt-BR'),
    status: 'Ativo'
  })) || []

  // Pegar feedbacks pendentes
  const { data: feedbacks } = await supabaseAdmin
    .from('feedbacks')
    .select(`
      id, content, type, status, created_at,
      profiles ( name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  const formattedFeedbacks = feedbacks?.map(f => ({
    id: f.id,
    content: f.content,
    type: f.type,
    status: f.status,
    date: new Date(f.created_at).toLocaleDateString('pt-BR'),
    userName: (f.profiles as any)?.name || 'Anônimo',
    userEmail: (f.profiles as any)?.email || ''
  })) || []

  return {
    success: true,
    stats: {
      totalUsers: totalUsers || 0,
      premiumUsers: premiumUsers || 0,
      newUsersToday: newUsersToday || 0,
      MRR,
    },
    latestUsers: formattedUsers,
    feedbacks: formattedFeedbacks
  }
}

export async function updateFeedbackStatus(id: string, status: string) {
  const supabase = await createServerClient()
  const { data: userData } = await supabase.auth.getUser()

  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br']
  const userEmail = userData?.user?.email?.toLowerCase().trim() || ''

  if (!ADMIN_EMAILS.includes(userEmail)) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabaseAdmin
    .from('feedbacks')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function searchReferralsByCode(code: string) {
  const supabase = await createServerClient()
  const { data: userData } = await supabase.auth.getUser()

  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br']
  const userEmail = userData?.user?.email?.toLowerCase().trim() || ''

  if (!ADMIN_EMAILS.includes(userEmail)) {
    return { error: 'Unauthorized' }
  }

  // Find user with this referral code
  const { data: referrer, error: refErr } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email, xp')
    .ilike('referral_code', code)
    .single()

  if (refErr || !referrer) {
    return { error: 'Código de indicação não encontrado' }
  }

  // Get users who were referred by this user
  const { data: referrals } = await supabaseAdmin
    .from('profiles')
    .select('id, name, email, created_at')
    .eq('referred_by', referrer.id)

  const referralIds = (referrals || []).map(r => r.id);
  
  let activePremiumIds = new Set();
  if (referralIds.length > 0) {
    const { data: subsData } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, status')
      .in('user_id', referralIds);

    activePremiumIds = new Set(
      (subsData || [])
        .filter(s => s.status === 'active' || s.status === 'trialing')
        .map(s => s.user_id)
    );
  }

  const formattedReferrals = (referrals || []).map(r => ({
    id: r.id,
    name: r.name || 'Usuário',
    email: r.email || 'N/A',
    date: r.created_at,
    isPremium: activePremiumIds.has(r.id)
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    success: true,
    data: {
      referrer: {
        name: referrer.name,
        email: referrer.email,
        xp: referrer.xp
      },
      totalReferred: formattedReferrals.length,
      premiumReferred: activePremiumIds.size,
      referrals: formattedReferrals
    }
  }
}
