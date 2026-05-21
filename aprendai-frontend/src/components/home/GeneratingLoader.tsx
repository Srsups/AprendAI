'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, Sparkles } from 'lucide-react'

interface Props {
  subject: string   // tema detectado pelo usuário para exibir na tela
  numLessons: number
}

// ─── Etapas do processo ────────────────────────────────────────────────────────

const STEPS = [
  {
    label: 'Analisando o tema solicitado',
    detail: 'Identificando conceitos centrais e escopo do conteúdo',
    duration: 2200,
  },
  {
    label: 'Estruturando a progressão pedagógica',
    detail: 'Organizando as aulas em ordem de complexidade crescente',
    duration: 3000,
  },
  {
    label: 'Gerando títulos e descrições',
    detail: 'Cada aula recebe um título específico e objetivo claro',
    duration: 2800,
  },
  {
    label: 'Validando a coerência do plano',
    detail: 'Verificando se as aulas se complementam corretamente',
    duration: 2000,
  },
  {
    label: 'Salvando seu plano de estudos',
    detail: 'Armazenando no banco de dados para você continuar depois',
    duration: 1500,
  },
]

// ─── Dicas exibidas enquanto carrega ──────────────────────────────────────────

const TIPS = [
  'Você pode fazer o quiz ao final de cada aula para fixar o conteúdo.',
  'Os flashcards são gerados exclusivamente a partir do conteúdo da aula — sem invenções.',
  'Após concluir o plano, avalie com 0 a 5 estrelas para ajudar outros usuários.',
  'Professores podem exportar o plano como apresentação de slides em PPTX.',
  'Quanto mais específico o seu pedido, melhor o plano gerado pela IA.',
  'Use o nível "Especialista" para conteúdo sem simplificações desnecessárias.',
]

export default function GeneratingLoader({ subject, numLessons }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [doneSteps,   setDoneSteps]   = useState<number[]>([])
  const [tipIndex,    setTipIndex]     = useState(0)
  const [progress,    setProgress]     = useState(0)

  // Avança etapas com os tempos definidos
  useEffect(() => {
    let elapsed = 0
    const total  = STEPS.reduce((acc, s) => acc + s.duration, 0)
    let stepIdx  = 0

    const advance = () => {
      if (stepIdx >= STEPS.length) return

      const step    = STEPS[stepIdx]
      elapsed      += step.duration
      const nextIdx = stepIdx + 1

      setTimeout(() => {
        setDoneSteps((prev) => [...prev, stepIdx])
        setCurrentStep(Math.min(nextIdx, STEPS.length - 1))
        setProgress(Math.min(Math.round((elapsed / total) * 100), 95))
        stepIdx = nextIdx
        advance()
      }, step.duration)
    }

    advance()
  }, [])

  // Rotaciona as dicas a cada 4 segundos
  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const activeStep = STEPS[currentStep]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/95 backdrop-blur-md px-6"
    >
      {/* Orb de fundo */}
      <div
        className="pointer-events-none absolute rounded-full opacity-10 blur-[100px]"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, #c8f060 0%, transparent 70%)',
          top: '10%', left: '30%',
          animation: 'orb1 8s ease-in-out infinite alternate',
        }}
      />

      <div className="relative w-full max-w-lg">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5">
            <Sparkles size={12} className="text-primary" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
              Gerando com IA
            </span>
          </div>

          <h2 className="font-serif text-2xl font-bold leading-tight">
            {numLessons} aulas sobre
            <br />
            <span className="text-primary">"{subject}"</span>
          </h2>
        </motion.div>

        {/* Barra de progresso */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="mb-2 flex justify-between font-mono text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Lista de etapas */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 space-y-3"
        >
          {STEPS.map((step, i) => {
            const isDone    = doneSteps.includes(i)
            const isActive  = currentStep === i && !isDone
            const isPending = !isDone && !isActive

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: isPending ? 0.35 : 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                {/* Ícone de status */}
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 size={18} className="text-primary" />
                    </motion.div>
                  ) : isActive ? (
                    <Loader2 size={18} className="animate-spin text-primary" />
                  ) : (
                    <Circle size={18} className="text-muted-foreground/30" />
                  )}
                </div>

                {/* Texto */}
                <div className="min-w-0">
                  <p className={`text-sm font-medium leading-snug ${
                    isDone ? 'text-foreground line-through opacity-50'
                    : isActive ? 'text-foreground'
                    : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </p>
                  <AnimatePresence>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-0.5 font-mono text-xs text-muted-foreground"
                      >
                        {step.detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Dica rotativa */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-border bg-card/60 px-4 py-3"
        >
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            💡 Sabia que…
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

      </div>
    </motion.div>
  )
}