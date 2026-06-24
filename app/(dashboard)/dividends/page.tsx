export const dynamic = 'force-dynamic';
import { getDividends } from "@/app/actions/dividends";
import DividendsClient from "./dividends-client";

export default async function DividendsPage() {
  const dividends = await getDividends();
  
  return <DividendsClient initialDividends={dividends} />;
}
