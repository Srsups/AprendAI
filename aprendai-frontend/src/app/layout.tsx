import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import Providers from '@/providers/providers'
import { Toaster } from '@/components/ui/sonner'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
})

export const metadata: Metadata = {
  title: 'AprendAI — Aprenda qualquer coisa',
  description: 'Motor de aprendizado com IA. Planos de estudo personalizados.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} font-sans bg-[#0a0a08] text-[#e8e8e2] antialiased`}>
        <Providers>
          {children}
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}