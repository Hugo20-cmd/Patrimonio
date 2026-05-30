import { getChatMessages } from "@/app/actions/chat";
import ChatClient from "./chat-client";
import PremiumPaywall from "@/components/layout/PremiumPaywall";

export const dynamic = 'force-dynamic'

export default async function ForumPage() {
  const postsResponse = await getChatMessages('geral');

  if (postsResponse.error === 'premium_required') {
    return (
      <PremiumPaywall 
        title="Comunidade VIP de Investidores"
        description="Junte-se ao chat exclusivo em tempo real. Troque ideias sobre ações, FIIs e cripto de forma rápida e segura, longe de spans e bots."
        featureName="Chat VIP"
      />
    );
  }

  return <ChatClient initialMessages={postsResponse.data || []} />;
}
