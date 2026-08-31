'use client'

import { Clock, Lightbulb, HelpCircle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { LessonContent } from '@/lib/types'

interface Props {
  lesson: LessonContent | null
  loading: boolean
  lessonNumber: number
}

export default function LessonContent({ lesson, loading, lessonNumber }: Props) {
  if (loading) {
    return (
      <div className="space-y-8 p-6 md:p-8">
        {/* Header skeleton */}
        <div className="space-y-3 border-b border-border pb-6">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>

        {/* Seções skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}

        {/* Conceitos-chave skeleton */}
        <div className="rounded-xl border border-border p-5 space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-wrap gap-2">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-6 w-20 rounded-full" />)}
          </div>
        </div>

        {/* Indicador de geração */}
        <div className="flex items-center justify-center gap-2 py-2">
          <Loader2 size={14} className="animate-spin text-primary" />
          <span className="font-mono text-xs text-muted-foreground">
            Gerando conteúdo com IA…
          </span>
        </div>
      </div>
    )
  }

  if (!lesson) return null

  return (
    <article className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-xs font-bold text-primary-foreground">
            Aula {lessonNumber}
          </span>
          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <Clock size={11} />
            {lesson.estimated_reading_minutes} min de leitura
          </span>
        </div>
        <h1 className="font-serif text-2xl font-bold leading-tight text-foreground md:text-3xl">
          {lesson.title}
        </h1>
      </div>

      {/* Seções */}
      <div className="space-y-8">
        {lesson.sections.map((section, i) => (
          <section key={i}>
            <h2 className="mb-3 font-serif text-lg font-bold text-foreground">
              {section.heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      {/* Conceitos-chave */}
      {lesson.key_concepts.length > 0 && (
        <div className="mt-10 rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <Lightbulb size={15} />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider">
              Conceitos-chave
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lesson.key_concepts.map((concept) => (
              <Badge key={concept} variant="secondary" className="font-mono text-xs">
                {concept}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Pergunta de reflexão */}
      {lesson.reflection_question && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="mb-2 flex items-center gap-2 text-primary">
            <HelpCircle size={15} />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider">
              Reflexão
            </span>
          </div>
          <p className="font-serif italic text-foreground">
            {lesson.reflection_question}
          </p>
        </div>
      )}
    </article>
  )
}