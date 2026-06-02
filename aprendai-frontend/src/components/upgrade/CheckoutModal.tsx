'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X, CreditCard, Lock, CheckCircle2,
  Loader2, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { toast }  from 'sonner'
import { usageApi } from '@/lib/api'
import type { PlanId, PlanDefinition } from '@/lib/types'

interface Props {
  plan   : PlanDefinition
  onClose: () => void
  onSuccess: () => void
}

type Phase = 'form' | 'processing' | 'success'

export default function CheckoutModal({ plan, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient()
  const [phase, setPhase] = useState<Phase>('form')

  // Campos do cartão (apenas visuais)
  const [cardNumber, setCardNumber] = useState('')
  const [cardName,   setCardName]   = useState('')
  const [expiry,     setExpiry]     = useState('')
  const [cvv,        setCvv]        = useState('')

  const upgradeMutation = useMutation({
    mutationFn: () => usageApi.upgrade(plan.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPhase('processing')

    // Simula processamento de pagamento (2.5s)
    await new Promise((r) => setTimeout(r, 2500))

    try {
      await upgradeMutation.mutateAsync()
      setPhase('success')
      setTimeout(() => {
        onSuccess()
        toast.success(`Plano ${plan.name} ativado!`, {
          description: 'Aproveite todos os recursos desbloqueados.',
        })
      }, 2000)
    } catch {
      toast.error('Erro ao processar pagamento. Tente novamente.')
      setPhase('form')
    }
  }

  // Formatação automática do número do cartão
  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  // Formatação automática da data
  const formatExpiry = (v: string) =>
    v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={phase === 'form' ? onClose : undefined}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
      >
        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">

          {/* Faixa colorida no topo */}
          <div className="h-1 w-full bg-primary" />

          {/* ── Fase: Formulário ─────────────────────────────────────────── */}
          {phase === 'form' && (
            <div className="p-6">
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    Assinar plano
                  </p>
                  <h2 className="font-serif text-2xl font-bold mt-1">
                    {plan.name}
                  </h2>
                  <p className="text-primary font-bold mt-0.5">
                    {plan.price}
                    {plan.period && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {plan.period}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Resumo do plano */}
              <div className="mb-6 rounded-xl border border-border bg-secondary/30 p-4">
                <p className="font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  Você está desbloqueando
                </p>
                <ul className="space-y-1.5">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f.label} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={13} className="text-primary shrink-0" />
                      <span className="text-muted-foreground">
                        {typeof f.included === 'string' ? f.included : f.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formulário de pagamento */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1.5 block font-mono text-xs text-muted-foreground">
                    Número do cartão
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCard(e.target.value))}
                      className="pr-10"
                      required
                    />
                    <CreditCard
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-xs text-muted-foreground">
                    Nome no cartão
                  </label>
                  <Input
                    placeholder="Como aparece no cartão"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block font-mono text-xs text-muted-foreground">
                      Validade
                    </label>
                    <Input
                      placeholder="MM/AA"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-xs text-muted-foreground">
                      CVV
                    </label>
                    <Input
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-2 w-full gap-2 bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                >
                  <Lock size={14} />
                  Confirmar assinatura
                </Button>
              </form>

              {/* Selos de segurança */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                  <ShieldCheck size={11} className="text-primary" />
                  Pagamento seguro
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                  <Lock size={11} className="text-primary" />
                  Dados criptografados
                </div>
              </div>

              <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">
                Ambiente de demonstração · Nenhum valor será cobrado
              </p>
            </div>
          )}

          {/* ── Fase: Processando ─────────────────────────────────────────── */}
          {phase === 'processing' && (
            <div className="flex flex-col items-center gap-6 px-6 py-14 text-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-2 border-primary/20" />
                <Loader2
                  size={32}
                  className="absolute inset-0 m-auto animate-spin text-primary"
                />
              </div>
              <div>
                <p className="font-serif text-lg font-bold">
                  Processando pagamento…
                </p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">
                  Aguarde um momento
                </p>
              </div>
              <div className="w-full space-y-2">
                {['Verificando dados', 'Autorizando pagamento', 'Ativando plano'].map(
                  (step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.7 }}
                      className="flex items-center gap-2 rounded-lg bg-secondary/30 px-4 py-2"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.7 + 0.3 }}
                      >
                        <CheckCircle2 size={13} className="text-primary" />
                      </motion.div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {step}
                      </span>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          )}

          {/* ── Fase: Sucesso ─────────────────────────────────────────────── */}
          {phase === 'success' && (
            <div className="flex flex-col items-center gap-6 px-6 py-14 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary bg-primary/10"
              >
                <CheckCircle2 size={40} className="text-primary" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="font-serif text-2xl font-bold">
                  Plano ativado! 🎉
                </p>
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  Bem-vindo ao {plan.name}. Todos os recursos
                  <br />já estão disponíveis na sua conta.
                </p>
              </motion.div>

              {/* Confetti visual simples */}
              <div className="flex gap-1">
                {['bg-primary', 'bg-yellow-400', 'bg-blue-400', 'bg-pink-400', 'bg-green-400'].map(
                  (color, i) => (
                    <motion.div
                      key={i}
                      className={`h-2 w-2 rounded-full ${color}`}
                      animate={{ y: [0, -12, 0], opacity: [1, 0.5, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: i * 0.15,
                      }}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}