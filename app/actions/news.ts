'use server'

import { createClient } from '@/utils/supabase/server'

// Hardcoded keys as requested
const NEWSAPI_KEY = '64b63cb06fd99cc5e897e2324097eb2b';
const FINNHUB_KEY = 'd8ck39hr01qidic89p30d8ck39hr01qidic89p3g';

export async function getMarketNews() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData?.user) return { error: 'Não autenticado' }

  // Verificar se é Premium ou Admin
  const ADMIN_EMAILS = ['contatopennamc@gmail.com']
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

  let unifiedNews: any[] = [];
  let idCounter = 1;

  // Array de imagens fallback bonitas sobre finanças
  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1642543348745-03b1219733d9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
  ];

  const getFallbackImage = (id: number) => FALLBACK_IMAGES[id % FALLBACK_IMAGES.length];

  // 1. Fetch NewsAPI (Brazil Business)
  try {
    const newsApiRes = await fetch(`https://newsapi.org/v2/top-headlines?country=br&category=business&apiKey=${NEWSAPI_KEY}`, { next: { revalidate: 3600 } });
    if (newsApiRes.ok) {
      const data = await newsApiRes.json();
      if (data.articles) {
        data.articles.forEach((article: any) => {
          if (article.title && article.title !== '[Removed]') {
            unifiedNews.push({
              id: idCounter++,
              title: article.title,
              summary: article.description || 'Leia a matéria completa na fonte original.',
              source: article.source?.name || 'NewsAPI',
              category: 'Economia e Negócios',
              url: article.url,
              imageUrl: article.urlToImage || getFallbackImage(idCounter),
              publishedAt: article.publishedAt || new Date().toISOString()
            });
          }
        });
      }
    }
  } catch (error) {
    console.error("NewsAPI Error:", error);
  }

  // 2. Fetch Finnhub (Global Market News)
  try {
    const finnhubRes = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`, { next: { revalidate: 3600 } });
    if (finnhubRes.ok) {
      const data = await finnhubRes.json();
      if (Array.isArray(data)) {
        // Limit Finnhub to 15 news so we don't overload the UI
        data.slice(0, 15).forEach((article: any) => {
          unifiedNews.push({
            id: idCounter++,
            title: article.headline,
            summary: article.summary || 'Acompanhe as atualizações do mercado financeiro global.',
            source: article.source || 'Finnhub',
            category: article.category === 'general' ? 'Mercado Global' : article.category,
            url: article.url,
            imageUrl: article.image || getFallbackImage(idCounter),
            // Finnhub returns datetime in unix timestamp seconds
            publishedAt: new Date(article.datetime * 1000).toISOString()
          });
        });
      }
    }
  } catch (error) {
    console.error("Finnhub Error:", error);
  }

  // Se ambas falharem ou retornarem vazias, enviamos um mock elegante
  if (unifiedNews.length === 0) {
    unifiedNews = [
      {
        id: idCounter++,
        title: "Atualizações de Mercado Pausadas",
        summary: "Nossos provedores de dados estão passando por manutenção momentânea. Tente atualizar a página em alguns instantes.",
        source: "Patrimônio+ System",
        category: "Aviso",
        url: "#",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
        publishedAt: new Date().toISOString()
      }
    ];
  } else {
    // Sort combined array by publishedAt descending (newest first)
    unifiedNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  return {
    success: true,
    data: unifiedNews
  }
}
