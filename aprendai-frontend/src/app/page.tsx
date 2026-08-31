'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen, Zap, Brain, Users, Download, Star,
  ChevronRight, Check, ArrowRight, Sparkles,
  GraduationCap, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ─── Helpers de animação ──────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32, filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Background (igual à home app) ────────────────────────────────────────────

function GradientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute rounded-full opacity-[0.07] blur-[120px]"
        style={{ width: 700, height: 700,
          background: 'radial-gradient(circle, #c8f060 0%, transparent 70%)',
          top: '-15%', left: '30%',
          animation: 'orb1 18s ease-in-out infinite alternate' }} />
      <div className="absolute rounded-full opacity-[0.04] blur-[100px]"
        style={{ width: 500, height: 500,
          background: 'radial-gradient(circle, #60d0f0 0%, transparent 70%)',
          bottom: '20%', right: '-5%',
          animation: 'orb2 22s ease-in-out infinite alternate' }} />
    </div>
  )
}

// ─── Navbar da landing ────────────────────────────────────────────────────────

function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/90 backdrop-blur-md border-b border-border' : ''
    }`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="font-serif text-xl text-primary">AprendAI</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {[
            { label: 'Como funciona', href: '#como-funciona' },
            { label: 'Recursos',      href: '#recursos' },
            { label: 'Planos',        href: '#planos' },
            { label: 'Sobre', href: '/sobre' },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Começar grátis
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Seção Hero ────────────────────────────────────────────────────────────────

function HeroSection() {
  const { scrollY } = useScroll()
  const y     = useTransform(scrollY, [0, 500], [0, 120])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const [heroTitle, setHeroTitle] = useState(
    'Transforme qualquer assunto\nem  um curso completo'
  )

  const renderTitle = () => {
    const highlightRe = /(qualquer(?:\s+assunto)?)/i
    return heroTitle.split('\n').map((line, i) => {
      const parts = line.split(highlightRe)
      return (
        <div key={i} className="whitespace-pre-line">
          {parts.map((part, idx) => (
            highlightRe.test(part)
              ? <span key={idx} className="text-primary font-serif italic">{part}</span>
              : <span key={idx}>{part}</span>
          ))}
        </div>
      )
    })
  }

  return (
    <section className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <motion.div style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-6xl text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5"
        >
          <Sparkles size={12} className="text-primary" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
            Powered by Azure AI Foundry · gpt-4o
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          style={{ textShadow: '0 0 80px rgba(200,240,96,0.3)' }}
        >
          {renderTitle()}
        </motion.h1>

        {/* Hero title is editable in the editor; textarea removed for production */}

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
        >
          AprendAI usa IA para dividir qualquer tema em aulas progressivas,
          com quiz, flashcards e avaliação — em segundos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/register">
            <Button size="lg"
              className="h-12 gap-2 bg-primary px-8 text-base font-bold text-primary-foreground hover:bg-primary/90">
              Criar meu plano de estudos
              <ArrowRight size={18} />
            </Button>
          </Link>
          <a href="#como-funciona">
            <Button size="lg" variant="outline"
              className="h-12 px-8 text-base border-border text-muted-foreground hover:text-foreground">
              Ver como funciona
            </Button>
          </a>
        </motion.div>

        {/* Números de prova social */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-14 grid grid-cols-2 gap-6 border-t border-border pt-10 sm:flex sm:flex-wrap sm:justify-center sm:gap-8"
        >
          {[
            { n: '12.400+', label: 'planos gerados' },
            { n: '4.8 ★',   label: 'avaliação média' },
            { n: '3 seg',    label: 'para gerar um plano' },
            { n: '100%',     label: 'baseado no conteúdo' },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <p className="font-serif text-2xl font-bold text-primary">{s.n}</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="flex h-8 w-5 items-start justify-center rounded-full border border-border p-1.5"
        >
          <div className="h-1.5 w-1 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── Seção Como Funciona ──────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Descreva o que quer aprender',
    desc: 'Digite em linguagem natural — "quero 8 aulas sobre Revolução Francesa focando em causas políticas" — e escolha o nível e tom.',
    icon: BookOpen,
  },
  {
    n: '02',
    title: 'A IA estrutura o plano',
    desc: 'O motor analisa o tema, divide em aulas progressivas e gera o conteúdo completo de cada uma com seções, conceitos-chave e reflexão.',
    icon: Brain,
  },
  {
    n: '03',
    title: 'Aprenda e avalie seu progresso',
    desc: 'Após cada aula, faça o quiz ou gere flashcards baseados exclusivamente no conteúdo — sem alucinações da IA.',
    icon: Zap,
  },
]

function HowItWorksSection() {
  return (
    <section id="como-funciona" className="relative z-10 py-28">
      <div className="mx-auto max-w-5xl px-6">
        <FadeUp className="mb-16 text-center">
          <Badge variant="outline" className="mb-4 font-mono text-xs">Como funciona</Badge>
          <h2 className="font-serif text-4xl font-bold md:text-5xl">
            De um tema a um curso completo
            <br />
            <span className="text-primary">em três passos</span>
          </h2>
        </FadeUp>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeUp key={step.n} delay={i * 0.12}>
              <div className="group relative rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card">
                <div className="mb-6 flex items-start justify-between">
                  <span className="font-mono text-5xl font-bold leading-none text-primary/20 transition-colors group-hover:text-primary/30">
                    {step.n}
                  </span>
                  <div className="rounded-xl border border-border bg-secondary p-2.5">
                    <step.icon size={20} className="text-primary" />
                  </div>
                </div>
                <h3 className="mb-3 font-serif text-xl font-bold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Seção Recursos ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    title: 'Designer Instrucional com IA',
    desc: 'O sistema atua como um professor universitário — não apenas responde, mas estrutura uma progressão pedagógica real.',
  },
  {
    icon: Zap,
    title: 'Quiz sem alucinações',
    desc: 'As perguntas são geradas exclusivamente a partir do conteúdo da aula. A IA não inventa fatos que não estão no material.',
  },
  {
    icon: BookOpen,
    title: 'Flashcards de memorização',
    desc: 'Cards frente/verso otimizados para spaced repetition — o método mais eficaz de memorização comprovado pela ciência.',
  },
  {
    icon: Download,
    title: 'Exportação de conteúdo',
    desc: 'Exporte seus planos em PDF, Markdown ou direto para uma apresentação — ideal para professores preparando aulas.',
  },
  {
    icon: Users,
    title: 'Modo Professor',
    desc: 'Crie planos alinhados à BNCC, defina objetivos de aprendizagem e gerencie turmas de alunos em um painel dedicado.',
  },
  {
    icon: GraduationCap,
    title: 'Níveis e estilos de aprendizado',
    desc: 'Iniciante, intermediário ou especialista. Tom didático, acadêmico, técnico ou "explique como se eu tivesse 10 anos".',
  },
]

function FeaturesSection() {
  return (
    <section id="recursos" className="relative z-10 py-28">
      <div className="mx-auto max-w-5xl px-6">
        <FadeUp className="mb-16 text-center">
          <Badge variant="outline" className="mb-4 font-mono text-xs">Recursos</Badge>
          <h2 className="font-serif text-4xl font-bold md:text-5xl">
            Tudo que você precisa para
            <br />
            <span className="text-primary">aprender de verdade</span>
          </h2>
        </FadeUp>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.07}>
              <div className="group rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm transition-all hover:border-primary/25 hover:bg-card">
                <div className="mb-4 inline-flex rounded-lg border border-border bg-secondary p-2">
                  <f.icon size={18} className="text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Seção Planos ─────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    desc: 'Para experimentar e aprender no seu ritmo.',
    icon: BookOpen,
    highlight: false,
    badge: null,
    cta: 'Começar grátis',
    ctaHref: '/register',
    features: [
      '2 planos de estudo por mês',
      'Até 8 aulas por plano',
      'Quiz básico (5 perguntas)',
      'Níveis iniciante e intermediário',
      'Acesso à página Explorar',
    ],
    missing: [
      'Flashcards',
      'Exportação PDF',
      'Modo Professor',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 29',
    period: 'por mês',
    desc: 'Para quem estuda com seriedade e quer o máximo.',
    icon: Zap,
    highlight: true,
    badge: 'Mais popular',
    cta: 'Assinar Pro',
    ctaHref: '/register?plan=pro',
    features: [
      'Planos ilimitados',
      'Até 16 aulas por plano',
      'Quiz completo (até 10 perguntas)',
      'Flashcards de spaced repetition',
      'Exportação em PDF e Markdown',
      'Todos os níveis e estilos',
      'Histórico completo de progresso',
      'Suporte prioritário',
    ],
    missing: [],
  },
  {
    name: 'Professor',
    price: 'R$ 59',
    period: 'por mês',
    desc: 'Para educadores criarem e gerenciarem suas turmas.',
    icon: GraduationCap,
    highlight: false,
    badge: null,
    cta: 'Assinar Professor',
    ctaHref: '/register?plan=teacher',
    features: [
      'Tudo do plano Pro',
      'Painel de turmas e alunos',
      'Exportação para Google Slides',
      'Alinhamento à BNCC',
      'Até 5 contas de alunos incluídas',
      'Relatórios de progresso da turma',
    ],
    missing: [],
  },
  {
    name: 'Institucional',
    price: 'Sob consulta',
    period: '',
    desc: 'Para escolas e instituições com múltiplos usuários.',
    icon: Building2,
    highlight: false,
    badge: 'Customizável',
    cta: 'Falar com vendas',
    ctaHref: '/contato',
    features: [
      'Usuários ilimitados',
      'Painel administrativo central',
      'SSO (Single Sign-On)',
      'SLA garantido',
      'Integração com LMS (Moodle, etc.)',
      'Treinamento e onboarding',
      'Suporte dedicado 24/7',
    ],
    missing: [],
  },
]

function PricingSection() {
  return (
    <section id="planos" className="relative z-10 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <FadeUp className="mb-16 text-center">
          <Badge variant="outline" className="mb-4 font-mono text-xs">Planos</Badge>
          <h2 className="font-serif text-4xl font-bold md:text-5xl">
            Escolha o plano certo
            <br />
            <span className="text-primary">para você</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Comece grátis, sem cartão de crédito. Faça upgrade quando precisar de mais.
          </p>
        </FadeUp>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 0.08}>
              <div className={`relative flex h-full flex-col rounded-2xl border p-6 transition-all ${
                plan.highlight
                  ? 'border-primary/50 bg-primary/5 shadow-[0_0_40px_rgba(200,240,96,0.08)]'
                  : 'border-border bg-card/60 backdrop-blur-sm hover:border-border/80'
              }`}>

                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold ${
                    plan.highlight
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground border border-border'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className={`mb-4 inline-flex rounded-lg p-2 ${
                    plan.highlight ? 'bg-primary/15 border border-primary/30' : 'bg-secondary border border-border'
                  }`}>
                    <plan.icon size={18} className={plan.highlight ? 'text-primary' : 'text-muted-foreground'} />
                  </div>
                  <h3 className="font-serif text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{plan.desc}</p>
                </div>

                {/* Preço */}
                <div className="mb-6 border-b border-border pb-6">
                  <span className={`font-serif text-3xl font-bold ${plan.highlight ? 'text-primary' : 'text-foreground'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="ml-1.5 text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground/40 line-through">
                      <Check size={14} className="mt-0.5 shrink-0 opacity-30" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.ctaHref}>
                  <Button
                    className={`w-full font-semibold ${
                      plan.highlight
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                    }`}
                  >
                    {plan.cta}
                    <ChevronRight size={15} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Seção Depoimentos ────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Ana Beatriz S.',
    role: 'Estudante de Direito · USP',
    text: 'Em 10 minutos tinha um mapeamento completo de Direito Constitucional para minha prova. O quiz ao final mostrou exatamente onde eu precisava revisar.',
    rating: 5,
  },
  {
    name: 'Prof. Carlos M.',
    role: 'Professor de História · EM',
    text: 'Uso o modo Professor para montar meu planejamento semestral. O que levava um fim de semana inteiro agora faço em uma tarde.',
    rating: 5,
  },
  {
    name: 'Rodrigo T.',
    role: 'Desenvolvedor · Autodidato',
    text: 'Aprendi os fundamentos de Machine Learning com 12 aulas geradas pelo AprendAI. O nível "especialista" realmente não subestima você.',
    rating: 5,
  },
]

