import type { Metadata } from 'next'
export const metadata: Metadata = {
  title      : 'Meus Planos',
  description: 'Seus planos de estudo salvos e progresso.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}