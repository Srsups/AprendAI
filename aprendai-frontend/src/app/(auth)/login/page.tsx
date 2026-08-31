'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button }      from '@/components/ui/button'
import { Input }       from '@/components/ui/input'
import { Loader2 }     from 'lucide-react'
import GoogleButton    from '@/components/auth/GoogleButton'
import { authApi }     from '@/lib/api'
import { saveToken }   from '@/lib/auth'

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') || '/dashboard'
  const urlError     = searchParams.get('error')
  const sessionExpired = searchParams.get('session') === 'expired'

  const googleErrorMessage = (() => {
    switch (urlError) {
      case 'google_config_missing':
        return 'Configuração do Google ausente no backend. Verifique o .env.'
      case 'google_invalid_client':
        return 'Client OAuth do Google inválido ou inexistente no Google Cloud Console.'
      case 'google_failed':
      case 'google_auth_failed':
      case 'google_user_failed':
        return 'Erro ao autenticar com o Google. Tente novamente.'
      case 'no_email':
        return 'Sua conta Google não retornou um e-mail válido.'
      default:
        return null
    }
  })()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error, setError] = useState<string | null>(
    sessionExpired
      ? 'Sua sessão expirou. Faça login novamente.'
      : urlError === 'google_failed'
        ? 'Erro ao autenticar com o Google. Tente novamente.'
        : null
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login({ email, password })
      saveToken(res.data.access_token)
      router.push(redirect)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="font-serif text-3xl text-primary">AprendAI</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre na sua conta</p>
        </div>

        {/* Google */}
        <GoogleButton label="Entrar com Google" />

        {/* Divisor */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email" placeholder="seu@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
          <div className="space-y-1">
            <Input
              type="password" placeholder="Senha"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Entrar'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}