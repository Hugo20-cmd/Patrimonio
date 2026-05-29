import { getAssets } from "@/app/actions/assets";
import PortfolioClient from "./portfolio-client";
import { getSubscriptionStatus } from "@/app/actions/subscription";

export default async function PortfolioPage() {
  const assets = await getAssets();
  const { status } = await getSubscriptionStatus();
  
  return <PortfolioClient initialAssets={assets || []} subscriptionStatus={status} />;
}
