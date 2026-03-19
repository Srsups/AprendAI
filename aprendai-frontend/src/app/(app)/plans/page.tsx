'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { plansApi } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import type { StudyPlanListItem } from '@/lib/types'

export default function PlansPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansApi.list().then((r) => r.data as StudyPlanListItem[]),
  })

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Meus Planos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {plans?.length ?? 0} planos de estudo salvos
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : plans?.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Você ainda não tem planos salvos.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-primary hover:underline">
            Criar meu primeiro plano
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plans?.map((plan) => (
            <Link key={plan.id} href={`/plans/${plan.id}`}>
              <div className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{plan.num_lessons} aulas</Badge>
                      <Badge variant="outline" className="font-mono text-xs">{plan.level}</Badge>
                      {plan.completed && (
                        <Badge className="gap-1 bg-primary/10 text-primary border-primary/20 text-xs">
                          <CheckCircle2 size={10} /> Concluído
                        </Badge>
                      )}
                    </div>
                    <h2 className="font-serif text-lg font-semibold leading-tight text-foreground">
                      {plan.subject}
                    </h2>
                  </div>

                  {/* Progresso */}
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-xs text-muted-foreground">
                      {plan.current_lesson}/{plan.num_lessons}
                    </p>
                    <div className="mt-1.5 h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(plan.current_lesson / plan.num_lessons) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}