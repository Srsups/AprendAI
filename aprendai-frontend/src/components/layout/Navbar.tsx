'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { isAuthenticated } from '@/lib/auth'

export default function Navbar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const authed = isAuthenticated()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="font-serif text-xl text-primary">AprendAI</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {authed ? (
            <>
              <Link href="/plans">
                <Button
                  variant={pathname.startsWith('/plans') ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LayoutDashboard size={14} />
                  Meus Planos
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut size={14} />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Criar conta
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}