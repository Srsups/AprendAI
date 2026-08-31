'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, RotateCcw, Trophy, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { assessmentApi } from '@/lib/api'
import { toast } from 'sonner'
import type { QuizResponse, QuizQuestion } from '@/lib/types'
import EmptyState from '../shared/EmptyState'

interface Props {
  planId: string
  lessonNumber: number
  lessonText: string   // conteúdo completo das seções para enviar à IA
  level: string
}

type Phase = 'idle' | 'loading' | 'answering' | 'result'

const LETTERS = ['A', 'B', 'C', 'D'] as const

export default function QuizView({ planId, lessonNumber, lessonText, level }: Props) {
  const [phase,       setPhase]       = useState<Phase>('idle')
  const [quiz,        setQuiz]        = useState<QuizResponse | null>(null)
  const [current,     setCurrent]     = useState(0)
  const [chosen,      setChosen]      = useState<string | null>(null)
  const [revealed,    setRevealed]    = useState(false)
  const [score,       setScore]       = useState(0)
  const [answers, setAnswers] = useState<
    { question: string; chosen_letter: string; correct_letter: string; is_correct: boolean }[]
  >([])

  const startQuiz = async () => {
    setPhase('loading')
    try {
      const res = await assessmentApi.generateQuiz(lessonText, 5)
      setQuiz(res.data)
      setCurrent(0)
      setScore(0)
      setAnswers([])
      setChosen(null)
      setRevealed(false)
      setPhase('answering')
    } catch {
      toast.error('Erro ao gerar quiz. Tente novamente.')
      setPhase('idle')
    }
  }

  const handleAnswer = (letter: string) => {
    if (revealed) return
    setChosen(letter)
    setRevealed(true)

    const q = quiz!.questions[current]
    const correct = letter === q.correct_letter

    if (correct) setScore((s) => s + 1)
    setAnswers((prev) => [...prev, {
      question:       q.question,
      chosen_letter:  letter,
      correct_letter: q.correct_letter,
      is_correct:     correct,
    }])
  }

  const handleNext = async () => {
    if (!quiz) return
    if (current + 1 < quiz.total_questions) {
      setCurrent((c) => c + 1)
      setChosen(null)
      setRevealed(false)
    } else {
      // Salva a tentativa no backend
      try {
        await assessmentApi.saveAttempt(planId, lessonNumber, {
          score,
          total: quiz.total_questions,
          answers,
        })
      } catch { /* silencioso — não bloqueia o resultado */ }
      setPhase('result')
    }
  }

  const reset = () => {
    setPhase('idle')
    setQuiz(null)
    setCurrent(0)
    setScore(0)
    setAnswers([])
    setChosen(null)
    setRevealed(false)
  }

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <EmptyState
        icon={Zap}
        title="Testar o que aprendeu?"
        description="5 perguntas geradas exclusivamente a partir do conteúdo desta aula."
        cta={{ label: 'Iniciar Quiz', onClick: startQuiz }}
        compact
      />
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center gap-3 py-14">
        <Loader2 size={28} className="animate-spin text-primary" />
        <p className="font-mono text-sm text-muted-foreground">
          Gerando perguntas com IA…
        </p>
      </div>
    )
  }

  // ── Resultado ─────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const pct     = Math.round((score / (quiz?.total_questions ?? 1)) * 100)
    const passed  = pct >= 60
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 py-8 text-center"
      >
        <div className={`rounded-full p-4 ${passed ? 'bg-primary/15' : 'bg-destructive/10'}`}>
          <Trophy size={32} className={passed ? 'text-primary' : 'text-destructive'} />
        </div>

        <div>
          <p className="font-serif text-4xl font-bold">
            {score}/{quiz?.total_questions}
          </p>
          <p className={`mt-1 font-mono text-sm ${passed ? 'text-primary' : 'text-destructive'}`}>
            {pct}% — {passed ? 'Aprovado! 🎉' : 'Continue estudando 📚'}
          </p>
        </div>

        {/* Gabarito resumido */}
        <div className="w-full space-y-2 text-left">
          {answers.map((a, i) => (
            <div key={i} className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
              a.is_correct ? 'border-primary/20 bg-primary/5' : 'border-destructive/20 bg-destructive/5'
            }`}>
              {a.is_correct
                ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-primary" />
                : <XCircle     size={15} className="mt-0.5 shrink-0 text-destructive" />
              }
              <p className="text-muted-foreground leading-snug">{a.question}</p>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw size={14} /> Tentar novamente
        </Button>
      </motion.div>
    )
  }

  // ── Respondendo ───────────────────────────────────────────────────────────
  const q = quiz!.questions[current]

  return (
    <div className="space-y-6">
      {/* Progresso */}
      <div className="space-y-1.5">
        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>Pergunta {current + 1} de {quiz!.total_questions}</span>
          <span>{score} acertos</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((current) / quiz!.total_questions) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <p className="font-serif text-lg font-semibold leading-snug">
            {q.question}
          </p>

          {/* Opções */}
          <div className="space-y-2">
            {q.options.map((opt) => {
              const isChosen  = chosen === opt.letter
              const isCorrect = opt.letter === q.correct_letter
              const show      = revealed

              let style = 'border-border bg-secondary/30 hover:border-border/80'
              if (show && isCorrect)        style = 'border-primary/50 bg-primary/8'
              else if (show && isChosen)    style = 'border-destructive/50 bg-destructive/8'

              return (
                <button
                  key={opt.letter}
                  onClick={() => handleAnswer(opt.letter)}
                  disabled={revealed}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${style} disabled:cursor-default`}
                >
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-xs font-bold ${
                    show && isCorrect ? 'bg-primary text-primary-foreground'
                    : show && isChosen ? 'bg-destructive text-white'
                    : 'bg-secondary text-muted-foreground'
                  }`}>
                    {opt.letter}
                  </span>
                  <span className="text-sm leading-snug">{opt.text}</span>
                  {show && isCorrect && <CheckCircle2 size={15} className="ml-auto mt-0.5 shrink-0 text-primary" />}
                  {show && isChosen && !isCorrect && <XCircle size={15} className="ml-auto mt-0.5 shrink-0 text-destructive" />}
                </button>
              )
            })}
          </div>

          {/* Explicação */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-xl border border-primary/20 bg-primary/5 p-4"
              >
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  Explicação
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {q.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Avançar */}
      {revealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end"
        >
          <Button onClick={handleNext} className="bg-primary text-primary-foreground">
            {current + 1 < quiz!.total_questions ? 'Próxima pergunta →' : 'Ver resultado →'}
          </Button>
        </motion.div>
      )}
    </div>
  )
}