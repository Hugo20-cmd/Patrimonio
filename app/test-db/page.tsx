import { createClient } from '@/utils/supabase/server'

export default async function TestDbPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) return <div>Faça login primeiro</div>

  const userId = userData.user.id

  // Upsert profile
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      xp: 250,
      level: 2,
      xp_to_next_level: 1000
    }, { onConflict: 'id' })

  // Select profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)

  return (
    <div style={{ padding: '40px', background: 'white', color: 'black', minHeight: '100vh', fontFamily: 'monospace' }}>
      <h1>Debug Profiles Final</h1>
      
      <h2>1. Profile Upsert Error:</h2>
      <pre style={{ color: 'red' }}>{JSON.stringify(upsertError, null, 2)}</pre>

      <h2>2. Profile Select Error:</h2>
      <pre style={{ color: 'red' }}>{JSON.stringify(profileError, null, 2)}</pre>
      
      <h2>3. Profile Data no Banco:</h2>
      <pre>{JSON.stringify(profileData, null, 2)}</pre>
    </div>
  )
}
