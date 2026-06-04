export const dynamic = 'force-dynamic';
import { getGoals } from "@/app/actions/goals";
import GoalsClient from "./goals-client";

export default async function GoalsPage() {
  const goals = await getGoals();
  return <GoalsClient initialGoals={goals} />;
}
