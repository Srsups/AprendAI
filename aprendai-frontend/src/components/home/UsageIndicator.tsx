'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usageApi } from '@/lib/api'
import { Zap, Infinity, AlertTriangle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UsageInfo } from '@/lib/types'

interface Props {
  onLimitReached?: (limited: boolean) => void
}

export default function UsageIndicator({ onLimitReached }: Props) {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage'],
    queryFn:  () => usageApi.get().then((r) => r.data as UsageInfo),
    // Revalida ao voltar para a aba — importante após gerar um plano
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (usage) {
      onLimitReached?.(!usage.is_within_limit)
    }
  }, [usage, onLimitReached])

  if (isLoading || !usage) return null

  const isUnlimited = usage.plans_limit === null
  const isFree      = usage.subscription_plan === 'free'
  const pct         = isUnlimited ? 0
    : Math.min(100, Math.round((usage.plans_this_month / (usage.plans_limit ?? 1)) * 100))
  const limitReached = !usage.is_within_limit

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`rounded-2xl border p-4 ${
          limitReached
            ? 'border-destructive/30 bg-destructive/5'
            : isFree
              ? 'border-border bg-card/60'
              : 'border-primary/20 bg-primary/5'
        }`}
      >
        <div className="flex items-start justify-between gap-4">

          {/* Info do plano */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              {isUnlimited ? (
                <Infinity size={14} className="text-primary" />
              ) : limitReached ? (
                <AlertTriangle size={14} className="text-destructive" />
              ) : (
                <Zap size={14} className="text-primary" />
              )}

              <span className={`font-mono text-xs font-semibold ${
                limitReached ? 'text-destructive' : 'text-primary'
              }`}>
                Plano {usage.plan_label}
              </span>

              <span className="font-mono text-xs text-muted-foreground">
                · {usage.plan_description}
              </span>
            </div>

            {/* Barra de uso (só para plano free) */}
            {isFree && (
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-xs text-muted-foreground">
                  <span>
                    {limitReached
                      ? '⚠ Limite atingido este mês'
                      : `${usage.plans_this_month} de ${usage.plans_limit} planos usados`
                    }
                  </span>
                  {!limitReached && usage.remaining !== null && (
                    <span className={pct >= 100 ? 'text-destructive' : pct >= 50 ? 'text-yellow-400' : 'text-muted-foreground'}>
                      {usage.remaining} restante{usage.remaining !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className={`h-full rounded-full transition-colors ${
                      pct >= 100 ? 'bg-destructive'
                      : pct >= 50  ? 'bg-yellow-400'
                      : 'bg-primary'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Mensagem de limite atingido */}
            {limitReached && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-xs text-destructive leading-relaxed"
              >
                Você atingiu o limite de {usage.plans_limit} planos este mês.
                Faça upgrade para continuar gerando planos sem restrições.
              </motion.p>
            )}
          </div>

          {/* Botão de upgrade (só para free) */}
          {isFree && (
            <Link href="/#planos" className="shrink-0">
              <Button
                size="sm"
                variant={limitReached ? 'default' : 'outline'}
                className={`gap-1 text-xs ${
                  limitReached
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-border text-muted-foreground hover:text-primary hover:border-primary/40'
                }`}
              >
                Upgrade
                <ChevronRight size={12} />
              </Button>
            </Link>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}