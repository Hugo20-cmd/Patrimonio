'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// REGEX Anti-Spam (Bot)
// Bloqueia links suspeitos, palavras ofensivas ou tentativas de golpe (phishing)
const SPAM_REGEX = /(http|https):\/\/(?!([a-zA-Z0-9-]+\.)?(patrimonioplus\.com|youtube\.com|b3\.com\.br|infomoney\.com\.br|valoreconomico\.globo\.com))[^\s]+/i;
const OFFENSIVE_WORDS = ['golpe', 'aposta', 'casino', 'cassino', 'bet', 'tigrinho', 'urubu do pix', 'robô do pix', 'pirí­Â¢mide'];

function isSpam(content: string): { isSpam: boolean, reason?: string } {
  // Verifica links maliciosos ou não permitidos
  if (SPAM_REGEX.test(content)) {
    return { isSpam: true, reason: 'Link suspeito detectado. Apenas fontes confiáveis são permitidas.' }
  }

  // Verifica palavras ofensivas
  const contentLower = content.toLowerCase();
  for (const word of OFFENSIVE_WORDS) {
    if (contentLower.includes(word)) {
      return { isSpam: true, reason: 'Conteí­Âºdo viola as diretrizes da comunidade (Palavra bloqueada).' }
    }
  }

  return { isSpam: false }
}

export async function getForumPosts() {
  const supabase = await createClient()

  // Verifica se é premium ou admin
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return { error: 'Not authenticated' }

  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br']
  const userEmail = userData.user.email?.toLowerCase().trim() || ''
  const isAdmin = ADMIN_EMAILS.includes(userEmail)

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userData.user.id)
    .single()

  if (profile?.plan !== 'premium' && !isAdmin) {
    return { error: 'premium_required' }
  }

  // Busca os posts com informaçí­Âµes do usuário (fazendo join manual ou usando view)
  const { data: posts, error } = await supabase
    .from('forum_posts')
    .select(`
      id, title, content, likes_count, comments_count, is_pinned, created_at, user_id
    `)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return { error: error.message }

  // Como o supabase não tem as informaçí­Âµes do usuário em uma tabela pí­Âºblica por padrão,
  // pegamos do profiles de forma simplificada. Numa app real fariamos um view ou RPC.
  const { data: profiles } = await supabase.from('profiles').select('id, name, avatar_url, level')
  
  const enrichedPosts = posts.map(post => {
    const author = profiles?.find(p => p.id === post.user_id)
    return {
      ...post,
      author: {
        name: author?.name || 'Investidor Anônimo',
        avatarUrl: author?.avatar_url,
        level: author?.level || 1
      }
    }
  })

  return { success: true, data: enrichedPosts }
}

export async function createForumPost(formData: FormData) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  
  if (!userData?.user) return { error: 'Not authenticated' }

  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br']
  const userEmail = userData.user.email?.toLowerCase().trim() || ''
  const isAdmin = ADMIN_EMAILS.includes(userEmail)

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', userData.user.id).single()
  if (profile?.plan !== 'premium' && !isAdmin) return { error: 'Apenas usuários Premium podem postar.' }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // Anti-Spam Bot Check
  const spamCheck = isSpam(content)
  if (spamCheck.isSpam) {
    return { error: `Bot Anti-Spam: ${spamCheck.reason}` }
  }

  const { error } = await supabase
    .from('forum_posts')
    .insert({
      user_id: userData.user.id,
      title,
      content
    })

  if (error) return { error: error.message }

  revalidatePath('/community')
  return { success: true }
}
