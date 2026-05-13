'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, FileCode, Presentation, Table2,
  Download, Loader2, X, Check,
  Brain, Zap, GraduationCap, Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import api from '@/lib/api'

interface Props {
  planId: string
  lessonNumber: number
  lessonTitle: string
  isTeacher: boolean
  onClose: () => void
}

const FORMATS = [
  {
    id: 'pdf',
    label: 'PDF',
    desc: 'Documento formatado com branding AprendAI',
    icon: FileText,
    color: 'text-red-400',
  },
  {
    id: 'markdown',
    label: 'Markdown',
    desc: 'Texto estruturado, ideal para notas e GitHub',
    icon: FileCode,
    color: 'text-blue-400',
  },
  {
    id: 'pptx',
    label: 'PowerPoint',
    desc: 'Apresentação de slides pronta para usar',
    icon: Presentation,
    color: 'text-orange-400',
  },
  {
    id: 'csv',
    label: 'CSV',
    desc: 'Flashcards para importar no Anki ou Excel',
    icon: Table2,
    color: 'text-green-400',
  },
] as const

type FormatId = typeof FORMATS[number]['id']

const MODULES = [
  {
    id: 'include_quiz',
    label: 'Quiz de avaliação',
    desc: '5 perguntas geradas a partir do conteúdo',
    icon: Zap,
    teacherOnly: false,
  },
  {
    id: 'include_flashcards',
    label: 'Flashcards',
    desc: 'Cartões de memorização para spaced repetition',
    icon: Brain,
    teacherOnly: false,
  },
  {
    id: 'include_methodology',
    label: 'Metodologias de ensino',
    desc: 'Estratégias pedagógicas sugeridas pela IA',
    icon: GraduationCap,
    teacherOnly: true,
  },
] as const

export default function ExportModal({
  planId, lessonNumber, lessonTitle, isTeacher, onClose,
}: Props) {
  const [format, setFormat]   = useState<FormatId>('pdf')
  const [modules, setModules] = useState({
    include_quiz: false,
    include_flashcards: false,
    include_methodology: false,
  })
  const [loading, setLoading] = useState(false)

  const toggle = (key: keyof typeof modules) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await api.post(
        `/api/v1/plans/${planId}/lessons/${lessonNumber}/export`,
        { format, ...modules, quiz_num_questions: 5, flashcards_num_cards: 10 },
        { responseType: 'blob' },
      )

      // Dispara o download no browser
      const ext = { pdf: '.pdf', markdown: '.md', pptx: '.pptx', csv: '.csv' }[format]
      const url = URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a')
      a.href    = url
      a.download = `aprendai-aula-${lessonNumber}${ext}`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Exportação concluída!', {
        description: `Arquivo ${format.toUpperCase()} baixado com sucesso.`,
      })
      onClose()
    } catch {
      toast.error('Erro ao exportar', {
        description: 'Tente novamente ou escolha outro formato.',
      })
    } finally {
      setLoading(false)
    }
  }

  const hasModules = Object.values(modules).some(Boolean)
  const extraTime  = (modules.include_quiz ? 15 : 0)
                   + (modules.include_flashcards ? 10 : 0)
                   + (modules.include_methodology ? 20 : 0)

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2"
      >
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">

          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold">Exportar aula</h2>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground truncate max-w-xs">
                {lessonTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Seleção de formato */}
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Formato
          </p>
          <div className="mb-6 grid grid-cols-2 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                  format === f.id
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-secondary/30 hover:border-border/80'
                }`}
              >
                <f.icon size={18} className={`mt-0.5 shrink-0 ${f.color}`} />
                <div>
                  <p className="text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{f.desc}</p>
                </div>
                {format === f.id && (
                  <Check size={13} className="ml-auto mt-0.5 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Módulos opcionais */}
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Incluir também
          </p>
          <div className="mb-6 space-y-2">
            {MODULES.map((m) => {
              const blocked   = m.teacherOnly && !isTeacher
              const isEnabled = modules[m.id]

              return (
                <button
                  key={m.id}
                  onClick={() => !blocked && toggle(m.id)}
                  disabled={blocked}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    blocked
                      ? 'cursor-not-allowed border-border/40 opacity-50'
                      : isEnabled
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border hover:border-border/80'
                  }`}
                >
                  <m.icon size={16} className={`shrink-0 ${isEnabled && !blocked ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{m.label}</p>
                      {m.teacherOnly && (
                        <span className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/8 px-1.5 py-0.5 font-mono text-[9px] text-primary">
                          {blocked ? <Lock size={8} /> : <GraduationCap size={8} />}
                          Professor
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>

                  {/* Checkbox visual */}
                  <div className={`h-4 w-4 shrink-0 rounded border transition-all ${
                    isEnabled && !blocked
                      ? 'border-primary bg-primary'
                      : 'border-border bg-transparent'
                  }`}>
                    {isEnabled && !blocked && (
                      <Check size={12} className="text-primary-foreground m-auto" style={{ marginTop: 1 }} />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Preview do tempo estimado */}
          {hasModules && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-border bg-secondary/30 px-3 py-2 font-mono text-xs text-muted-foreground"
            >
              ⏱ Tempo estimado: ~{extraTime}s para gerar os módulos selecionados
            </motion.p>
          )}

          {/* Botão de exportar */}
          <Button
            onClick={handleExport}
            disabled={loading}
            className="w-full gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Gerando arquivo…
              </>
            ) : (
              <>
                <Download size={15} />
                Exportar {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}