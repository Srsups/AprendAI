import type { Metadata } from 'next'
export const metadata: Metadata = {
  title      : 'Meu Perfil',
  description: 'Suas estatísticas de aprendizado e progresso.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}