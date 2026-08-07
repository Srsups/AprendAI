import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que exigem autenticação
const PROTECTED = ['/dashboard', '/plans', '/perfil', '/explorar']

// Rotas que NÃO devem ser acessadas logado (ex: voltar ao login)
const AUTH_ONLY = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('aprendai_token')?.value

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthOnly  = AUTH_ONLY.some((p) => pathname.startsWith(p))

  // Não logado tentando acessar rota protegida → login
  if (isProtected && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Logado tentando acessar login/register → dashboard
  if (isAuthOnly && token) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|google-callback|google_callback).*)',
  ],
}