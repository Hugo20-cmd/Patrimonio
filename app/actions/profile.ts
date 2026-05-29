'use server'

import { createClient } from '@/utils/supabase/server'

export async function getProfile() {
  const supabase = await createClient()
  
  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  if (userError || !userData.user) {
    return null
  }

  // Fetch from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single()

  // If there's no profile yet (e.g. trigger didn't run or is delayed), return a fallback
  if (!profile) {
    return {
      id: userData.user.id,
      name: userData.user.user_metadata?.name || 'Novo Investidor',
      email: userData.user.email,
      level: 1,
      xp: 0,
      xp_to_next_level: 1000,
      streak: 0
    }
  }

  return {
    id: profile.id,
    name: profile.name || 'Investidor',
    email: profile.email,
    level: profile.level || 1,
    xp: profile.xp || 0,
    xpToNextLevel: profile.xp_to_next_level || 1000,
    avatarUrl: profile.avatar_url,
    streak: 0 // Mock streak for now
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return { error: 'Usuário não autenticado' }
  }

  const name = formData.get('name') as string
  const avatarFile = formData.get('avatar') as File | null

  let avatarUrl = undefined

  // Garantir que o bucket "avatars" existe antes de fazer upload
  const { data: bucketList, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('Erro ao listar buckets:', bucketError);
    return { error: `Erro ao listar buckets: ${bucketError.message}` };
  }
  const bucketExists = bucketList?.some(b => b.id === 'avatars');
  if (!bucketExists) {
    const { error: createError } = await supabase.storage.createBucket('avatars', { public: true });
    console.error('Erro ao criar bucket avatars:', createError);
    return { error: `Erro ao criar bucket avatars: ${createError.message}` };
  }

  // Lógica de Upload de Imagem
  if (avatarFile && avatarFile.size > 0) {
    // Se o bucket já existia ou foi criado, prossegue com o upload
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `${userData.user.id}-${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      console.error('Erro ao fazer upload da imagem:', uploadError);
      return { error: `Erro ao fazer upload da imagem: ${uploadError.message}` };
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    avatarUrl = publicUrlData.publicUrl;
  }

  // Atualizar ou Criar o perfil
  const updateData: any = { 
    id: userData.user.id,
    name,
    email: userData.user.email
  }
  if (avatarUrl) {
    updateData.avatar_url = avatarUrl
  }

  const { data: updatedProfile, error: upsertError } = await supabase
    .from('profiles')
    .upsert(updateData)
    .select()
    .single()

  if (upsertError) {
    console.error('Erro ao atualizar perfil:', upsertError);
    return { error: `Erro ao atualizar perfil: ${upsertError.message}` }
  }

  return { success: true, avatarUrl, profile: updatedProfile }
}

export async function debugBuckets() {
  const supabase = await createClient()
  const { data, error } = await supabase.storage.listBuckets()
  return { data, error }
}
