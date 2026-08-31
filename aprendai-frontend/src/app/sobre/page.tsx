'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  Brain, Database, Shield, Zap,
  BookOpen, GraduationCap, ArrowRight,
  Github, Globe, Cpu, Layers,
  GitBranch, FlaskConical, Users,
  Sparkles, Code2, Server,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge }  from '@/components/ui/badge'

// ─── Helper de animação ────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?   : number
  className?: string
}) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, filter: 'blur(4px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Orbs de fundo ─────────────────────────────────────────────────────────────

function GradientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute rounded-full opacity-[0.06] blur-[120px]"
        style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, #c8f060 0%, transparent 70%)',
          top: '-10%', left: '30%',
          animation: 'orb1 18s ease-in-out infinite alternate',
        }}
      />
      <div className="absolute rounded-full opacity-[0.04] blur-[100px]"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, #60d0f0 0%, transparent 70%)',
          bottom: '20%', right: '-5%',
          animation: 'orb2 22s ease-in-out infinite alternate',
        }}
      />
    </div>
  )
}

// ─── Stack técnica ─────────────────────────────────────────────────────────────

const STACK = [
  {
    category: 'Frontend',
    icon: Globe,
    color: 'text-blue-400',
    border: 'border-blue-400/20',
    bg: 'bg-blue-400/5',
    items: [
      { name: 'Next.js 16',        desc: 'Framework React com App Router e React Compiler' },
      { name: 'Tailwind CSS v4',   desc: 'Estilização com design system customizado' },
      { name: 'shadcn/ui (Nova)',  desc: 'Componentes acessíveis com estilo AprendAI' },
      { name: 'Framer Motion',     desc: 'Animações e transições de alta performance' },
      { name: 'TanStack Query',    desc: 'Cache, revalidação e estado de servidor' },
    ],
  },
  {
    category: 'Backend',
    icon: Server,
    color: 'text-green-400',
    border: 'border-green-400/20',
    bg: 'bg-green-400/5',
    items: [
      { name: 'FastAPI',          desc: 'API async de alta performance com documentação automática' },
      { name: 'SQLAlchemy 2.0',  desc: 'ORM async com suporte a SQLite e PostgreSQL' },
      { name: 'Alembic',         desc: 'Migrações de banco de dados versionadas' },
      { name: 'Pydantic v2',     desc: 'Validação e serialização de dados tipados' },
      { name: 'python-jose',     desc: 'Autenticação JWT com tokens de 7 dias' },
    ],
  },
  {
    category: 'Inteligência Artificial',
    icon: Brain,
    color: 'text-primary',
    border: 'border-primary/20',
    bg: 'bg-primary/5',
    items: [
      { name: 'Azure AI Foundry', desc: 'Plataforma de IA da Microsoft com acesso ao GPT-4o' },
      { name: 'GPT-4o / GPT-4o-mini', desc: 'Modelos principais para geração de conteúdo' },
      { name: 'JSON Mode',       desc: 'Saídas estruturadas para evitar alucinações' },
      { name: 'Tenacity',        desc: 'Retry automático com backoff exponencial' },
      { name: 'Streaming SSE',   desc: 'Geração de conteúdo em tempo real via Server-Sent Events' },
    ],
  },
  {
    category: 'Infraestrutura',
    icon: Layers,
    color: 'text-orange-400',
    border: 'border-orange-400/20',
    bg: 'bg-orange-400/5',
    items: [
      { name: 'SQLite',          desc: 'Banco em desenvolvimento — zero configuração' },
      { name: 'PostgreSQL',      desc: 'Banco em produção — troca via variável de ambiente' },
      { name: 'Resend',          desc: 'Emails transacionais (recuperação de senha, boas-vindas)' },
      { name: 'Google OAuth2',   desc: 'Login social via OAuth2 sem bibliotecas externas' },
      { name: 'python-pptx',     desc: 'Geração de apresentações PowerPoint no servidor' },
    ],
  },
]

// ─── Agentes de IA ─────────────────────────────────────────────────────────────

