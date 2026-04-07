'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, Compass, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { isAuthenticated } from '@/lib/auth'


export default function Navbar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const authed = mounted && isAuthenticated()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="font-serif text-xl text-primary">AprendAI</span>
        </Link>

        <div className="flex items-center gap-1">
          {authed ? (
            <>
              <Link href="/explorar">
                <Button
                  variant={pathname.startsWith('/explorar') ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Compass size={14} />
                  Explorar
                </Button>
              </Link>
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
              <Link href="/perfil">
                <Button
                  variant={pathname.startsWith('/perfil') ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <UserCircle size={14} />
                  Meu Perfil
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
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
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