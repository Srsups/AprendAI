'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { authApi } from '@/lib/api'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const token        = searchParams.get('token') ?? ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Link inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="space-y-4">
          <p className="text-destructive">Link inválido.</p>
          <Link href="/forgot-password">
            <Button variant="outline">Solicitar novo link</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
            <CheckCircle2 size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">Senha redefinida!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Redirecionando para o login em instantes…
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-primary">AprendAI</h1>
          <h2 className="mt-2 font-serif text-xl font-bold">Criar nova senha</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha uma senha forte com no mínimo 8 caracteres.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password" placeholder="Nova senha (mín. 8 caracteres)"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={8}
          />
          <Input
            type="password" placeholder="Confirmar nova senha"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            required minLength={8}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? <Loader2 size={15} className="animate-spin" />
              : 'Redefinir senha'
            }
          </Button>
        </form>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={12} /> Voltar ao login
        </Link>
      </div>
    </div>
  )
}