const AGENTS = [
  {
    number : '01',
    name   : 'Designer Instrucional',
    desc   : 'Recebe o pedido livre do usuário e o transforma em um plano pedagógico estruturado com N aulas progressivas. Atua como um professor universitário com 20 anos de experiência.',
    output : 'Plano JSON com títulos, descrições e tags',
    icon   : GraduationCap,
  },
  {
    number : '02',
    name   : 'Professor Especialista',
    desc   : 'Gera o conteúdo completo de cada aula com seções, vocabulário adaptado ao nível do aluno e pergunta de reflexão. Mantém coerência com as aulas anteriores.',
    output : 'Conteúdo estruturado em seções + conceitos-chave',
    icon   : BookOpen,
  },
  {
    number : '03',
    name   : 'Avaliador',
    desc   : 'Gera perguntas de múltipla escolha baseadas EXCLUSIVAMENTE no conteúdo gerado pelo Agente 2 — nunca inventa fatos externos. Elimina alucinações por design.',
    output : 'Quiz com gabarito e explicações',
    icon   : FlaskConical,
  },
  {
    number : '04',
    name   : 'Flashcard Creator',
    desc   : 'Cria cartões de memorização otimizados para spaced repetition. Cada card testa um único conceito, com frente e verso concisos.',
    output : 'Flashcards frente/verso para memorização',
    icon   : Zap,
  },
  {
    number : '05',
    name   : 'Pedagogo (Professor)',
    desc   : 'Exclusivo para usuários com perfil de professor. Sugere metodologias ativas de ensino, objetivos de aprendizagem e estratégias de avaliação para a aula.',
    output : 'Metodologias + objetivos + sugestões de avaliação',
    icon   : Users,
  },
]

// ─── Decisões técnicas ────────────────────────────────────────────────────────

const DECISIONS = [
  {
    title: 'Por que agentes separados em vez de um único prompt?',
    body: 'Cada agente tem um system prompt com regras absolutas e uma responsabilidade única. O Agente 3 (Quiz) recebe como input o texto que o Agente 2 gerou — não um tema genérico. Isso é o que elimina alucinações: a IA só pode criar perguntas sobre o que foi escrito, nunca sobre o que ela "acha" que sabe.',
  },
  {
    title: 'Por que cache de conteúdo de aula no banco?',
    body: 'Gerar uma aula custa tokens e leva alguns segundos. Ao salvar o conteúdo gerado na coluna content_json da tabela lessons, a segunda visualização é instantânea e gratuita. O frontend nunca sabe se o conteúdo veio da IA ou do cache — o comportamento é idêntico.',
  },
  {
    title: 'Por que Alembic em vez de criar tabelas no startup?',
    body: 'SQLAlchemy cria tabelas mas não altera as existentes. Alembic versiona cada mudança de schema como uma migração numerada, permitindo adicionar colunas, renomear campos ou rollback sem perder dados. É o padrão de qualquer sistema em produção.',
  },
  {
    title: 'Por que auth própria em vez de Firebase ou Clerk?',
    body: 'Auth própria com JWT, passlib/bcrypt e python-jose dá controle total, zero dependência de terceiros para a lógica central, e muito mais para explicar tecnicamente. O login com Google foi implementado via OAuth2 puro — sem SDKs — para demonstrar compreensão do protocolo.',
  },
  {
    title: 'Por que SQLite em dev e PostgreSQL em produção?',
    body: 'A troca é feita alterando uma linha no .env (DATABASE_URL). O SQLAlchemy async com aiosqlite e asyncpg abstrai a diferença entre os dialetos. Isso permite desenvolver sem instalar nenhum serviço externo, e migrar para produção sem reescrever nada.',
  },
  {
    title: 'Por que streaming SSE no conteúdo das aulas?',
    body: 'GPT-4o leva alguns segundos para gerar uma aula completa. Com Server-Sent Events, o frontend começa a receber o texto enquanto ele ainda está sendo gerado, dando feedback imediato ao usuário. A percepção de velocidade melhora drasticamente mesmo sem redução real de latência.',
  },
]

// ─── Página ────────────────────────────────────────────────────────────────────

