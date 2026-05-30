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
    .select('plan, email')
    .eq('id', userData.user.id)
    .single()

  const ADMIN_EMAILS = ['contatopennamc@gmail.com']
  const userEmail = userData.user.email?.toLowerCase().trim() || profile?.email?.toLowerCase().trim() || ''
  const isAdmin = ADMIN_EMAILS.includes(userEmail)

  if (profile?.plan !== 'premium' && !isAdmin) {
    return { error: 'premium_required' }
  }

  // Fetch messages
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select(`
      id,
      content,
      channel,
      created_at,
      reply_to_id,
      profiles:user_id (id, name, level)
    `)
    .eq('channel', channel)
    .order('created_at', { ascending: true }) // Em chat, as antigas ficam em cima, rola pra baixo
    .limit(100)

  if (error) return { error: error.message }
  return { success: true, data: messages || [] }
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

  // Dar XP por participar do chat (1 XP por msg para evitar farm, com limite diário na teoria, mas simplificado aqui)
  const { addXp } = await import('./gamification')
  await addXp(userData.user.id, 1)

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
    .eq('user_id', userData.user.id) // RLS também protege, mas é bom garantir

  if (error) return { error: error.message }

  revalidatePath('/community')
  return { success: true }
}

async function createServerClient() {
  return await createClient()
}
