'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'
import { authApi } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch {
      setError('Erro ao processar a solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
            <MailCheck size={28} className="text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">Email enviado!</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Se o endereço <strong className="text-foreground">{email}</strong> estiver
              cadastrado, você receberá as instruções em breve.
              Verifique sua caixa de spam também.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={14} /> Voltar ao login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-primary">AprendAI</h1>
          <h2 className="mt-2 font-serif text-xl font-bold">Esqueceu sua senha?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Digite seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email" placeholder="seu@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? <Loader2 size={15} className="animate-spin" />
              : 'Enviar link de recuperação'
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