'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery }  from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Check, X, Zap, BookOpen,
  GraduationCap, Building2,
  Crown, ArrowRight,
} from 'lucide-react'
import { Button }        from '@/components/ui/button'
import { Badge }         from '@/components/ui/badge'
import CheckoutModal     from '@/components/upgrade/CheckoutModal'
import { usageApi, authApi } from '@/lib/api'
import type { UsageInfo, User, PlanId, PlanDefinition } from '@/lib/types'

// ─── Definição dos planos ─────────────────────────────────────────────────────

const PLANS: PlanDefinition[] = [
  {
    id         : 'free',
    name       : 'Gratuito',
    price      : 'R$ 0',
    period     : 'para sempre',
    description: 'Para experimentar e conhecer a plataforma.',
    highlight  : false,
    badge      : null,
    cta        : 'Plano atual',
    features   : [
      { label: '2 planos de estudo por mês',     included: '2 planos/mês' },
      { label: 'Até 8 aulas por plano',           included: 'Até 8 aulas por plano' },
      { label: 'Quiz básico (5 perguntas)',        included: 'Quiz de 5 perguntas' },
      { label: 'Exportação em PDF e Markdown',    included: 'Exportação PDF e Markdown' },
      { label: 'Flashcards',                      included: false },
      { label: 'Exportação PPTX',                 included: false },
      { label: 'Metodologias de ensino',          included: false },
    ],
  },
  {
    id         : 'pro',
    name       : 'Pro',
    price      : 'R$ 29',
    period     : '/mês',
    description: 'Para quem estuda com seriedade e quer o máximo.',
    highlight  : true,
    badge      : 'Mais popular',
    cta        : 'Assinar Pro',
    features   : [
      { label: 'Planos ilimitados',               included: 'Planos ilimitados' },
      { label: 'Até 16 aulas por plano',           included: 'Até 16 aulas por plano' },
      { label: 'Quiz completo (10 perguntas)',     included: 'Quiz de até 10 perguntas' },
      { label: 'Exportação em PDF e Markdown',    included: 'Exportação PDF e Markdown' },
      { label: 'Flashcards de memorização',       included: 'Flashcards ilimitados' },
      { label: 'Exportação PPTX',                 included: 'Exportação em PPTX' },
      { label: 'Metodologias de ensino',          included: false },
    ],
  },
  {
    id         : 'teacher',
    name       : 'Professor',
    price      : 'R$ 59',
    period     : '/mês',
    description: 'Para educadores criarem e gerenciarem suas turmas.',
    highlight  : false,
    badge      : null,
    cta        : 'Assinar Professor',
    features   : [
      { label: 'Tudo do plano Pro',               included: 'Tudo do plano Pro' },
      { label: 'Metodologias de ensino com IA',   included: 'Metodologias com IA' },
      { label: 'Exportação PPTX',                 included: 'Exportação em PPTX' },
      { label: 'Alinhamento à BNCC',              included: 'Alinhamento à BNCC' },
      { label: 'Painel de turmas',                included: 'Painel de turmas' },
      { label: 'Relatórios de progresso',         included: 'Relatórios de progresso' },
      { label: 'Suporte prioritário',             included: 'Suporte prioritário' },
    ],
  },
  {
    id         : 'institutional',
    name       : 'Institucional',
    price      : 'Sob consulta',
    period     : '',
    description: 'Para escolas e instituições com múltiplos usuários.',
    highlight  : false,
    badge      : 'Customizável',
    cta        : 'Falar com vendas',
    features   : [
      { label: 'Tudo do plano Professor',         included: 'Tudo do plano Professor' },
      { label: 'Usuários ilimitados',             included: 'Usuários ilimitados' },
      { label: 'Painel administrativo central',   included: 'Painel admin central' },
      { label: 'SSO (Single Sign-On)',            included: 'SSO integrado' },
      { label: 'Integração com LMS',              included: 'Integração com LMS' },
      { label: 'SLA garantido',                   included: 'SLA garantido 99.9%' },
      { label: 'Suporte dedicado 24/7',           included: 'Suporte dedicado 24/7' },
    ],
  },
]

