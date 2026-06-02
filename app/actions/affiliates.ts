'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAffiliateData() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  // Get my profile to find my referral code
  const { data: myProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('referral_code, plan')
    .eq('id', userData.user.id)
    .single()

  if (profileErr) {
    return { error: profileErr.message }
  }

  // Get users who were referred by me
  const { data: referrals, error: refErr } = await supabase
    .from('profiles')
    .select('id, full_name, created_at, plan')
    .eq('referred_by', userData.user.id)

  if (refErr) {
    return { error: refErr.message }
  }

  const totalReferred = referrals?.length || 0
  const premiumReferred = referrals?.filter(r => r.plan === 'premium').length || 0
  
  // Calculate estimated commission (ex: 30% of R$ 19.99 = R$ 6.00 per active premium user)
  const monthlyCommission = premiumReferred * 6.00

  // Format referral list for UI
  const formattedReferrals = (referrals || []).map(r => {
    // Mask name for privacy (e.g., Marcos Ribeiro -> Ma*** Ri***)
    const parts = (r.full_name || 'Usuário').split(' ');
    const maskedName = parts.map(p => p.length > 2 ? p.substring(0, 2) + '***' : p).join(' ');

    return {
      id: r.id,
      name: maskedName,
      date: r.created_at,
      plan: r.plan,
      status: r.plan === 'premium' ? 'Ativo (Gerando Comissão)' : 'Aguardando Assinatura'
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    success: true,
    data: {
      referralCode: myProfile.referral_code,
      totalReferred,
      premiumReferred,
      monthlyCommission,
      referrals: formattedReferrals
    }
  }
}
