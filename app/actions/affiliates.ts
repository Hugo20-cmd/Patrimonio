'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAffiliateData() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  // Get my profile to find my referral code
  const { data: myProfile, error: profileErr } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userData.user.id)
    .single()

  if (profileErr) {
    return { error: profileErr.message }
  }

  // Get users who were referred by me
  const { data: referrals, error: refErr } = await supabase
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('referred_by', userData.user.id)

  if (refErr) {
    return { error: refErr.message }
  }

  // Fetch subscriptions for these referrals
  const referralIds = (referrals || []).map(r => r.id);
  const { data: subsData } = await supabase
    .from('subscriptions')
    .select('user_id, status')
    .in('user_id', referralIds);

  const activePremiumIds = new Set(
    (subsData || [])
      .filter(s => s.status === 'active' || s.status === 'trialing')
      .map(s => s.user_id)
  );

  const totalReferred = referrals?.length || 0
  const premiumReferred = activePremiumIds.size
  
  // Calculate estimated commission (ex: 30% of R$ 19.99 = R$ 6.00 per active premium user)
  const monthlyCommission = premiumReferred * 6.00

  // Format referral list for UI
  const formattedReferrals = (referrals || []).map(r => {
    // Mask name for privacy (e.g., Marcos Ribeiro -> Ma*** Ri***)
    const parts = (r.full_name || 'Usuário').split(' ');
    const maskedName = parts.map(p => p.length > 2 ? p.substring(0, 2) + '***' : p).join(' ');
    
    const isPremium = activePremiumIds.has(r.id);

    return {
      id: r.id,
      name: maskedName,
      date: r.created_at,
      plan: isPremium ? 'premium' : 'free',
      status: isPremium ? 'Ativo (Gerando Comissão)' : 'Aguardando Assinatura'
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
