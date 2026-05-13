'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { plansApi, assessmentApi } from '@/lib/api'
import { usePlan } from '@/hooks/usePlan'
import LessonSidebar from '@/components/plans/LessonSideBar'
import LessonContent from '@/components/plans/LessonContent'
import StarRating from '@/components/shared/StarRating'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ExportModal from '@/components/plans/ExportModal'
import { Download } from 'lucide-react'
import type { StudyPlanDetail, LessonContent as LessonContentType } from '@/lib/types'

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { fetchLesson, loadingLesson } = usePlan()

  const [activeLesson, setActiveLesson] = useState(1)
  const [lessonContent, setLessonContent] = useState<LessonContentType | null>(null)
  const [showExport, setShowExport] = useState(false)

  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan', id],
    queryFn: () => plansApi.get(id).then((r) => r.data as StudyPlanDetail),
  })

  useEffect(() => {
    if (plan) loadLesson(plan.current_lesson > 0 ? plan.current_lesson : 1)
  }, [plan?.id])

  const loadLesson = async (number: number) => {
    setActiveLesson(number)
    setLessonContent(null)
    const content = await fetchLesson(id, number)
    setLessonContent(content)
  }

  const rateMutation = useMutation({
    mutationFn: (rating: number) => assessmentApi.ratePlan(id, rating),
    onSuccess: () => {
      toast.success('Avaliação salva!', { description: 'Obrigado pelo feedback.' })
      queryClient.invalidateQueries({ queryKey: ['plan', id] })
    },
  })

  if (isLoading || !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      {/* Header do plano */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {plan.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="font-mono text-xs">{tag}</Badge>
            ))}
          </div>
          <h1 className="font-serif text-2xl font-bold md:text-3xl">{plan.subject}</h1>
        </div>

        <div className="flex items-center gap-3">
          {plan.avg_rating && (
            <span className="font-mono text-sm text-muted-foreground">
              {plan.avg_rating} ★
            </span>
          )}
          <StarRating
            value={plan.avg_rating ?? 0}
            onChange={(r) => rateMutation.mutate(r)}
          />
        </div>
      </div>

      {/* Progresso */}
      <div className="mb-8">
        <div className="mb-1.5 flex justify-between font-mono text-xs text-muted-foreground">
          <span>Progresso</span>
          <span>{plan.current_lesson}/{plan.num_lessons} aulas</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(plan.current_lesson / plan.num_lessons) * 100}%` }}
          />
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <div className="hidden md:block">
          <LessonSidebar
            lessons={plan.lessons}
            activeLesson={activeLesson}
            onSelect={loadLesson}
          />
        </div>

        <div className="min-h-125 rounded-2xl border border-border bg-card">
          <LessonContent
            lesson={lessonContent}
            loading={loadingLesson}
            lessonNumber={activeLesson}
          />

          {lessonContent && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <Button
                variant="ghost" size="sm"
                disabled={activeLesson <= 1}
                onClick={() => loadLesson(activeLesson - 1)}
              >
                ← Anterior
              </Button>

              <Button
                variant="outline" size="sm"
                className="gap-2 border-border text-muted-foreground hover:text-primary hover:border-primary/40"
                onClick={() => setShowExport(true)}
              >
                <Download size={13} />
                Exportar aula
              </Button>

              <Button
                variant={activeLesson < plan.num_lessons ? 'default' : 'ghost'}
                size="sm"
                disabled={activeLesson >= plan.num_lessons}
                onClick={() => loadLesson(activeLesson + 1)}
              >
                Próxima →
              </Button>
            </div>
          )}
        </div>
      </div>
      {showExport && lessonContent && (
        <ExportModal
          planId={id}
          lessonNumber={activeLesson}
          lessonTitle={lessonContent.title}
          isTeacher={false}  // substituir por: user?.is_teacher ?? false (após adicionar query do /me)
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}