import { getSimulatorAccount, getSimulatorPositions, getSimulatorHistory } from "@/app/actions/simulator";
import { getMultipleQuotes } from "@/app/actions/market";
import HomeBrokerClient from "./home-broker-client";

export const dynamic = 'force-dynamic';

export default async function HomeBrokerPage() {
  const account = await getSimulatorAccount();
  const positions = await getSimulatorPositions();
  const history = await getSimulatorHistory();

  // Fetch live quotes for the portfolio to calculate profitability
  const tickers = positions.map((p: any) => p.ticker);
  const quotes = await getMultipleQuotes(tickers);

  return (
    <HomeBrokerClient 
      initialAccount={account} 
      initialPositions={positions} 
      initialHistory={history} 
      initialQuotes={quotes}
    />
  );
}