function TestimonialsSection() {
  return (
    <section className="relative z-10 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <FadeUp className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold md:text-4xl">
            Quem já usa o AprendAI
          </h2>
        </FadeUp>

        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.1}>
              <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
                <div className="mb-4 flex text-yellow-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  "{t.text}"
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Seção CTA Final ──────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="relative z-10 py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <FadeUp>
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-12 backdrop-blur-sm"
            style={{ boxShadow: '0 0 80px rgba(200,240,96,0.06)' }}>
            <Sparkles size={32} className="mx-auto mb-6 text-primary" />
            <h2 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
              Pronto para aprender
              <br />
              <em className="italic text-primary">do seu jeito?</em>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Crie sua conta gratuitamente e gere seu primeiro plano de estudos em menos de 1 minuto.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg"
                  className="h-12 gap-2 bg-primary px-8 text-base font-bold text-primary-foreground hover:bg-primary/90">
                  Criar conta grátis
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground">
              Sem cartão de crédito · Cancele quando quiser
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="relative z-10 border-t border-border py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-serif text-lg text-primary">AprendAI</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Motor de criação de conteúdo educacional com Inteligência Artificial.
            </p>
          </div>

          {[
            {
              title: 'Produto',
              links: ['Como funciona', 'Recursos', 'Planos', 'Explorar'],
            },
            {
              title: 'Para quem',
              links: ['Estudantes', 'Professores', 'Instituições', 'Autodidatas'],
            },
            {
              title: 'Empresa',
              links: ['Sobre', 'Blog', 'Privacidade', 'Termos de uso'],
            },
            
          ].map((col) => (
            <div key={col.title}>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((link) => {
                  const href =
                    link === 'Sobre' ? '/sobre'       :
                    link === 'Planos'          ? '/#planos'     :
                    link === 'Como funciona'   ? '/#como-funciona' :
                    link === 'Recursos'        ? '/#recursos'   :
                    link === 'Explorar'        ? '/explorar'    :
                    '#'

                  return (
                    <li key={link}>
                      <a href={href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {link}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <p className="font-mono text-xs text-muted-foreground">
            © 2025 AprendAI. Projeto acadêmico — TCC.
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Powered by Azure AI Foundry · FastAPI · Next.js
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes orb1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(80px, 60px) scale(1.15); }
          100% { transform: translate(-40px, 100px) scale(0.9); }
        }
        @keyframes orb2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-70px, 40px) scale(1.2); }
          100% { transform: translate(30px, -80px) scale(0.85); }
        }
      `}</style>

      <GradientOrbs />
      <LandingNav />

      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>

      <Footer />
    </>
  )
}