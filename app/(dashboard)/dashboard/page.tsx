import { getAssets } from "@/app/actions/assets";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const assets = await getAssets();
  
  return <DashboardClient initialAssets={assets} />;
}
