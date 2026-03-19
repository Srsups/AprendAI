'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { plansApi, lessonsApi } from '@/lib/api'
import type { PlanResponse, StudyPlanDetail, LessonContent, DifficultyLevel, ToneStyle } from '@/lib/types'

export function usePlan() {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [loadingLesson, setLoadingLesson] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fluxo completo: gera com IA e salva no banco
  const generateAndSave = async (
    prompt: string,
    numLessons: number,
    level: DifficultyLevel,
    tone: ToneStyle
  ): Promise<string | null> => {
    setGenerating(true)
    setError(null)
    try {
      // 1. IA gera o plano
      const genRes = await plansApi.generate({ prompt, num_lessons: numLessons, level, tone })
      const generated: PlanResponse = genRes.data

      // 2. Salva no banco
      const saveRes = await plansApi.save({
        subject: generated.subject,
        original_prompt: prompt,
        num_lessons: numLessons,
        level,
        tone,
        tags: generated.tags,
        lessons: generated.lessons.map((l) => ({
          number: l.number,
          title: l.title,
          description: l.description,
        })),
      })

      const planId: string = saveRes.data.id
      return planId
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao gerar plano.')
      return null
    } finally {
      setGenerating(false)
    }
  }

  // Busca o conteúdo de uma aula (com cache automático no backend)
  const fetchLesson = async (
    planId: string,
    lessonNumber: number
  ): Promise<LessonContent | null> => {
    setLoadingLesson(true)
    setError(null)
    try {
      const res = await lessonsApi.generate(planId, lessonNumber)
      return res.data as LessonContent
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao carregar aula.')
      return null
    } finally {
      setLoadingLesson(false)
    }
  }

  return { generateAndSave, fetchLesson, generating, loadingLesson, error }
}