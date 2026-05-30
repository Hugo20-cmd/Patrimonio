import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { syncRetroactiveXp } from '@/app/actions/gamification'

export async function GET() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) return NextResponse.json({ error: 'Not authenticated' })

  const userId = userData.user.id

  // 1. Apagar todas as conquistas do usuário (Reset Total)
  const { error: deleteAchError } = await supabase
    .from('user_achievements')
    .delete()
    .eq('user_id', userId)

  if (deleteAchError) return NextResponse.json({ error: 'Falha ao deletar conquistas', details: deleteAchError })

  // 2. Apagar XP atual do perfil
  const { error: resetProfileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      xp: 0,
      level: 1,
      xp_to_next_level: 1000
    }, { onConflict: 'id' })

  if (resetProfileError) return NextResponse.json({ error: 'Falha ao resetar perfil', details: resetProfileError })

  // 3. Sincronizar novamente baseado no estado real do banco agora mesmo
  const result = await syncRetroactiveXp()

  return NextResponse.json({
    message: "Gamificação Resetada com Sucesso!",
    sync_result: result
  })
}
