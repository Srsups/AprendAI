'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SearchInput      from '@/components/home/SearchInput'
import TrendingList     from '@/components/home/TrendingList'
import GeneratingLoader from '@/components/home/GeneratingLoader'
import UsageIndicator   from '@/components/home/UsageIndicator'

function GradientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute rounded-full opacity-[0.06] blur-[120px]"
        style={{ width: 600, height: 600,
          background: 'radial-gradient(circle, #c8f060 0%, transparent 70%)',
          top: '-10%', left: '35%',
          animation: 'orb1 18s ease-in-out infinite alternate' }}
      />
    </div>
  )
}

export default function DashboardPage() {
  const [trendingPrompt,  setTrendingPrompt]  = useState('')
  const [generatingMeta,  setGeneratingMeta]  = useState<{
    subject: string; numLessons: number
  } | null>(null)
  const [limitReached, setLimitReached] = useState(false)

  return (
    <>
      <style>{`
        @keyframes orb1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(60px, 40px) scale(1.1); }
          100% { transform: translate(-30px, 80px) scale(0.92); }
        }
      `}</style>

      <GradientOrbs />

      <AnimatePresence>
        {generatingMeta && (
          <GeneratingLoader
            subject={generatingMeta.subject}
            numLessons={generatingMeta.numLessons}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 space-y-10">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
              Motor de Aprendizado com IA
            </span>
          </div>
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            O que você quer
            <br />
            <em className="italic text-primary">aprender hoje?</em>
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground leading-relaxed">
            Descreva o tema e a IA cria um plano de aulas estruturado,
            com quiz e flashcards incluídos.
          </p>
        </motion.div>

        {/* Indicador de uso */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <UsageIndicator onLimitReached={setLimitReached} />
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <SearchInput
            externalPrompt={trendingPrompt}
            limitReached={limitReached}
            onGeneratingStart={(subject, numLessons) =>
              setGeneratingMeta({ subject, numLessons })
            }
            onGeneratingEnd={() => setGeneratingMeta(null)}
          />
        </motion.div>

        {/* Trending */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <TrendingList
            onSelect={(subject) =>
              setTrendingPrompt(`Quero aprender sobre ${subject}`)
            }
          />
        </motion.div>

      </div>
    </>
  )
}