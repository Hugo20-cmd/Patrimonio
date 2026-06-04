import { getSimulatorAccount, getSimulatorPositions, getSimulatorHistory } from "@/app/actions/simulator";
import SimuladorClient from "./simulador-client";

export const dynamic = 'force-dynamic';

export default async function SimuladorPage() {
  const account = await getSimulatorAccount();
  const positions = await getSimulatorPositions();
  const history = await getSimulatorHistory();

  return (
    <SimuladorClient 
      initialAccount={account} 
      initialPositions={positions} 
      initialHistory={history} 
    />
  );
}
