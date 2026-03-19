'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, cubicBezier } from 'framer-motion'
import SearchInput from '@/components/home/SearchInput'
import TrendingList from '@/components/home/TrendingList'

// ─── Canvas de partículas interativo ──────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const COLS = 28
    const ROWS = 16
    let dots: { x: number; y: number; ox: number; oy: number; size: number }[] = []

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      dots = []
      const gapX = canvas.width  / COLS
      const gapY = canvas.height / ROWS
      for (let i = 0; i < COLS; i++) {
        for (let j = 0; j < ROWS; j++) {
          const x = gapX * i + gapX / 2
          const y = gapY * j + gapY / 2
          dots.push({ x, y, ox: x, oy: y, size: 1.2 })
        }
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }

    const RADIUS   = 130
    const STRENGTH = 38

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const dot of dots) {
        const dx = mouse.current.x - dot.ox
        const dy = mouse.current.y - dot.oy
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < RADIUS) {
          const force = (1 - dist / RADIUS) * STRENGTH
          dot.x += (dot.ox - force * (dx / dist) - dot.x) * 0.12
          dot.y += (dot.oy - force * (dy / dist) - dot.y) * 0.12
        } else {
          dot.x += (dot.ox - dot.x) * 0.08
          dot.y += (dot.oy - dot.y) * 0.08
        }

        const proximity = Math.max(0, 1 - dist / RADIUS)
        const alpha = 0.12 + proximity * 0.5
        const size  = dot.size + proximity * 1.8

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 240, 96, ${alpha})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
    />
  )
}

// ─── Orbs de gradiente animados ────────────────────────────────────────────────
function GradientOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Orb principal — verde limão */}
      <div
        className="absolute rounded-full opacity-[0.07] blur-[120px]"
        style={{
          width: 700,
          height: 700,
          background: 'radial-gradient(circle, #c8f060 0%, transparent 70%)',
          top: '-15%',
          left: '30%',
          animation: 'orb1 18s ease-in-out infinite alternate',
        }}
      />
      {/* Orb secundário — teal frio */}
      <div
        className="absolute rounded-full opacity-[0.05] blur-[100px]"
        style={{
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, #60d0f0 0%, transparent 70%)',
          bottom: '10%',
          right: '-5%',
          animation: 'orb2 22s ease-in-out infinite alternate',
        }}
      />
      {/* Orb terciário — âmbar quente */}
      <div
        className="absolute rounded-full opacity-[0.04] blur-[90px]"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, #f0c060 0%, transparent 70%)',
          bottom: '30%',
          left: '-8%',
          animation: 'orb3 26s ease-in-out infinite alternate',
        }}
      />
    </div>
  )
}

// ─── Animações de texto em cascata ────────────────────────────────────────────
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.7, ease: cubicBezier(0.16, 1, 0.3, 1) }
  },
}

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0,
    transition: { duration: 0.6, ease: cubicBezier(0.16, 1, 0.3, 1) }
  },
}

// ─── Cursor personalizado ──────────────────────────────────────────────────────
function CustomCursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { stiffness: 200, damping: 28 })
  const springY = useSpring(y, { stiffness: 200, damping: 28 })

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      {/* Anel externo — lento */}
      <motion.div
        className="pointer-events-none fixed z-50 hidden md:block"
        style={{
          left: springX, top: springY,
          width: 36, height: 36,
          marginLeft: -18, marginTop: -18,
          border: '1px solid rgba(200,240,96,0.35)',
          borderRadius: '50%',
        }}
      />
      {/* Ponto central — imediato */}
      <motion.div
        className="pointer-events-none fixed z-50 hidden md:block"
        style={{
          left: x, top: y,
          width: 5, height: 5,
          marginLeft: -2.5, marginTop: -2.5,
          background: '#c8f060',
          borderRadius: '50%',
        }}
      />
    </>
  )
}

// ─── Linha separadora animada ──────────────────────────────────────────────────
function AnimatedDivider() {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
      style={{ originX: 0 }}
      className="h-px w-full bg-linear-to-r from-primary/40 via-primary/10 to-transparent"
    />
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function HomePage() {
  const [trendingPrompt, setTrendingPrompt] = useState('')

  return (
    <>
      {/* Keyframes globais para os orbs */}
      <style>{`
        @keyframes orb1 {
          0%   { transform: translate(0,    0)    scale(1); }
          50%  { transform: translate(80px, 60px) scale(1.15); }
          100% { transform: translate(-40px,100px) scale(0.9); }
        }
        @keyframes orb2 {
          0%   { transform: translate(0,  0)     scale(1); }
          50%  { transform: translate(-70px,40px) scale(1.2); }
          100% { transform: translate(30px,-80px) scale(0.85); }
        }
        @keyframes orb3 {
          0%   { transform: translate(0,    0)    scale(1); }
          50%  { transform: translate(60px,-50px) scale(1.1); }
          100% { transform: translate(-30px,70px) scale(0.95); }
        }
      `}</style>

      <CustomCursor />
      <GradientOrbs />
      <ParticleCanvas />

      {/* Conteúdo */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-10"
        >
          {/* Badge */}
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-primary">
                Motor de Aprendizado com IA
              </span>
            </div>
          </motion.div>

          {/* Título */}
          <motion.div variants={fadeUp} className="text-center">
            <h1 className="font-serif text-5xl font-bold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
              Aprenda{' '}
              <em
                className="italic text-primary"
                style={{ textShadow: '0 0 60px rgba(200,240,96,0.25)' }}
              >
                qualquer coisa
              </em>
              <br />
              <span className="text-foreground/90">de forma estruturada</span>
            </h1>
          </motion.div>

          {/* Subtítulo */}
          <motion.p
            variants={fadeUp}
            className="max-w-lg text-center text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Descreva o que você quer aprender. A IA divide o assunto em aulas
            progressivas, didáticas e com avaliação incluída.
          </motion.p>

          {/* Divider */}
          <motion.div variants={fadeIn} className="w-full">
            <AnimatedDivider />
          </motion.div>

          {/* Input */}
          <motion.div variants={fadeIn} className="w-full">
            <SearchInput externalPrompt={trendingPrompt} />
          </motion.div>

          {/* Stats rápidas */}
          <motion.div
            variants={fadeIn}
            className="flex items-center gap-6 text-center"
          >
            {[
              { value: '4–16', label: 'aulas por plano' },
              { value: '100%', label: 'baseado no conteúdo' },
              { value: 'Quiz', label: 'sem alucinações' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="font-serif text-xl font-bold text-primary">
                  {stat.value}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Divider 2 */}
          <motion.div variants={fadeIn} className="w-full">
            <AnimatedDivider />
          </motion.div>

          {/* Trending */}
          <motion.div variants={fadeIn} className="w-full">
            <TrendingList onSelect={(subject) => setTrendingPrompt(`Quero aprender sobre ${subject}`)} />
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}