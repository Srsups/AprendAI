'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Download, BookOpen, Zap, Brain, MessageCircle, Menu, X } from 'lucide-react'
import { plansApi, assessmentApi, authApi } from '@/lib/api'
import { usePlan } from '@/hooks/usePlan'
import LessonSideBar from '@/components/plans/LessonSideBar'
import LessonContent   from '@/components/plans/LessonContent'
import QuizView        from '@/components/plans/QuizView'
import FlashcardsView  from '@/components/plans/FlashcardsView'
import ExportModal     from '@/components/plans/ExportModal'
import StarRating      from '@/components/shared/StarRating'
import { Button }      from '@/components/ui/button'
import { Badge }       from '@/components/ui/badge'
import type { StudyPlanDetail, LessonContent as LessonContentType, User } from '@/lib/types'
import CommentsSection from '@/components/plans/CommentsSection'
import ErrorState from '@/components/shared/ErrorState'
import { notify } from '@/lib/toast'

type Tab = 'aula' | 'quiz' | 'flashcards' | 'discussao'

export default function PlanDetailPage() {
  const { id }         = useParams<{ id: string }>()
  const queryClient    = useQueryClient()
  const { fetchLesson, loadingLesson } = usePlan()

  const [activeLesson,  setActiveLesson]  = useState(1)
  const [lessonContent, setLessonContent] = useState<LessonContentType | null>(null)
  const [activeTab,     setActiveTab]     = useState<Tab>('aula')
  const [showExport,    setShowExport]    = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: plan, isLoading, isError, refetch } = useQuery({
    queryKey: ['plan', id],
    queryFn:  () => plansApi.get(id).then((r) => r.data as StudyPlanDetail),
  })

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn:  () => authApi.me().then((r) => r.data as User),
    staleTime: Infinity,
  })

  // ── Carrega primeira aula ──────────────────────────────────────────────────
  useEffect(() => {
    if (plan) loadLesson(plan.current_lesson > 0 ? plan.current_lesson : 1)
  }, [plan?.id])

  const loadLesson = async (number: number) => {
    setActiveLesson(number)
    setLessonContent(null)
    setActiveTab('aula')
    const content = await fetchLesson(id, number)
    setLessonContent(content)
  }

  // ── Avaliação ──────────────────────────────────────────────────────────────
  const rateMutation = useMutation({
    mutationFn: (rating: number) => assessmentApi.ratePlan(id, rating),
    onSuccess: () => {
      notify.ratingSaved()
      queryClient.invalidateQueries({ queryKey: ['plan', id] })
    },
  })

  // ── Texto completo da aula para quiz/flashcards ────────────────────────────
  const lessonText = lessonContent
    ? lessonContent.sections.map((s) => `${s.heading}\n${s.body}`).join('\n\n')
    : ''

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    )
  }

  if (isError || !plan) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <ErrorState
          title="Plano não encontrado"
          description="Este plano não existe ou você não tem acesso a ele."
          onRetry={refetch}
        />
      </div>
    )
  }

  const TABS = [
  { id: 'aula'      as Tab, label: 'Aula',      icon: BookOpen      },
  { id: 'quiz'      as Tab, label: 'Quiz',       icon: Zap           },
  { id: 'flashcards'as Tab, label: 'Flashcards', icon: Brain         },
  { id: 'discussao' as Tab, label: 'Discussão',  icon: MessageCircle },
]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">

      {/* Header */}
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

      {/* Barra de progresso */}
      <div className="mb-8">
        <div className="mb-1.5 flex justify-between font-mono text-xs text-muted-foreground">
          <span>Progresso</span>
          <span>{plan.current_lesson}/{plan.num_lessons} aulas</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${(plan.current_lesson / plan.num_lessons) * 100}%` }}
            transition={{ duration: 0.7 }}
          />
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid gap-6 md:grid-cols-[240px_1fr]">

        {/* Sidebar desktop */}
        <div className="hidden md:block">
          <LessonSideBar
            lessons={plan.lessons}
            activeLesson={activeLesson}
            onSelect={loadLesson}
          />
        </div>

        {/* Drawer mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 md:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-border bg-background p-4 md:hidden"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Aulas
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
                  >
                    <X size={16} />
                  </button>
                </div>
                <LessonSideBar
                  lessons={plan.lessons}
                  activeLesson={activeLesson}
                  onSelect={(n) => { loadLesson(n); setSidebarOpen(false) }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Área principal */}
        <div className="min-h-[500px] rounded-2xl border border-border bg-card">

          {/* Tabs + botão de menu mobile */}
          <div className="flex items-center justify-between border-b border-border px-3 py-3 md:px-4">
            <div className="flex items-center gap-1">
              {/* Botão menu mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="mr-2 flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground md:hidden"
              >
                <Menu size={13} />
                Aulas
              </button>

              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={
                    (tab.id === 'quiz' || tab.id === 'flashcards') && !lessonContent
                  }
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs font-medium transition-all md:px-3 ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
                >
                  <tab.icon size={12} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {lessonContent && (
              <Button
                variant="outline" size="sm"
                className="gap-1.5 border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-primary"
                onClick={() => setShowExport(true)}
              >
                <Download size={12} />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            )}
          </div>

          {/* Conteúdo da tab */}
          <div className="p-4 md:p-6">
            {activeTab === 'aula' && (
              <LessonContent
                lesson={lessonContent}
                loading={loadingLesson}
                lessonNumber={activeLesson}
              />
            )}
            {activeTab === 'quiz' && lessonContent && (
              <QuizView
                planId={id}
                lessonNumber={activeLesson}
                lessonText={lessonText}
                level={plan.level}
              />
            )}
            {activeTab === 'flashcards' && lessonContent && (
              <FlashcardsView lessonText={lessonText} />
            )}
            {activeTab === 'discussao' && (
              <CommentsSection
                planId={id}
                lessonNumber={activeLesson}
                userName={user?.name ?? 'Usuário'}
              />
            )}
          </div>

          {/* Navegação entre aulas */}
          {lessonContent && activeTab === 'aula' && (
            <div className="flex items-center justify-between border-t border-border px-4 py-4 md:px-6">
              <Button
                variant="ghost" size="sm"
                disabled={activeLesson <= 1}
                onClick={() => loadLesson(activeLesson - 1)}
              >
                ← <span className="hidden sm:inline ml-1">Anterior</span>
              </Button>
              <Button
                variant={activeLesson < plan.num_lessons ? 'default' : 'ghost'}
                size="sm"
                disabled={activeLesson >= plan.num_lessons}
                onClick={() => loadLesson(activeLesson + 1)}
                className={activeLesson < plan.num_lessons ? 'bg-primary text-primary-foreground' : ''}
              >
                <span className="hidden sm:inline mr-1">Próxima</span> →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de exportação */}
      {showExport && lessonContent && (
        <ExportModal
          planId={id}
          lessonNumber={activeLesson}
          lessonTitle={lessonContent.title}
          isTeacher={user?.is_teacher ?? false}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}