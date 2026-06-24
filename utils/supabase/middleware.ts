import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Atualizar a sessão se necessário (evitar token expirado)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Nota: A lógica de validação de sessão única (Single Session) que consultava
  // a tabela 'profiles' foi removida daqui, pois chamadas diretas ao banco de dados 
  // no middleware do Next.js frequentemente causam MIDDLEWARE_INVOCATION_TIMEOUT no Vercel.
  // Recomenda-se implementar essa verificação em Client Components (via useEffect) ou em Server Components.

  // Proteger as rotas dentro do dashboard
  // Se o usuário não estiver logado e estiver acessando rotas protegidas (ex: /dashboard, /portfolio)
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/portfolio'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Se o usuário estiver logado e acessar /login ou /register, redirecionar para /dashboard
  if (
    user &&
    (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
