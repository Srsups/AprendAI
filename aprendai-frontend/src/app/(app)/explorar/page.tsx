'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import Link from 'next/link'
import { plansApi } from '@/lib/api'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Compass, Star, TrendingUp, BookOpen,
  GraduationCap, Atom, Globe, Calculator,
  Palette, Cpu, FlaskConical, Music,
} from 'lucide-react'
import type { TrendingItem } from '@/lib/types'

// ─── Coleções mockadas ────────────────────────────────────────────────────────
// Futuramente virão do banco; por ora são estáticas para demonstrar o conceito

const COLLECTIONS = [
  {
    id: 'enem',
    name: 'Preparação ENEM',
    description: 'Tudo que você precisa para o ENEM em um só lugar — do básico ao avançado.',
    color: 'from-primary/20 to-primary/5',
    border: 'border-primary/30',
    icon: GraduationCap,
    tags: ['Matemática', 'Redação', 'Ciências', 'História', 'Literatura'],
    plans: 24,
  },
  {
    id: 'dev',
    name: 'Dev do Zero',
    description: 'Trilha completa para quem quer entrar na área de tecnologia sem experiência.',
    color: 'from-blue-500/15 to-blue-500/5',
    border: 'border-blue-500/25',
    icon: Cpu,
    tags: ['Lógica', 'Python', 'Web', 'Banco de Dados', 'APIs'],
    plans: 18,
  },
  {
    id: 'ciencias',
    name: 'Ciências Naturais',
    description: 'Física, Química e Biologia integradas — como a natureza realmente funciona.',
    color: 'from-emerald-500/15 to-emerald-500/5',
    border: 'border-emerald-500/25',
    icon: FlaskConical,
    tags: ['Física', 'Química', 'Biologia', 'Ecologia'],
    plans: 15,
  },
  {
    id: 'humanidades',
    name: 'Humanidades',
    description: 'Filosofia, Sociologia, História e Literatura para pensar o mundo criticamente.',
    color: 'from-amber-500/15 to-amber-500/5',
    border: 'border-amber-500/25',
    icon: Globe,
    tags: ['Filosofia', 'Sociologia', 'História', 'Literatura'],
    plans: 20,
  },
  {
    id: 'matematica',
    name: 'Matemática Aplicada',
    description: 'Do fundamental ao cálculo diferencial, com foco em aplicações reais.',
    color: 'from-violet-500/15 to-violet-500/5',
    border: 'border-violet-500/25',
    icon: Calculator,
    tags: ['Álgebra', 'Geometria', 'Cálculo', 'Estatística'],
    plans: 16,
  },
  {
    id: 'artes',
    name: 'Arte & Cultura',
    description: 'História da arte, música, cinema e expressão criativa.',
    color: 'from-pink-500/15 to-pink-500/5',
    border: 'border-pink-500/25',
    icon: Palette,
    tags: ['História da Arte', 'Música', 'Cinema', 'Design'],
    plans: 12,
  },
]

// ─── Categorias de busca rápida ────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Ciências',     icon: Atom },
  { label: 'História',     icon: Globe },
  { label: 'Tecnologia',   icon: Cpu },
  { label: 'Matemática',   icon: Calculator },
  { label: 'Literatura',   icon: BookOpen },
  { label: 'Artes',        icon: Palette },
  { label: 'Ciências',     icon: FlaskConical },
  { label: 'Música',       icon: Music },
]

// ─── Animação de entrada ──────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

const stagger = {
  show: { transition: { staggerChildren: 0.07 } },
}

// ─── Card de trending ─────────────────────────────────────────────────────────

function TrendingCard({ item, index }: { item: TrendingItem; index: number }) {
  return (
    <motion.div variants={fadeUp}>
      <Link href={`/dashboard?q=${encodeURIComponent(item.subject)}`}>
        <div className="group relative flex items-start gap-4 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card hover:-translate-y-0.5">
          {/* Número */}
          <span className="font-serif text-3xl font-bold leading-none text-primary/20 transition-colors group-hover:text-primary/35 select-none">
            {String(index + 1).padStart(2, '0')}
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
              {item.subject}
            </h3>
            <div className="mt-2 flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">
                {item.total_generations.toLocaleString('pt-BR')} gerações
              </span>
              {item.avg_rating && (
                <span className="flex items-center gap-1 font-mono text-xs text-yellow-400">
                  <Star size={10} fill="currentColor" />
                  {item.avg_rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Barra de popularidade relativa */}
          <div className="absolute bottom-0 left-0 h-0.5 rounded-full bg-primary/20 transition-all group-hover:bg-primary/40"
            style={{ width: `${Math.min(100, (item.total_generations / 50) * 100)}%` }}
          />
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Card de coleção ──────────────────────────────────────────────────────────

function CollectionCard({ col }: { col: typeof COLLECTIONS[0] }) {
  return (
    <div className={`group relative h-full rounded-2xl border bg-gradient-to-br p-6 transition-all hover:-translate-y-1 ${col.color} ${col.border}`}>
      <div className="mb-4 inline-flex rounded-xl border border-border bg-background/50 p-3 backdrop-blur-sm">
        <col.icon size={22} className="text-primary" />
      </div>

      <h3 className="mb-2 font-serif text-lg font-bold text-foreground">
        {col.name}
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {col.description}
      </p>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {col.tags.map((tag) => (
          <span key={tag}
            className="rounded-md border border-border bg-background/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          {col.plans} planos
        </span>
        <Button size="sm" variant="outline"
          className="border-border bg-background/50 text-xs hover:border-primary/40 hover:text-primary">
          Explorar →
        </Button>
      </div>
    </div>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function ExplorarPage() {
  const { data: trending, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn:  () => plansApi.trending().then((r) => r.data as TrendingItem[]),
  })

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-2 mb-3">
          <Compass size={18} className="text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Explorar
          </span>
        </div>
        <h1 className="font-serif text-4xl font-bold">
          Descubra o que outros
          <br />
          <span className="text-primary">estão aprendendo</span>
        </h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Explore os temas mais estudados, coleções curadas e inicie um plano com um clique.
        </p>
      </motion.div>

      {/* Categorias rápidas */}
      <section className="mb-16">
        <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Categorias
          <span className="h-px flex-1 bg-border" />
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={`${cat.label}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 font-mono text-xs text-muted-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:text-primary hover:bg-primary/5"
            >
              <cat.icon size={13} />
              {cat.label}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Coleções — Carrossel */}
      <section className="mb-16">
        <p className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Coleções em destaque
          <span className="h-px flex-1 bg-border" />
        </p>

        <Carousel opts={{ align: 'start', loop: false }}
          className="w-full">
          <CarouselContent className="-ml-4">
            {COLLECTIONS.map((col) => (
              <CarouselItem key={col.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3">
                <CollectionCard col={col} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-4 flex gap-2">
            <CarouselPrevious className="static translate-y-0 border-border bg-card hover:border-primary/40" />
            <CarouselNext     className="static translate-y-0 border-border bg-card hover:border-primary/40" />
          </div>
        </Carousel>
      </section>

      {/* Trending */}
      <section>
        <p className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <TrendingUp size={12} />
          Mais gerados esta semana
          <span className="h-px flex-1 bg-border" />
        </p>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : !trending?.length ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <TrendingUp size={28} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ainda não há dados suficientes. Seja o primeiro a gerar planos!
            </p>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="mt-4">
                Gerar meu primeiro plano
              </Button>
            </Link>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-3 md:grid-cols-2"
          >
            {trending.map((item, i) => (
              <TrendingCard key={item.subject} item={item} index={i} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  )
}