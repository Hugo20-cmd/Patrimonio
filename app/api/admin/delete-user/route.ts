import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: Request) {
  // Verify the caller is an admin
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const ADMIN_EMAILS = ['contatopennamc@gmail.com', 'suporte@patrimoniomais.com.br'];
  
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  // Delete profile first (clears FK constraints), then auth user
  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
