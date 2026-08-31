'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { isAuthenticated } from '@/lib/auth'

function GradientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute rounded-full opacity-[0.06] blur-[120px]"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, #c8f060 0%, transparent 70%)',
          top: '-10%', left: '30%',
          animation: 'orb1 18s ease-in-out infinite alternate',
        }}
      />
    </div>
  )
}

export default function NotFound() {
  const authed = isAuthenticated()

  return (
    <>
      <style>{`
        @keyframes orb1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(60px, 40px) scale(1.1); }
          100% { transform: translate(-30px, 80px) scale(0.92); }
        }
      `}</style>

      <GradientOrbs />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md"
        >
          {/* Número 404 grande */}
          <div className="relative mb-8 select-none">
            <p
              className="font-serif text-[8rem] font-bold leading-none text-primary/10 md:text-[10rem]"
              style={{ textShadow: '0 0 80px rgba(200,240,96,0.15)' }}
            >
              404
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
                <BookOpen size={32} className="text-primary" />
              </div>
            </div>
          </div>

          {/* Texto */}
          <h1 className="mb-3 font-serif text-3xl font-bold">
            Página não encontrada
          </h1>
          <p className="mb-8 text-muted-foreground leading-relaxed">
            A página que você está procurando não existe ou foi movida.
            Verifique o endereço ou volte para o início.
          </p>

          {/* Ações */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={authed ? '/dashboard' : '/'}>
              <Button className="w-full gap-2 bg-primary font-semibold text-primary-foreground sm:w-auto">
                <ArrowLeft size={15} />
                {authed ? 'Ir para o Dashboard' : 'Ir para o início'}
              </Button>
            </Link>
            {authed && (
              <Link href="/explorar">
                <Button variant="outline" className="w-full gap-2 border-border sm:w-auto">
                  <BookOpen size={15} />
                  Explorar conteúdos
                </Button>
              </Link>
            )}
          </div>

          {/* Sugestão */}
          <p className="mt-8 font-mono text-xs text-muted-foreground">
            Código de erro: 404 · Página não encontrada
          </p>
        </motion.div>
      </div>
    </>
  )
}