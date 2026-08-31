import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import Providers  from '@/providers/providers'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const dmSans   = DM_Sans({          subsets: ['latin'], variable: '--font-dm-sans'   })
const dmMono   = DM_Mono({ weight: ['400','500'], subsets: ['latin'], variable: '--font-dm-mono' })

export const metadata: Metadata = {
  title       : { default: 'AprendAI', template: '%s · AprendAI' },
  description : 'Motor de criação de conteúdo educacional com Inteligência Artificial. Planos de estudo personalizados, quizzes e flashcards gerados por IA.',
  keywords    : ['aprendizado', 'inteligência artificial', 'educação', 'plano de estudos', 'quiz', 'flashcards'],
  authors     : [{ name: 'AprendAI' }],
  creator     : 'AprendAI',
  openGraph   : {
    type       : 'website',
    locale     : 'pt_BR',
    title      : 'AprendAI — Motor de Aprendizado com IA',
    description: 'Transforme qualquer assunto em um curso completo com IA.',
    siteName   : 'AprendAI',
  },
  twitter: {
    card       : 'summary_large_image',
    title      : 'AprendAI',
    description: 'Motor de criação de conteúdo educacional com IA.',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor    : '#0a0a08',
  colorScheme   : 'dark',
  width         : 'device-width',
  initialScale  : 1,
  maximumScale  : 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        {/* Favicon SVG inline — verde limão AprendAI */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%230a0a08'/><circle cx='16' cy='16' r='7' fill='none' stroke='%23c8f060' stroke-width='2'/><circle cx='16' cy='16' r='2.5' fill='%23c8f060'/></svg>" />
      </head>
      <body className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} font-sans bg-[#0a0a08] text-[#e8e8e2] antialiased`}>
        <Providers>
          {children}
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}