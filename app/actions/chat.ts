'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getChatMessages(channel: string = 'geral') {
  const supabase = await createServerClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) return { error: 'unauthenticated' }

  // Check premium status (same as forum)
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userData.user.id)
  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br']
  const userEmail = userData.user.email?.toLowerCase().trim() || ''
  const isAdmin = ADMIN_EMAILS.includes(userEmail)

  const { getSubscriptionStatus } = await import('@/app/actions/subscription')
  const sub = await getSubscriptionStatus()
  const isPremium = sub.status === 'premium'

  if (!isPremium && !isAdmin) {
    return { error: 'premium_required' }
  }

  // Force Admin Profile Name update if they are the one fetching
  if (isAdmin) {
    await supabase.from('profiles').upsert({ 
      id: userData.user.id, 
      name: 'Patrimônio+',
      email: userEmail,
      plan: 'premium'
    }, { onConflict: 'id' })
  }

  // Fetch messages
  const { data: rawMessages, error } = await supabase
    .from('chat_messages')
    .select(`
      id,
      content,
      channel,
      created_at,
      reply_to_id,
      is_pinned,
      user_id
    `)
    .eq('channel', channel)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) return { error: error.message }

  // Manual join with profiles
  const userIds = [...new Set((rawMessages || []).map(m => m.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, level, email')
    .in('id', userIds)

  const adminId = isAdmin ? userData.user.id : null;

  const messages = (rawMessages || []).map(msg => {
    const profile = profiles?.find(p => p.id === msg.user_id)
    
    // Fallback if update didn't run yet or for other viewers checking the admin's message
    const isMessageFromAdmin = 
      (adminId && msg.user_id === adminId) || 
      ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br'].includes(profile?.email || '') || 
      profile?.name === 'Patrimônio+' || 
      profile?.name === 'Patrimônio+ 👑'
    
    return {
      ...msg,
      profiles: profile || { id: msg.user_id, name: isMessageFromAdmin ? 'Patrimônio+' : 'Usuário', level: 1 }
    }
  })

  return { success: true, data: messages }
}

export async function sendChatMessage(formData: FormData) {
  const supabase = await createServerClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) return { error: 'Not authenticated' }

  const channel = formData.get('channel') as string || 'geral'
  const content = formData.get('content') as string
  const replyToId = formData.get('reply_to_id') as string | null

  if (!content || content.trim() === '') return { error: 'Mensagem vazia' }

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      user_id: userData.user.id,
      channel,
      content,
      reply_to_id: replyToId ? replyToId : null
    })

  if (error) return { error: error.message }

  // Dar XP
  const { addXp } = await import('./gamification')
  await addXp(userData.user.id, 1)

  revalidatePath('/community')
  return { success: true }
}

export async function togglePinMessage(id: string, currentPinStatus: boolean) {
  const supabase = await createServerClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br']
  const userEmail = userData.user.email?.toLowerCase().trim() || ''
  
  if (!ADMIN_EMAILS.includes(userEmail)) {
    return { error: 'Apenas administradores podem fixar mensagens' }
  }

  const { error } = await supabase
    .from('chat_messages')
    .update({ is_pinned: !currentPinStatus })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/community')
  return { success: true }
}

export async function deleteChatMessage(id: string) {
  const supabase = await createServerClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.user.id)

  if (error) return { error: error.message }

  revalidatePath('/community')
  return { success: true }
}

async function createServerClient() {
  return await createClient()
}
