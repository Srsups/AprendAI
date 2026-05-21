'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import { usePlan } from '@/hooks/usePlan'
import { isAuthenticated } from '@/lib/auth'
import type { DifficultyLevel, ToneStyle } from '@/lib/types'

const LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: 'iniciante',     label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'especialista',  label: 'Especialista' },
]

const TONES: { value: ToneStyle; label: string }[] = [
  { value: 'didatico_simples', label: 'Didático' },
  { value: 'academico',        label: 'Acadêmico' },
  { value: 'para_crianca',     label: 'Simples' },
  { value: 'tecnico_direto',   label: 'Técnico' },
]

const LESSON_OPTIONS = [4, 6, 8, 10, 12]

interface Props {
  externalPrompt?:    string
  limitReached?:      boolean   // ← novo
  onGeneratingStart?: (subject: string, numLessons: number) => void
  onGeneratingEnd?:   () => void
}

export default function SearchInput({
  externalPrompt,
  limitReached = false,
  onGeneratingStart,
  onGeneratingEnd,
}: Props) {
  const router = useRouter()
  const { generateAndSave, generating, error } = usePlan()

  const [prompt,     setPrompt]     = useState('')
  const [level,      setLevel]      = useState<DifficultyLevel>('intermediario')
  const [tone,       setTone]       = useState<ToneStyle>('academico')
  const [numLessons, setNumLessons] = useState(8)

  useEffect(() => {
    if (externalPrompt) setPrompt(externalPrompt)
  }, [externalPrompt])

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (!isAuthenticated()) { router.push('/login'); return }

    // Extrai o subject do prompt para exibir no loader
    // (usa as primeiras palavras como preview — o backend retorna o real)
    const preview = prompt.length > 60 ? prompt.slice(0, 57) + '…' : prompt
    onGeneratingStart?.(preview, numLessons)

    const planId = await generateAndSave(prompt, numLessons, level, tone)

    onGeneratingEnd?.()

    if (planId) router.push(`/plans/${planId}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate()
  }

  return (
    <div className="w-full space-y-3">
      <div className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(200,240,96,0.05)]">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Quero 8 aulas sobre a Segunda Guerra Mundial, foque nas relações políticas e tratados…"
          className="min-h-[90px] resize-none border-0 bg-transparent p-0 text-base placeholder:italic placeholder:text-muted-foreground focus-visible:ring-0"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">

            {/* Nível */}
            <div className="flex overflow-hidden rounded-lg border border-border">
              {LEVELS.map((l) => (
                <button key={l.value} onClick={() => setLevel(l.value)}
                  className={`px-3 py-1.5 text-xs font-mono transition-all ${
                    level === l.value
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Tom */}
            <div className="flex overflow-hidden rounded-lg border border-border">
              {TONES.map((t) => (
                <button key={t.value} onClick={() => setTone(t.value)}
                  className={`px-3 py-1.5 text-xs font-mono transition-all ${
                    tone === t.value
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Nº aulas */}
            <div className="flex overflow-hidden rounded-lg border border-border">
              {LESSON_OPTIONS.map((n) => (
                <button key={n} onClick={() => setNumLessons(n)}
                  className={`px-3 py-1.5 text-xs font-mono transition-all ${
                    numLessons === n
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim() || limitReached}
            className="gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {generating
              ? <><Loader2 size={15} className="animate-spin" /> Gerando…</>
              : <><ArrowRight size={15} /> Gerar plano</>
            }
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      {limitReached && !error && (
        <p className="text-center text-sm text-destructive">
          Limite do plano gratuito atingido.{' '}
          <a href="/#planos" className="underline hover:text-primary">
            Faça upgrade
          </a>{' '}
          para continuar.
        </p>
      )}

      <p className="text-center font-mono text-xs text-muted-foreground">
        ⌘ + Enter para gerar
      </p>
    </div>
  )
}