const ICONS = {
  free        : BookOpen,
  pro         : Zap,
  teacher     : GraduationCap,
  institutional: Building2,
}

// ─── Tabela de comparação de features ────────────────────────────────────────

const COMPARISON_ROWS = [
  { feature: 'Planos por mês',          free: '2', pro: 'Ilimitado',  teacher: 'Ilimitado',  institutional: 'Ilimitado'  },
  { feature: 'Aulas por plano',         free: '8', pro: '16',         teacher: '16',          institutional: '16'         },
  { feature: 'Quiz',                    free: '5 perguntas', pro: '10 perguntas', teacher: '10 perguntas', institutional: '10 perguntas' },
  { feature: 'Flashcards',             free: false, pro: true,        teacher: true,          institutional: true         },
  { feature: 'Exportação PDF/Markdown', free: true,  pro: true,       teacher: true,          institutional: true         },
  { feature: 'Exportação PPTX',        free: false, pro: true,        teacher: true,          institutional: true         },
  { feature: 'Metodologias de ensino', free: false, pro: false,       teacher: true,          institutional: true         },
  { feature: 'Painel de turmas',       free: false, pro: false,       teacher: true,          institutional: true         },
  { feature: 'Usuários múltiplos',     free: false, pro: false,       teacher: false,         institutional: true         },
  { feature: 'SSO / LMS',             free: false, pro: false,       teacher: false,         institutional: true         },
  { feature: 'Suporte',               free: 'Comunidade', pro: 'Email', teacher: 'Prioritário', institutional: '24/7 dedicado' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true)  return <Check size={15} className="mx-auto text-primary" />
  if (value === false) return <X     size={15} className="mx-auto text-muted-foreground/30" />
  return <span className="text-xs text-muted-foreground">{value}</span>
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function UpgradePage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<PlanDefinition | null>(null)

  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn:  () => usageApi.get().then((r) => r.data as UsageInfo),
  })

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn:  () => authApi.me().then((r) => r.data as User),
    staleTime: Infinity,
  })

  const currentPlan = usage?.subscription_plan ?? 'free'

  const handleCta = (plan: PlanDefinition) => {
    if (plan.id === currentPlan) return
    if (plan.id === 'institutional') {
      // Institucional → contato (simulado)
      window.open('mailto:contato@aprendai.com', '_blank')
      return
    }
    setSelectedPlan(plan)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1">
          <Crown size={12} className="text-primary" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
            Planos e Preços
          </span>
        </div>
        <h1 className="font-serif text-4xl font-bold md:text-5xl">
          Escolha o plano certo
          <br />
          <span className="text-primary">para você</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Comece grátis, sem cartão de crédito. Faça upgrade quando precisar de mais.
        </p>

        {/* Plano atual */}
        {usage && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <span className="font-mono text-xs text-muted-foreground">Plano atual:</span>
            <span className="font-mono text-xs font-bold text-primary">
              {usage.plan_label}
            </span>
          </div>
        )}
      </motion.div>

      {/* Cards de planos */}
      <div className="mb-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan, i) => {
          const Icon      = ICONS[plan.id]
          const isCurrent = plan.id === currentPlan
          const isLower   = PLANS.findIndex(p => p.id === currentPlan) > i

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                plan.highlight
                  ? 'border-primary/40 bg-primary/5 shadow-[0_0_40px_rgba(200,240,96,0.07)]'
                  : isCurrent
                    ? 'border-primary/25 bg-primary/3'
                    : 'border-border bg-card/60 backdrop-blur-sm hover:border-border/80'
              }`}
            >
              {/* Badge */}
              {(plan.badge || isCurrent) && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold ${
                  isCurrent
                    ? 'bg-secondary text-muted-foreground border border-border'
                    : plan.highlight
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground border border-border'
                }`}>
                  {isCurrent ? 'Plano atual' : plan.badge}
                </div>
              )}

              {/* Icon + Nome */}
              <div className="mb-4">
                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${
                  plan.highlight
                    ? 'bg-primary/15 border border-primary/25'
                    : 'bg-secondary border border-border'
                }`}>
                  <Icon size={18} className={plan.highlight ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <h3 className="font-serif text-xl font-bold">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Preço */}
              <div className="mb-5 border-b border-border pb-5">
                <span className={`font-serif text-3xl font-bold ${
                  plan.highlight ? 'text-primary' : 'text-foreground'
                }`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
                )}
              </div>

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    {f.included
                      ? <Check size={13} className="mt-0.5 shrink-0 text-primary" />
                      : <X     size={13} className="mt-0.5 shrink-0 text-muted-foreground/30" />
                    }
                    <span className={`text-xs leading-snug ${
                      f.included ? 'text-foreground' : 'text-muted-foreground/50 line-through'
                    }`}>
                      {typeof f.included === 'string' ? f.included : f.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                onClick={() => handleCta(plan)}
                disabled={isCurrent || isLower}
                className={`w-full gap-1.5 font-semibold ${
                  plan.highlight && !isCurrent
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : isCurrent
                      ? 'bg-secondary text-muted-foreground cursor-default'
                      : isLower
                        ? 'bg-secondary/50 text-muted-foreground/50 cursor-not-allowed'
                        : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                }`}
              >
                {isCurrent ? 'Plano atual' : isLower ? 'Plano inferior' : (
                  <>{plan.cta} <ChevronRightIcon /></>
                )}
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Tabela de comparação */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-6 font-serif text-2xl font-bold text-center">
          Comparação detalhada
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left font-mono text-xs text-muted-foreground">
                  Recurso
                </th>
                {PLANS.map((plan) => (
                  <th key={plan.id} className={`p-4 text-center font-semibold text-sm ${
                    plan.id === currentPlan ? 'text-primary' : 'text-foreground'
                  }`}>
                    {plan.name}
                    {plan.id === currentPlan && (
                      <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                        atual
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-border/50 transition-colors hover:bg-secondary/20 ${
                    i % 2 === 0 ? '' : 'bg-secondary/10'
                  }`}
                >
                  <td className="p-4 text-sm text-muted-foreground">{row.feature}</td>
                  <td className="p-4 text-center"><FeatureValue value={row.free} /></td>
                  <td className="p-4 text-center"><FeatureValue value={row.pro} /></td>
                  <td className="p-4 text-center"><FeatureValue value={row.teacher} /></td>
                  <td className="p-4 text-center"><FeatureValue value={row.institutional} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 grid gap-4 md:grid-cols-2"
      >
        <h2 className="font-serif text-2xl font-bold md:col-span-2 text-center mb-2">
          Perguntas frequentes
        </h2>
        {[
          {
            q: 'Posso cancelar a qualquer momento?',
            a: 'Sim. Você pode cancelar sua assinatura a qualquer momento, sem multa ou fidelidade.',
          },
          {
            q: 'O que acontece com meus planos ao cancelar?',
            a: 'Todos os seus planos e aulas gerados ficam salvos. Você volta para os limites do plano gratuito.',
          },
          {
            q: 'Posso mudar de plano depois?',
            a: 'Sim. Você pode fazer upgrade ou downgrade a qualquer momento pelo painel.',
          },
          {
            q: 'O plano Professor inclui contas para alunos?',
            a: 'Inclui até 5 contas vinculadas. Para mais, o plano Institucional é o recomendado.',
          },
        ].map((item) => (
          <div
            key={item.q}
            className="rounded-xl border border-border bg-card/60 p-5"
          >
            <p className="mb-2 font-semibold text-sm text-foreground">{item.q}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </div>
        ))}
      </motion.div>

      {/* Modal de checkout */}
      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            setSelectedPlan(null)
            router.push('/dashboard')
          }}
        />
      )}
    </div>
  )
}

// Ícone auxiliar inline
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}