const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qgzgkzhepflqyfwkaaoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnemdremhlcGZscXlmd2thYW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDAyMDMxMywiZXhwIjoyMDk1NTk2MzEzfQ.-WN2nbaPMVaQw2js0jfyGi3Z26RbnLJTM-HqfcYeLFc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
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
  console.log(`Usuário encontrado: ${userId}`);

  // Limpar dados antigos
  console.log("Limpando dados antigos...");
  await supabase.from('assets').delete().eq('user_id', userId);
  await supabase.from('asset_transactions').delete().eq('user_id', userId);
  await supabase.from('transactions').delete().eq('user_id', userId);

  // Inserir Ativos
  console.log("Inserindo ativos...");
  const today = new Date().toISOString().split('T')[0];
  const assetsToInsert = [
    { user_id: userId, ticker: 'PETR4', name: 'Petrobras', type: 'Ações BR', quantity: 500, average_price: 32.50, current_price: 36.80, currency: 'BRL', purchase_date: '2023-05-10' },
    { user_id: userId, ticker: 'IVVB11', name: 'iShares S&P 500', type: 'ETFs', quantity: 150, average_price: 240.00, current_price: 295.50, currency: 'BRL', purchase_date: '2023-01-15' },
    { user_id: userId, ticker: 'KNRI11', name: 'Kinea Renda Imobiliária', type: 'Fundos Imobiliários', quantity: 300, average_price: 155.00, current_price: 162.20, currency: 'BRL', purchase_date: '2023-08-20' },
    { user_id: userId, ticker: 'Tesouro IPCA+ 2035', name: 'Tesouro Direto', type: 'Renda Fixa', quantity: 5, average_price: 2100.00, current_price: 2250.00, currency: 'BRL', purchase_date: '2022-11-05' },
    { user_id: userId, ticker: 'AAPL', name: 'Apple Inc.', type: 'Ações EUA', quantity: 20, average_price: 150.00, current_price: 185.00, currency: 'USD', purchase_date: '2023-06-12' }
  ];
  await supabase.from('assets').insert(assetsToInsert);

  // Inserir Transações Financeiras (Lançamentos Gerais)
  console.log("Inserindo transações de fluxo de caixa...");
  const transactionsToInsert = [
    { user_id: userId, description: 'Salário', type: 'income', amount: 12500.00, date: today, category: 'Salário' },
    { user_id: userId, description: 'Aluguel', type: 'expense', amount: 3200.00, date: today, category: 'Moradia' },
    { user_id: userId, description: 'Mercado Mensal', type: 'expense', amount: 1850.00, date: today, category: 'Alimentação' },
    { user_id: userId, description: 'Dividendos PETR4', type: 'income', amount: 450.00, date: today, category: 'Dividendos' },
    { user_id: userId, description: 'Rendimentos KNRI11', type: 'income', amount: 300.00, date: today, category: 'Dividendos' },
    { user_id: userId, description: 'Aporte Mensal', type: 'expense', amount: 3000.00, date: today, category: 'Investimentos' }
  ];
  await supabase.from('transactions').insert(transactionsToInsert);

  // Atualizar Perfil (Dar XP, Nível e Avatar)
  console.log("Atualizando perfil com XP de teste...");
  await supabase.from('profiles').update({
    xp: 2500,
    level: 5,
    name: 'João Investidor (Demo)',
  }).eq('id', userId);

  console.log("✅ Banco de dados preenchido com sucesso para a conta Admin!");
}

seed().catch(console.error);
