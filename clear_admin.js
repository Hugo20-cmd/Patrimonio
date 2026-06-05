const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qgzgkzhepflqyfwkaaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnemdremhlcGZscXlmd2thYW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAyMDMxMywiZXhwIjoyMDk1NTk2MzEzfQ.-WN2nbaPMVaQw2js0jfyGi3Z26RbnLJTM-HqfcYeLFc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clear() {
  const email = 'contatopennamc@gmail.com';
  console.log(`Buscando perfil para ${email}...`);

  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email);

  if (profileError || !profiles || profiles.length === 0) {
    console.error("Erro ou usuário não encontrado:", profileError);
    return;
  }

  const userId = profiles[0].id;
  
  // Limpar todos os dados fictícios
  console.log("Apagando ativos e transações...");
  await supabase.from('assets').delete().eq('user_id', userId);
  await supabase.from('asset_transactions').delete().eq('user_id', userId);
  await supabase.from('transactions').delete().eq('user_id', userId);

  // Resetar perfil
  console.log("Resetando nome do perfil...");
  await supabase.from('profiles').update({
    xp: 0,
    level: 1,
    name: 'Administrador',
  }).eq('id', userId);

  console.log("✅ Conta resetada para zero (limpa) com sucesso!");
}

clear().catch(console.error);
