'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { authApi, plansApi } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import StarRating from '@/components/shared/StarRating'
import {
  User, BookOpen, CheckCircle2, Clock,
  TrendingUp, Zap, BarChart3, ChevronRight,
  GraduationCap,
} from 'lucide-react'
import type { StudyPlanListItem, User as UserType } from '@/lib/types'

// ─── Card de estatística ──────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">{label}</span>
        <div className="rounded-lg border border-border bg-secondary p-1.5">
          <Icon size={14} className="text-primary" />
        </div>
      </div>
      <p className="font-serif text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-1 font-mono text-xs text-muted-foreground">{sub}</p>}
    </motion.div>
  )
}

// ─── Card de plano no perfil ──────────────────────────────────────────────────

function PlanCard({ plan, index }: { plan: StudyPlanListItem; index: number }) {
  const progress = Math.round((plan.current_lesson / plan.num_lessons) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/plans/${plan.id}`}>
        <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card">

          {/* Ícone de status */}
          <div className={`shrink-0 rounded-xl p-2.5 ${
            plan.completed
              ? 'bg-primary/10 border border-primary/25'
              : 'bg-secondary border border-border'
          }`}>
            {plan.completed
              ? <CheckCircle2 size={18} className="text-primary" />
              : <BookOpen size={18} className="text-muted-foreground" />
            }
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                {plan.subject}
              </h3>
              {plan.completed && (
                <Badge className="shrink-0 border-primary/20 bg-primary/10 text-primary text-[10px]">
                  Concluído
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">
                {plan.num_lessons} aulas · {plan.level}
              </span>
              {plan.avg_rating && (
                <span className="flex items-center gap-1 font-mono text-xs text-yellow-400">
                  ★ {plan.avg_rating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Barra de progresso */}
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {plan.current_lesson}/{plan.num_lessons}
              </span>
            </div>
          </div>

          <ChevronRight size={16} className="shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-primary" />
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Avatar com inicial ────────────────────────────────────────────────────────

function Avatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
  const initial = name?.charAt(0).toUpperCase() ?? '?'
  return (
    <div className={`flex items-center justify-center rounded-full bg-primary/15 border-2 border-primary/30 font-serif font-bold text-primary ${
      size === 'lg' ? 'h-20 w-20 text-3xl' : 'h-9 w-9 text-sm'
    }`}>
      {initial}
    </div>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function PerfilPage() {
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['me'],
    queryFn:  () => authApi.me().then((r) => r.data as UserType),
  })

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn:  () => plansApi.list().then((r) => r.data as StudyPlanListItem[]),
  })

  // ── Estatísticas derivadas ──────────────────────────────────────────────────
  const total      = plans?.length ?? 0
  const completed  = plans?.filter((p) => p.completed).length ?? 0
  const inProgress = plans?.filter((p) => !p.completed && p.current_lesson > 0).length ?? 0
  const totalAulas = plans?.reduce((acc, p) => acc + p.current_lesson, 0) ?? 0

  const recentPlans     = plans?.slice(0, 3) ?? []
  const inProgressPlans = plans?.filter((p) => !p.completed && p.current_lesson > 0) ?? []
  const completedPlans  = plans?.filter((p) => p.completed) ?? []

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">

      {/* Header do perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-wrap items-center gap-6"
      >
        {loadingUser ? (
          <Skeleton className="h-20 w-20 rounded-full" />
        ) : (
          <Avatar name={user?.name ?? ''} />
        )}

        <div className="min-w-0">
          {loadingUser ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-3xl font-bold">{user?.name}</h1>
                {user?.is_teacher && (
                  <Badge className="border-primary/20 bg-primary/10 text-primary gap-1">
                    <GraduationCap size={11} />
                    Professor
                  </Badge>
                )}
              </div>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {user?.email}
              </p>
            </>
          )}
        </div>
      </motion.div>

      {/* Estatísticas */}
      <div className="mb-10 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen}    label="Planos criados"    value={total}      delay={0.05} />
        <StatCard icon={CheckCircle2} label="Concluídos"       value={completed}  sub={total ? `${Math.round((completed/total)*100)}% do total` : undefined} delay={0.1} />
        <StatCard icon={Clock}       label="Em andamento"      value={inProgress} delay={0.15} />
        <StatCard icon={Zap}         label="Aulas assistidas"  value={totalAulas} sub="no total" delay={0.2} />
      </div>

      {/* Gráfico de progresso visual simples */}
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-10 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={15} className="text-primary" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Visão geral do progresso
            </span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="bg-primary transition-all duration-1000"
              style={{ width: `${total ? (completed / total) * 100 : 0}%` }}
              title={`${completed} concluídos`}
            />
            <div
              className="bg-primary/30 transition-all duration-1000"
              style={{ width: `${total ? (inProgress / total) * 100 : 0}%` }}
              title={`${inProgress} em andamento`}
            />
          </div>
          <div className="mt-3 flex gap-4">
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" /> Concluídos ({completed})
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary/30" /> Em andamento ({inProgress})
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-secondary border border-border" /> Não iniciados ({total - completed - inProgress})
            </span>
          </div>
        </motion.div>
      )}

      {/* Em andamento */}
      {inProgressPlans.length > 0 && (
        <section className="mb-10">
          <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <Clock size={11} /> Continuar de onde parei
            <span className="h-px flex-1 bg-border" />
          </p>
          <div className="space-y-3">
            {inProgressPlans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Recentes */}
      <section className="mb-10">
        <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <TrendingUp size={11} /> Criados recentemente
          <span className="h-px flex-1 bg-border" />
          <Link href="/plans" className="text-primary hover:underline normal-case tracking-normal">
            Ver todos →
          </Link>
        </p>

        {loadingPlans ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : recentPlans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <BookOpen size={28} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Você ainda não criou nenhum plano.
            </p>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="mt-4">
                Criar meu primeiro plano
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPlans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Concluídos */}
      {completedPlans.length > 0 && (
        <section>
          <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <CheckCircle2 size={11} /> Concluídos
            <span className="h-px flex-1 bg-border" />
          </p>
          <div className="space-y-3">
            {completedPlans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}