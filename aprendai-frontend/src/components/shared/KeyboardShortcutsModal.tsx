'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'

const SHORTCUTS = [
  { keys: ['g', 'd'], label: 'Ir para Dashboard'  },
  { keys: ['g', 'e'], label: 'Ir para Explorar'   },
  { keys: ['g', 'p'], label: 'Ir para Meus Planos' },
  { keys: ['g', 'u'], label: 'Ir para Upgrade'    },
  { keys: ['?'],      label: 'Mostrar atalhos'    },
  { keys: ['Esc'],    label: 'Fechar modal'        },
]

export default function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const show  = () => setOpen(true)
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('show-shortcuts', show)
    window.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('show-shortcuts', show)
      window.removeEventListener('keydown', close)
    }
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard size={16} className="text-primary" />
                  <h2 className="font-semibold text-foreground">Atalhos de teclado</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-2">
                {SHORTCUTS.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-secondary/50"
                  >
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((key) => (
                        <kbd
                          key={key}
                          className="rounded border border-border bg-secondary px-2 py-0.5 font-mono text-xs text-foreground"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-center font-mono text-[11px] text-muted-foreground">
                Pressione <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px]">?</kbd> para abrir a qualquer momento
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}