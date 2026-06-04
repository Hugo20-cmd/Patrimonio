export const dynamic = 'force-dynamic';
import { getTransactions } from "@/app/actions/transactions";
import TransactionsClient from "./transactions-client";

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  
  return <TransactionsClient initialTransactions={transactions} />;
}
