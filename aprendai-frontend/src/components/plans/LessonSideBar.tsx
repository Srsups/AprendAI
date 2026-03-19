'use client'

import { CheckCircle2, Circle, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LessonSummaryDB } from '@/lib/types'

interface Props {
  lessons: LessonSummaryDB[]
  activeLesson: number
  onSelect: (n: number) => void
}

export default function LessonSidebar({ lessons, activeLesson, onSelect }: Props) {
  return (
    <aside className="flex h-full flex-col gap-1 overflow-y-auto pr-1">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Aulas
      </p>
      {lessons.map((lesson) => {
        const isActive = lesson.number === activeLesson

        return (
          <button
            key={lesson.id}
            onClick={() => onSelect(lesson.number)}
            className={cn(
              'group relative flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-all',
              isActive
                ? 'border-primary/30 bg-primary/5 text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
            )}
          >
            {/* Indicador lateral */}
            <span
              className={cn(
                'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition-all',
                isActive ? 'bg-primary' : 'bg-transparent group-hover:bg-border'
              )}
            />

            {/* Ícone de status */}
            <span className="mt-0.5 shrink-0">
              {lesson.quiz_passed ? (
                <CheckCircle2 size={15} className="text-primary" />
              ) : lesson.viewed ? (
                <BookOpen size={15} className="text-muted-foreground" />
              ) : (
                <Circle size={15} className="text-muted-foreground/40" />
              )}
            </span>

            {/* Texto */}
            <div className="min-w-0">
              <p className="font-mono text-[10px] text-muted-foreground">
                Aula {lesson.number}
              </p>
              <p className="truncate text-sm font-medium leading-snug">
                {lesson.title}
              </p>
            </div>
          </button>
        )
      })}
    </aside>
  )
}