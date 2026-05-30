'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkGoalAchievements } from './gamification'

export async function getGoals() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching goals:', error)
    return []
  }

  return data.map((g: any) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    targetAmount: Number(g.target_amount),
    currentAmount: Number(g.current_amount),
    deadline: g.deadline,
    category: g.category,
    color: g.color,
  }))
}

export async function addGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const targetAmount = Number(formData.get('targetAmount'))
  const deadline = formData.get('deadline') as string
  const category = formData.get('category') as string
  
  const categoriesColors: any = {
    patrimonio: '#fb923c',
    reserva: '#4f6ef7',
    aposentadoria: '#00d4aa',
    objetivo: '#8b5cf6'
  }
  const color = categoriesColors[category] || '#00d4aa'

  const { error } = await supabase
    .from('goals')
    .insert({
      user_id: userData.user.id,
      title,
      description,
      target_amount: targetAmount,
      current_amount: 0,
      deadline,
      category,
      color
    })

  if (error) return { error: error.message }

  revalidatePath('/goals')
  return { success: true }
}

export async function addProgressToGoal(goalId: string, amount: number) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const { data: goal } = await supabase
    .from('goals')
    .select('current_amount')
    .eq('id', goalId)
    .single()

  if (!goal) return { error: 'Goal not found' }

  const newAmount = Number(goal.current_amount) + amount

  const { error } = await supabase
    .from('goals')
    .update({ current_amount: newAmount })
    .eq('id', goalId)

  if (error) return { error: error.message }

  // Disparar gatilho de gamificação
  await checkGoalAchievements(userData.user.id, goalId)

  revalidatePath('/goals')
  return { success: true }
}

export async function deleteGoal(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/goals')
  return { success: true }
}
