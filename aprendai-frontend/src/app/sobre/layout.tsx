import type { Metadata } from 'next'
export const metadata: Metadata = {
  title      : 'Sobre o Projeto',
  description: 'Arquitetura, tecnologias e decisões técnicas do AprendAI — TCC.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}