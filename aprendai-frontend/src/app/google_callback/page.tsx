'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { saveToken } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error || !token) {
      router.push('/login?error=google_failed')
      return
    }

    saveToken(token)
    router.push('/dashboard')
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center gap-3">
      <Loader2 size={20} className="animate-spin text-primary" />
      <p className="font-mono text-sm text-muted-foreground">
        Finalizando login com Google…
      </p>
    </div>
  )
}