export default function SobrePage() {
  return (
    <>
      <style>{`
        @keyframes orb1 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(60px, 40px) scale(1.1); }
          100% { transform: translate(-30px, 80px) scale(0.92); }
        }
        @keyframes orb2 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-50px, 30px) scale(1.15); }
          100% { transform: translate(20px, -60px) scale(0.88); }
        }
      `}</style>

      <GradientOrbs />

      <div className="relative z-10">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <FadeUp>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5">
              <Sparkles size={12} className="text-primary" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
                Trabalho de Conclusão de Curso
              </span>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="mt-4 font-serif text-5xl font-bold leading-tight md:text-6xl">
              Sobre o{' '}
              <em className="italic text-primary"
                style={{ textShadow: '0 0 60px rgba(200,240,96,0.25)' }}>
                AprendAI
              </em>
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Motor de criação de conteúdo educacional com Inteligência Artificial.
              Um SaaS completo desenvolvido como Trabalho de Conclusão de Curso,
              demonstrando a integração de tecnologias modernas de IA com
              arquitetura de software profissional.
            </p>
          </FadeUp>

          <FadeUp delay={0.3} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">FastAPI + Python</Badge>
            <Badge variant="outline" className="font-mono text-xs">Next.js 16</Badge>
            <Badge variant="outline" className="font-mono text-xs">Azure AI Foundry</Badge>
            <Badge variant="outline" className="font-mono text-xs">GPT-4o</Badge>
            <Badge variant="outline" className="font-mono text-xs">SQLAlchemy + Alembic</Badge>
            <Badge variant="outline" className="font-mono text-xs">JWT + OAuth2</Badge>
            <Badge variant="outline" className="font-mono text-xs">Tailwind v4</Badge>
          </FadeUp>
        </section>

        {/* ── O problema ────────────────────────────────────────────────────── */}
        <section className="border-t border-border bg-card/30 py-20">
          <div className="mx-auto max-w-4xl px-6">
            <FadeUp className="mb-12 text-center">
              <h2 className="font-serif text-3xl font-bold md:text-4xl">
                O problema que o AprendAI resolve
              </h2>
            </FadeUp>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Brain,
                  title: 'Conteúdo genérico demais',
                  desc: 'Ferramentas de IA existentes respondem perguntas, mas não estruturam o aprendizado progressivo. A IA "responde" — o AprendAI "ensina".',
                },
                {
                  icon: Shield,
                  title: 'Alucinações nos quizzes',
                  desc: 'Quizzes gerados por IA frequentemente inventam fatos. No AprendAI, o agente de avaliação só pode usar o conteúdo que foi gerado — por design.',
                },
                {
                  icon: Database,
                  title: 'Zero persistência',
                  desc: 'ChatGPT e similares não salvam o progresso do usuário. O AprendAI registra cada aula vista, quiz feito e plano concluído.',
                },
              ].map((item, i) => (
                <FadeUp key={item.title} delay={i * 0.1}>
                  <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
                    <div className="mb-4 inline-flex rounded-xl border border-border bg-secondary p-2.5">
                      <item.icon size={20} className="text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── Arquitetura dos agentes ────────────────────────────────────────── */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <FadeUp className="mb-4 text-center">
              <h2 className="font-serif text-3xl font-bold md:text-4xl">
                Arquitetura multi-agente
              </h2>
            </FadeUp>
            <FadeUp delay={0.1} className="mb-12 text-center">
              <p className="mx-auto max-w-xl text-muted-foreground">
                Cada agente tem uma responsabilidade única, um system prompt dedicado
                e opera sobre o output do anterior — nunca sobre suposições.
              </p>
            </FadeUp>

            {/* Diagrama de fluxo */}
            <FadeUp delay={0.15} className="mb-12">
              <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-0">
                  {[
                    { label: 'Pedido do\nusuário', color: 'bg-secondary' },
                    { label: 'Agente 1\nDesigner', color: 'bg-primary/20' },
                    { label: 'Agente 2\nProfessor', color: 'bg-primary/30' },
                    { label: 'Agente 3\nAvaliador', color: 'bg-primary/20' },
                    { label: 'Agente 4\nFlashcards', color: 'bg-primary/10' },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center md:flex-row">
                      <div className={`rounded-xl px-4 py-3 text-center ${step.color} border border-border`}>
                        <p className="whitespace-pre font-mono text-xs text-foreground">
                          {step.label}
                        </p>
                      </div>
                      {i < 4 && (
                        <ArrowRight
                          size={16}
                          className="my-1 rotate-90 text-primary/50 md:my-0 md:mx-2 md:rotate-0"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
                  Agente 5 (Metodologias) é paralelo ao Agente 2 — exclusivo para professores
                </p>
              </div>
            </FadeUp>

            {/* Cards dos agentes */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {AGENTS.map((agent, i) => (
                <FadeUp key={agent.number} delay={i * 0.08}>
                  <div className="group flex h-full flex-col rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-all hover:border-primary/25">
                    <div className="mb-4 flex items-start justify-between">
                      <span className="font-serif text-4xl font-bold leading-none text-primary/15 transition-colors group-hover:text-primary/25">
                        {agent.number}
                      </span>
                      <div className="rounded-xl border border-border bg-secondary p-2">
                        <agent.icon size={16} className="text-primary" />
                      </div>
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">{agent.name}</h3>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {agent.desc}
                    </p>
                    <div className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-2">
                      <p className="font-mono text-[11px] text-primary">
                        → {agent.output}
                      </p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stack técnica ──────────────────────────────────────────────────── */}
        <section className="border-t border-border bg-card/30 py-20">
          <div className="mx-auto max-w-5xl px-6">
            <FadeUp className="mb-12 text-center">
              <h2 className="font-serif text-3xl font-bold md:text-4xl">
                Stack tecnológica
              </h2>
            </FadeUp>

            <div className="grid gap-4 md:grid-cols-2">
              {STACK.map((stack, i) => (
                <FadeUp key={stack.category} delay={i * 0.1}>
                  <div className={`rounded-2xl border p-6 ${stack.border} ${stack.bg} backdrop-blur-sm`}>
                    <div className="mb-4 flex items-center gap-3">
                      <stack.icon size={18} className={stack.color} />
                      <h3 className="font-semibold text-foreground">{stack.category}</h3>
                    </div>
                    <ul className="space-y-3">
                      {stack.items.map((item) => (
                        <li key={item.name} className="flex items-start gap-3">
                          <Code2 size={12} className="mt-1 shrink-0 text-muted-foreground/50" />
                          <div>
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {item.name}
                            </span>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── Decisões técnicas ─────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-6">
            <FadeUp className="mb-4 text-center">
              <h2 className="font-serif text-3xl font-bold md:text-4xl">
                Decisões de arquitetura
              </h2>
            </FadeUp>
            <FadeUp delay={0.1} className="mb-12 text-center">
              <p className="mx-auto max-w-xl text-muted-foreground">
                As perguntas que a banca mais faz — e as respostas técnicas
                por trás de cada escolha do projeto.
              </p>
            </FadeUp>

            <div className="space-y-4">
              {DECISIONS.map((d, i) => (
                <FadeUp key={d.title} delay={i * 0.07}>
                  <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm">
                    <div className="mb-2 flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 rounded-full bg-primary/15 p-1">
                        <GitBranch size={12} className="text-primary" />
                      </div>
                      <h3 className="font-semibold leading-snug text-foreground">
                        {d.title}
                      </h3>
                    </div>
                    <p className="pl-7 text-sm leading-relaxed text-muted-foreground">
                      {d.body}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── Métricas do projeto ────────────────────────────────────────────── */}
        <section className="border-t border-border bg-card/30 py-20">
          <div className="mx-auto max-w-4xl px-6">
            <FadeUp className="mb-12 text-center">
              <h2 className="font-serif text-3xl font-bold md:text-4xl">
                O projeto em números
              </h2>
            </FadeUp>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { value: '20+',  label: 'Endpoints de API',      icon: Server },
                { value: '5',    label: 'Agentes de IA',         icon: Brain },
                { value: '10+',  label: 'Páginas no frontend',   icon: Globe },
                { value: '4',    label: 'Formatos de exportação', icon: Cpu },
                { value: '5',    label: 'Tabelas no banco',      icon: Database },
                { value: '4',    label: 'Planos de assinatura',  icon: Zap },
                { value: '100%', label: 'TypeScript no frontend', icon: Code2 },
                { value: '0',    label: 'Dependências de terceiros para auth', icon: Shield },
              ].map((stat, i) => (
                <FadeUp key={stat.label} delay={i * 0.06}>
                  <div className="flex flex-col items-center rounded-2xl border border-border bg-card/60 p-5 text-center backdrop-blur-sm">
                    <div className="mb-3 rounded-xl border border-border bg-secondary p-2">
                      <stat.icon size={16} className="text-primary" />
                    </div>
                    <p className="font-serif text-3xl font-bold text-primary">
                      {stat.value}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground leading-tight">
                      {stat.label}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <FadeUp>
              <div className="rounded-3xl border border-primary/20 bg-primary/5 p-10 backdrop-blur-sm"
                style={{ boxShadow: '0 0 60px rgba(200,240,96,0.05)' }}>
                <Sparkles size={28} className="mx-auto mb-5 text-primary" />
                <h2 className="font-serif text-3xl font-bold">
                  Quer testar na prática?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                  Crie uma conta gratuita e gere seu primeiro plano de estudos
                  em menos de um minuto.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="w-full gap-2 bg-primary font-bold text-primary-foreground hover:bg-primary/90 sm:w-auto"
                    >
                      Criar conta grátis
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-border sm:w-auto"
                    >
                      Ver a landing page
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

      </div>
    </>
  )
}