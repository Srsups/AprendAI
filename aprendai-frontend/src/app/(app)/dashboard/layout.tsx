import type { Metadata } from 'next'
export const metadata: Metadata = {
  title      : 'Dashboard',
  description: 'Gere seu plano de estudos personalizado com IA.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}