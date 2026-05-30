import { getForumPosts } from "@/app/actions/forum";
import ForumClient from "./forum-client";
import PremiumPaywall from "@/components/layout/PremiumPaywall";

export default async function ForumPage() {
  const postsResponse = await getForumPosts();

  if (postsResponse.error === 'premium_required') {
    return (
      <PremiumPaywall 
        title="Comunidade de Investidores"
        description="Junte-se à nossa comunidade fechada de investidores de alto nível. Compartilhe estratégias, discuta análises de ativos e tire dúvidas em um ambiente livre de spam e golpes."
        featureName="Comunidade e Fórum"
      />
    );
  }

  return <ForumClient initialPosts={postsResponse.data || []} />;
}
