import { getMarketNews } from "@/app/actions/news";
import NewsClient from "./news-client";
import PremiumPaywall from "@/components/layout/PremiumPaywall";

export default async function NewsPage() {
  const newsResponse = await getMarketNews();

  if (newsResponse.error === 'premium_required') {
    return (
      <PremiumPaywall 
        title="Central de Informaçíµes de Mercado"
        description="Receba atualizaçíµes em tempo real sobre o mercado financeiro, economia, polí­tica e as principais notí­cias que afetam seus investimentos. Exclusivo para assinantes Premium."
        featureName="Notí­cias"
      />
    );
  }

  return <NewsClient initialNews={newsResponse.data || []} />;
}
