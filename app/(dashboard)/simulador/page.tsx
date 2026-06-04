import { getSimulatorAccount, getSimulatorPositions, getSimulatorHistory, getSimulatorRanking } from "@/app/actions/simulator";
import { getMultipleQuotes } from "@/app/actions/market";
import SimuladorClient from "./simulador-client";

export const dynamic = 'force-dynamic';

export default async function SimuladorPage() {
  const account = await getSimulatorAccount();
  const positions = await getSimulatorPositions();
  const history = await getSimulatorHistory();
  const ranking = await getSimulatorRanking();

  // Fetch live quotes for the portfolio to calculate profitability
  const tickers = positions.map((p: any) => p.ticker);
  const quotes = await getMultipleQuotes(tickers);

  return (
    <SimuladorClient 
      initialAccount={account} 
      initialPositions={positions} 
      initialHistory={history} 
      initialQuotes={quotes}
      initialRanking={ranking}
    />
  );
}
