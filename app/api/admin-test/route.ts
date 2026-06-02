import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json({
        error: "Missing Env Vars",
        hasUrl: !!url,
        hasServiceKey: !!key,
        hasAnonKey: !!anon
      });
    }

    const supabaseAdmin = createClient(url, key);

    const { data, count, error } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      error: error ? error.message : null,
      count,
      data,
      hasServiceKey: !!key
    });

  } catch (err: any) {
    return NextResponse.json({
      error: "Exception",
      message: err.message
    });
  }
}
