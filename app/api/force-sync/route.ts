import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { checkTransactionAchievements, unlockAchievement } from '@/app/actions/gamification'

export async function GET() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) return NextResponse.json({ error: 'Not authenticated' })

  const userId = userData.user.id

  // Force unlock primeira_transacao
  const test1 = await unlockAchievement(userId, 'primeira_transacao')

  // Force sync
  const test2 = await checkTransactionAchievements(userId)

  return NextResponse.json({
    test1,
    test2
  })
}
