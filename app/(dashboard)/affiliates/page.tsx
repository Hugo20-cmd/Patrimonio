import { getAffiliateData } from "@/app/actions/affiliates";
import AffiliatesClient from "./affiliates-client";
import { redirect } from "next/navigation";

export default async function AffiliatesPage() {
  const result = await getAffiliateData();
  
  if (result.error === "Not authenticated") {
    redirect("/login");
  }

  return <AffiliatesClient initialData={result.data} error={result.error} />;
}
