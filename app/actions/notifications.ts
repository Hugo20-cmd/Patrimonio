'use server'

import { createClient } from '@/utils/supabase/server'

export async function getNotifications() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return []

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return data || []
}

export async function getUnreadCount() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return 0

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.user.id)
    .eq('is_read', false)

  return count || 0
}

export async function markAsRead(id: string) {
  const supabase = await createClient()
  await supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userData.user.id)
}

export async function createNotification(
  title: string,
  message: string,
  type: 'info' | 'alert' | 'dividend' | 'achievement' = 'info',
  userIdOverride?: string
) {
  const supabase = await createClient()
  let targetUserId = userIdOverride;

  if (!targetUserId) {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return
    targetUserId = userData.user.id
  }

  // 1. Salvar no banco de dados para mostrar no painel
  await supabase.from('notifications').insert({
    user_id: targetUserId,
    title,
    message,
    type,
  })

  // 2. Disparar notificação Push via OneSignal
  try {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (appId && apiKey) {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${apiKey}`
        },
        body: JSON.stringify({
          app_id: appId,
          include_aliases: {
            external_id: [targetUserId]
          },
          target_channel: "push",
          headings: { en: title, pt: title },
          contents: { en: message, pt: message }
        })
      });
      
      const responseData = await response.json();
      console.log('OneSignal Push Result:', responseData);
    }
  } catch (err) {
    console.error('Falha ao enviar push notification:', err);
  }
}
