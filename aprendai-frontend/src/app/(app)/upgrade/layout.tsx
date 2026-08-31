import type { Metadata } from 'next'
export const metadata: Metadata = {
  title      : 'Planos e Preços',
  description: 'Escolha o plano certo para o seu aprendizado.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}