import { getMarketNews } from "@/app/actions/news";
import NewsClient from "./news-client";
import PremiumPaywall from "@/components/layout/PremiumPaywall";

export default async function NewsPage() {
  const newsResponse = await getMarketNews();

  if (newsResponse.error === 'premium_required') {
    return (
      <PremiumPaywall 
        title="Central de Informaçí­Âµes de Mercado"
        description="Receba atualizaçí­Âµes em tempo real sobre o mercado financeiro, economia, polí­Â­tica e as principais notí­Â­cias que afetam seus investimentos. Exclusivo para assinantes Premium."
        featureName="Notí­Â­cias"
      />
    );
  }

  return <NewsClient initialNews={newsResponse.data || []} />;
}
