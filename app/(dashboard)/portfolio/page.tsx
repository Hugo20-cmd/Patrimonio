export const dynamic = 'force-dynamic';
import { getAssets } from "@/app/actions/assets";
import { getAssetTransactions } from "@/app/actions/asset-transactions";
import PortfolioClient from "./portfolio-client";
import { getSubscriptionStatus } from "@/app/actions/subscription";

export default async function PortfolioPage() {
  const assets = await getAssets();
  const transactions = await getAssetTransactions();
  const { status } = await getSubscriptionStatus();
  
  return <PortfolioClient initialAssets={assets || []} initialTransactions={transactions || []} subscriptionStatus={status} />;
}
