import type { Metadata } from 'next'
export const metadata: Metadata = {
  title      : 'Explorar',
  description: 'Descubra os temas mais estudados e coleções curadas.',
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}