'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button }    from '@/components/ui/button'
import { Input }     from '@/components/ui/input'
import { Loader2 }   from 'lucide-react'
import GoogleButton  from '@/components/auth/GoogleButton'
import { authApi }   from '@/lib/api'
import { saveToken } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()

  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [isTeacher, setIsTeacher] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.register({ name, email, password, is_teacher: isTeacher })
      saveToken(res.data.access_token)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar conta.')
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
          <p className="mt-1 text-sm text-muted-foreground">Crie sua conta gratuitamente</p>
        </div>

        {/* Google */}
        <GoogleButton label="Cadastrar com Google" />

        {/* Divisor */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Seu nome"
            value={name} onChange={(e) => setName(e.target.value)} required
          />
          <Input
            type="email" placeholder="seu@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
          <Input
            type="password" placeholder="Senha (mín. 8 caracteres)"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={8}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={isTeacher}
              onChange={(e) => setIsTeacher(e.target.checked)}
              className="rounded border-border"
            />
            Sou professor
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}