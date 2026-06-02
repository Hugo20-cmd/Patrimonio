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
    if (!userData?.user) return { success: false, error: 'User not found' }
    targetUserId = userData.user.id
  }

  // Use the admin client to bypass RLS for inserts
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Salvar no banco de dados para mostrar no painel
  const { error: insertError } = await supabaseAdmin.from('notifications').insert({
    user_id: targetUserId,
    title,
    message,
    type,
  })

  if (insertError) {
    console.error("Erro ao salvar notificação no banco:", insertError);
  }

  // 2. Disparar notificação Push via OneSignal
  try {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
      console.log('OneSignal não configurado. As chaves estão faltando.');
      return { success: true, warning: 'Notificação salva no sino, mas o OneSignal não está configurado na Vercel.' };
    }

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
    
    if (responseData.errors) {
      return { success: false, error: 'Erro no OneSignal: ' + JSON.stringify(responseData.errors) };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Falha ao enviar push notification:', err);
    return { success: false, error: 'Falha na conexão com OneSignal: ' + err.message };
  }
}
