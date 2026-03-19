'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { saveToken, removeToken, getToken } from '@/lib/auth'
import type { User } from '@/lib/types'

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
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    is_teacher = false
  ) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.register({ name, email, password, is_teacher })
      saveToken(res.data.access_token)
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    removeToken()
    router.push('/login')
  }

  return { login, register, logout, loading, error }
}