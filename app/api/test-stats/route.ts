import { NextResponse } from 'next/server';
import { getAdminStats } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getAdminStats();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
