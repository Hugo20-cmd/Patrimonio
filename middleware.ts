import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/portfolio')
  const isAuthRoute = path === '/login' || path === '/register'

  // Só invoca o Supabase em rotas que realmente precisam de proteção ou redirecionamento
  if (isProtectedRoute || isAuthRoute) {
    return await updateSession(request)
  }

  // Para o resto do site (como a Home), passa direto sem rodar código pesado
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
