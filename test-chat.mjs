import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qgzgkzhepflqyfwkaaoo.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_TUHMP88LONN0-hw5F_1LvA_Jofzdjr6'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select(`
      id,
      content,
      channel,
      created_at,
      reply_to_id,
      is_pinned,
      profiles:user_id (id, name, level)
    `)
    .eq('channel', 'geral')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(100)

  console.log('Error:', error)
  console.log('Messages:', messages)
}

test()
