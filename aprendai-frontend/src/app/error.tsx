'use client'

import { useEffect } from 'react'
import { motion }    from 'framer-motion'
import Link          from 'next/link'
import { Button }    from '@/components/ui/button'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Em produção, aqui você enviaria o erro para um serviço como Sentry
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        {/* Ícone */}
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/8">
          <AlertTriangle size={36} className="text-destructive" />
        </div>

        <h1 className="mb-3 font-serif text-3xl font-bold">
          Algo deu errado
        </h1>
        <p className="mb-2 text-muted-foreground leading-relaxed">
          Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
        </p>

        {/* Detalhe técnico (só em dev) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 mt-4 rounded-xl border border-border bg-secondary/30 p-4 text-left">
            <p className="mb-1 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Detalhe do erro (dev)
            </p>
            <p className="font-mono text-xs text-destructive break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            className="w-full gap-2 bg-primary font-semibold text-primary-foreground sm:w-auto"
          >
            <RefreshCw size={15} />
            Tentar novamente
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full gap-2 border-border sm:w-auto">
              <ArrowLeft size={15} />
              Voltar ao início
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}