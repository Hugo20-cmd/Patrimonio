'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const category = formData.get('category') as string
  const message = formData.get('message') as string

  const { error } = await supabase
    .from('feedbacks')
    .insert({
      user_id: userData.user.id,
      type: category,
      content: message,
      status: 'pendente'
    })

  if (error) return { error: error.message }
  
  // Enviar email para o admin
  const { sendNewFeedbackEmail } = await import('./emails')
  await sendNewFeedbackEmail(userData.user.user_metadata?.name || 'Usuário', category, message)

  return { success: true }
}

export async function getFeedback(statusFilter?: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return []

  let query = supabase.from('feedbacks').select(`
    *,
    profiles ( name, email )
  `).order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query
  if (error) return []
  
  return data
}

export async function updateFeedbackStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('feedbacks')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
