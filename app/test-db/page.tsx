import { createClient } from '@/utils/supabase/server'

export default async function TestDbPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) return <div>Faça login primeiro</div>

  const userId = userData.user.id

  // Test 1: Insert into user_achievements
  const { data: insertData, error: insertError } = await supabase
    .from('user_achievements')
    .insert({ user_id: userId, achievement_key: 'test_achievement_' + Date.now() })
    .select()

  // Test 2: Select from user_achievements
  const { data: selectData, error: selectError } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)

  // Test 3: Upsert into profiles (XP)
  const { data: profileUpdateData, error: profileUpdateError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      xp: 150,
      level: 1,
      xp_to_next_level: 1000
    }, { onConflict: 'id' })
    .select()

  return (
    <div style={{ padding: '40px', background: 'white', color: 'black', minHeight: '100vh', fontFamily: 'monospace' }}>
      <h1>Debug Supabase - Profiles</h1>
      
      <h2>3. Profile Upsert Error:</h2>
      <pre style={{ color: 'red' }}>{JSON.stringify(profileUpdateError, null, 2)}</pre>
      <h2>3. Profile Upsert Data:</h2>
      <pre>{JSON.stringify(profileUpdateData, null, 2)}</pre>

      <hr />

      <h2>1. Insert Error:</h2>
      <pre style={{ color: 'red' }}>{JSON.stringify(insertError, null, 2)}</pre>
      <h2>2. Select Error:</h2>
      <pre style={{ color: 'red' }}>{JSON.stringify(selectError, null, 2)}</pre>
    </div>
  )
}
