'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const category = formData.get('category') as string
  const message = formData.get('message') as string

  const { error } = await supabase
    .from('feedback')
    .insert({
      user_id: userData.user.id,
      category,
      message,
      status: 'new'
    })

  if (error) return { error: error.message }
  return { success: true }
}

export async function getFeedback(statusFilter?: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return []

  // Check if admin (implement your own admin logic here, e.g. role check)
  // For simplicity, we just fetch all feedback if they have access to the admin page.

  let query = supabase.from('feedback').select(`
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
    .from('feedback')
    .update({ status })
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}
