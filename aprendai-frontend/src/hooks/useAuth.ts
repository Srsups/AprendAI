'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { saveToken, removeToken } from '@/lib/auth'

function getApiErrorMessage(err: any, fallback: string) {
  const detail = err?.response?.data?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0]
    if (typeof first === 'string') {
      return first
    }
    if (first?.msg) {
      return first.msg
    }
  }

  if (typeof err?.message === 'string' && err.message) {
    if (err.message === 'Network Error') {
      return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
    }
  }

  return fallback
}

export function useAuth() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.login({ email, password })
      saveToken(res.data.access_token)
      router.push('/dashboard')          // ← era '/'
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Erro ao fazer login.'))
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    name: string, email: string, password: string, is_teacher = false
  ) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.register({ name, email, password, is_teacher })
      saveToken(res.data.access_token)
      router.push('/dashboard')          // ← era '/'
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Erro ao criar conta.'))
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    removeToken()
    router.push('/')                     // ← vai para landing após sair
  }

  return { login, register, logout, loading, error }
}