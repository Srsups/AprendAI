'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard, LogOut, Compass,
  UserCircle, Crown, Menu, X,
} from 'lucide-react'
import { Button }  from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { isAuthenticated } from '@/lib/auth'
import { usageApi } from '@/lib/api'
import type { UsageInfo } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const authed = isAuthenticated()
  const [mobileOpen, setMobileOpen] = useState(false)

  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn:  () => usageApi.get().then((r) => r.data as UsageInfo),
    enabled:  authed,
    staleTime: 1000 * 60 * 5,
  })

  const navLinks = authed ? [
    { href: '/explorar',  label: 'Explorar',    icon: Compass },
    { href: '/plans',     label: 'Meus Planos', icon: LayoutDashboard },
    { href: '/perfil',    label: 'Meu Perfil',  icon: UserCircle },
    { href: '/upgrade',   label: usage?.subscription_plan === 'free' ? 'Upgrade' : 'Planos', icon: Crown },
  ] : []

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">

          {/* Logo */}
          <Link href={authed ? '/dashboard' : '/'} className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="font-serif text-xl text-primary">AprendAI</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {authed ? (
              <>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={pathname.startsWith(link.href) ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`gap-2 transition-colors ${
                        link.href === '/upgrade' && usage?.subscription_plan === 'free'
                          ? 'text-primary hover:text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <link.icon size={14} />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost" size="sm"
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

          {/* Mobile: botão hambúrguer */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-[65px] z-40 overflow-hidden border-b border-border bg-background/95 backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {authed ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        pathname.startsWith(link.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}>
                        <link.icon size={16} />
                        <span className="font-medium">{link.label}</span>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={() => { logout(); setMobileOpen(false) }}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <LogOut size={16} />
                    <span className="font-medium">Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-muted-foreground hover:bg-secondary">
                      Entrar
                    </div>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center gap-3 rounded-xl bg-primary px-3 py-3 font-semibold text-primary-foreground">
                      Criar conta
                    </div>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}