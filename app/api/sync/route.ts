import { syncRetroactiveXp } from '@/app/actions/gamification'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const result = await syncRetroactiveXp()
  return NextResponse.json({ result })
}
