export const dynamic = 'force-dynamic';
import { getMarketNews } from "@/app/actions/news";
import NewsClient from "./news-client";
import PremiumPaywall from "@/components/layout/PremiumPaywall";

export default async function NewsPage() {
  const newsResponse = await getMarketNews();

  if (newsResponse.error === 'premium_required') {
    return (
      <PremiumPaywall 
        title="Central de Informações de Mercado"
        description="Receba atualizações em tempo real sobre o mercado financeiro, economia, política e as principais notícias que afetam seus investimentos. Exclusivo para assinantes Premium."
        featureName="Notícias"
      />
    );
  }

  return <NewsClient initialNews={newsResponse.data || []} />;
}
