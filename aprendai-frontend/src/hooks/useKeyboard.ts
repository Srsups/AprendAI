'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignora se estiver em input/textarea
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (['input', 'textarea', 'select'].includes(tag)) return

      // Só funciona se autenticado
      if (!isAuthenticated()) return

      // g + d → Dashboard
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        const nextKey = (ev: KeyboardEvent) => {
          if (ev.key === 'd') router.push('/dashboard')
          if (ev.key === 'e') router.push('/explorar')
          if (ev.key === 'p') router.push('/plans')
          if (ev.key === 'u') router.push('/upgrade')
          window.removeEventListener('keydown', nextKey)
        }
        window.addEventListener('keydown', nextKey)
        setTimeout(() => window.removeEventListener('keydown', nextKey), 1000)
      }

      // ? → mostra modal de atalhos (implementado abaixo)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        document.dispatchEvent(new CustomEvent('show-shortcuts'))
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])
}