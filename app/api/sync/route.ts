import { syncRetroactiveXp } from '@/app/actions/gamification'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const result = await syncRetroactiveXp()
  
  const url = new URL(request.url)
  const origin = url.origin
  
  return NextResponse.redirect(new URL('/community', origin))
}
