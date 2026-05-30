import SupportClient from "./support-client";
import { createClient } from '@/utils/supabase/server';
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic'

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect('/login');
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      <SupportClient />
    </div>
  );
}
