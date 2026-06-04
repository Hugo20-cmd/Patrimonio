'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { headers, cookies } from 'next/headers'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Single Session implementation
  if (authData.user) {
    const sessionToken = crypto.randomUUID()
    await supabase.from('profiles').update({
      current_session_token: sessionToken
    }).eq('id', authData.user.id)
    
    const cookieStore = await cookies()
    cookieStore.set('session_token', sessionToken, { httpOnly: true, secure: true, path: '/' })
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const dataToSubmit = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'

  // IP Restriction
  const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('last_ip', ip)
  if (count && count >= 1) {
    // Record attempt for audit
    await supabase.from('audit_logs').insert({ type: 'multi_account_attempt', ip, email: dataToSubmit.email })
    return { error: 'Acesso negado: Limite de contas por ambiente excedido.' }
  }

  const { data, error } = await supabase.auth.signUp({
    ...dataToSubmit,
    options: {
      data: { 
        last_ip: ip,
        name: formData.get('name') as string || null
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Generate initial session token and handle referrals
  if (data.user) {
    const sessionToken = crypto.randomUUID()
    const myReferralCode = crypto.randomUUID().split('-')[0].toUpperCase()
    
    let referredById = null
    let referralCode = formData.get('referralCode') as string
    if (referralCode) {
      // If user pasted full URL, extract the code
      if (referralCode.includes('=')) {
        referralCode = referralCode.split('=').pop() || referralCode
      }
      referralCode = referralCode.trim()

      const { data: referrer } = await supabaseAdmin.from('profiles').select('id').eq('referral_code', referralCode).single()
      if (referrer) {
        referredById = referrer.id
      }
    }

    // The profile is created by a DB trigger after auth.signUp.
    // We retry upsert a few times to handle the async delay of the trigger.
    const profilePayload = {
      id: data.user.id,
      last_ip: ip,
      current_session_token: sessionToken,
      referral_code: myReferralCode,
      referred_by: referredById,
      email: dataToSubmit.email,
      name: formData.get('name') as string || null,
    }

    let saved = false
    for (let attempt = 0; attempt < 5; attempt++) {
      // Wait 300ms on each retry to give the trigger time to fire
      if (attempt > 0) await new Promise(r => setTimeout(r, 300))
      
      const { error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' })
      
      if (!upsertError) { saved = true; break }
      console.warn(`[signup] Profile upsert attempt ${attempt + 1} failed:`, upsertError.message)
    }

    if (!saved) {
      console.error('[signup] Failed to save referral data after 5 attempts for user:', data.user.id)
    }

    // Só grava o cookie de sessão se o Supabase já logou o usuário direto (Sem confirmação de e-mail)
    if (data.session) {
      const cookieStore = await cookies()
      cookieStore.set('session_token', sessionToken, { httpOnly: true, secure: true, path: '/' })
    }
  }

  // Send Welcome Email
  const { sendWelcomeEmail } = await import('@/app/actions/emails');
  await sendWelcomeEmail(dataToSubmit.email, "Investidor");

  // If email confirmation is required, session will be null
  if (!data.session) {
    return { success: true, message: "Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro e fazer login." }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
