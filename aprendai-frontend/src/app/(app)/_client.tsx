'use client'
import { useKeyboardShortcuts } from '@/hooks/useKeyboard'
import KeyboardShortcutsModal   from '@/components/shared/KeyboardShortcutsModal'
export function AppClient() {
  useKeyboardShortcuts()
  return <KeyboardShortcutsModal />
}