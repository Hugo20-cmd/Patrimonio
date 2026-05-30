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

  return (
    <div style={{ padding: '40px', background: 'white', color: 'black', minHeight: '100vh', fontFamily: 'monospace' }}>
      <h1>Debug Supabase</h1>
      
      <h2>1. Insert Error:</h2>
      <pre style={{ color: 'red' }}>{JSON.stringify(insertError, null, 2)}</pre>
      <h2>1. Insert Data:</h2>
      <pre>{JSON.stringify(insertData, null, 2)}</pre>

      <hr />

      <h2>2. Select Error:</h2>
      <pre style={{ color: 'red' }}>{JSON.stringify(selectError, null, 2)}</pre>
      <h2>2. Select Data:</h2>
      <pre>{JSON.stringify(selectData, null, 2)}</pre>
    </div>
  )
}
