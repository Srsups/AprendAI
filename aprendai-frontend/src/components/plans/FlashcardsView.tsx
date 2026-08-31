'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, RotateCcw, ChevronLeft, ChevronRight, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { assessmentApi } from '@/lib/api'
import { toast } from 'sonner'
import type { FlashcardsResponse } from '@/lib/types'
import EmptyState from '../shared/EmptyState'

interface Props {
  lessonText: string
}

type Phase = 'idle' | 'loading' | 'studying'

export default function FlashcardsView({ lessonText }: Props) {
  const [phase,   setPhase]   = useState<Phase>('idle')
  const [data,    setData]    = useState<FlashcardsResponse | null>(null)
  const [index,   setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known,   setKnown]   = useState<Set<number>>(new Set())

  const start = async () => {
    setPhase('loading')
    try {
      const res = await assessmentApi.generateFlashcards(lessonText, 10)
      setData(res.data)
      setIndex(0)
      setFlipped(false)
      setKnown(new Set())
      setPhase('studying')
    } catch {
      toast.error('Erro ao gerar flashcards.')
      setPhase('idle')
    }
  }

  const goTo = (i: number) => {
    setIndex(i)
    setFlipped(false)
  }

  const markKnown = () => {
    setKnown((prev) => new Set(prev).add(index))
    if (index + 1 < (data?.total_cards ?? 0)) goTo(index + 1)
  }

  // ── Idle ───────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <EmptyState
        icon={Brain}
        title="Memorizar com flashcards"
        description="10 cartões gerados a partir do conteúdo desta aula para spaced repetition."
        cta={{ label: 'Gerar Flashcards', onClick: start }}
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
          Gerando flashcards com IA…
        </p>
      </div>
    )
  }

  const card       = data!.cards[index]
  const total      = data!.total_cards
  const knownCount = known.size
  const pct        = Math.round((knownCount / total) * 100)

  return (
    <div className="space-y-6">
      {/* Progresso */}
      <div className="space-y-1.5">
        <div className="flex justify-between font-mono text-xs text-muted-foreground">
          <span>Card {index + 1} de {total}</span>
          <span className="text-primary">{knownCount} já sei ✓</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Card com flip 3D */}
      <div
        className="relative mx-auto cursor-pointer"
        style={{ height: 220, perspective: 1000 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <motion.div
          className="relative h-full w-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Frente */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Frente — clique para revelar
            </p>
            <p className="font-serif text-xl font-bold leading-snug text-foreground">
              {card.front}
            </p>
          </div>

          {/* Verso */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-primary">
              Resposta
            </p>
            <p className="text-base leading-relaxed text-foreground">{card.back}</p>
          </div>
        </motion.div>
      </div>

      <p className="text-center font-mono text-xs text-muted-foreground">
        Clique no card para {flipped ? 'ocultar' : 'revelar'} a resposta
      </p>

      {/* Ações */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline" size="sm"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
          className="gap-1"
        >
          <ChevronLeft size={14} /> Anterior
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            onClick={() => { if (index + 1 < total) goTo(index + 1) }}
            className="text-muted-foreground"
          >
            Pular
          </Button>
          <Button
            size="sm"
            onClick={markKnown}
            className={`gap-1 ${known.has(index) ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-primary text-primary-foreground'}`}
          >
            {known.has(index) ? '✓ Já sei' : 'Já sei!'}
          </Button>
        </div>

        <Button
          variant="outline" size="sm"
          disabled={index + 1 >= total}
          onClick={() => goTo(index + 1)}
          className="gap-1"
        >
          Próximo <ChevronRight size={14} />
        </Button>
      </div>

      {/* Miniaturas de navegação */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {data!.cards.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 w-2 rounded-full transition-all ${
              i === index ? 'bg-primary scale-125'
              : known.has(i) ? 'bg-primary/40'
              : 'bg-secondary'
            }`}
          />
        ))}
      </div>

      {/* Reset */}
      {knownCount === total && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center"
        >
          <p className="font-serif text-lg font-bold text-primary mb-2">
            🎉 Você completou todos os flashcards!
          </p>
          <Button
            variant="outline" size="sm"
            onClick={() => { setKnown(new Set()); goTo(0) }}
            className="gap-2 mt-2"
          >
            <RotateCcw size={13} /> Revisar novamente
          </Button>
        </motion.div>
      )}
    </div>
  )
}