import { getAssets } from "@/app/actions/assets";
import { getDividends } from "@/app/actions/dividends";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const assets = await getAssets();
  const dividends = await getDividends();
  
  return <DashboardClient initialAssets={assets} dividends={dividends} />;
}
