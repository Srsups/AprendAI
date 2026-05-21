import axios from 'axios'
import { getToken, removeToken } from '@/lib/auth'

function resolveApiBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
  if (envUrl) {
    return envUrl
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location

    // Dev Tunnels: front on 3000, backend on 8000.
    if (hostname.endsWith('.devtunnels.ms')) {
      const backendHost = hostname.replace(/-\d+\./, '-8000.')
      return `https://${backendHost}`
    }
  }

  return 'http://localhost:8000'
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o token em cada requisição
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redireciona para login se token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string; is_teacher: boolean }) =>
    api.post('/api/v1/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/api/v1/auth/login', data),

  me: () => api.get('/api/v1/auth/me'),
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export const plansApi = {
  generate: (data: {
    prompt: string
    num_lessons: number
    level: string
    tone: string
  }) => api.post('/api/v1/plan/generate', data),

  save: (data: {
    subject: string
    original_prompt: string
    num_lessons: number
    level: string
    tone: string
    tags: string[]
    lessons: { number: number; title: string; description: string }[]
  }) => api.post('/api/v1/plans', data),

  list: () => api.get('/api/v1/plans'),

  get: (id: string) => api.get(`/api/v1/plans/${id}`),

  updateProgress: (id: string, current_lesson: number, completed: boolean) =>
    api.patch(`/api/v1/plans/${id}/progress`, { current_lesson, completed }),

  delete: (id: string) => api.delete(`/api/v1/plans/${id}`),

  trending: () => api.get('/api/v1/plans/trending/list'),
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export const lessonsApi = {
  generate: (planId: string, lessonNumber: number) =>
    api.post(`/api/v1/plans/${planId}/lessons/${lessonNumber}/generate`),
}

// ─── Assessment ───────────────────────────────────────────────────────────────

export const assessmentApi = {
  generateQuiz: (lessonContent: string, numQuestions = 5) =>
    api.post('/api/v1/assessment/quiz', {
      lesson_content: lessonContent,
      num_questions: numQuestions,
    }),

  generateFlashcards: (lessonContent: string, numCards = 10) =>
    api.post('/api/v1/assessment/flashcards', {
      lesson_content: lessonContent,
      num_cards: numCards,
    }),

  saveAttempt: (
    planId: string,
    lessonNumber: number,
    data: { score: number; total: number; answers: object[] }
  ) => api.post(`/api/v1/plans/${planId}/lessons/${lessonNumber}/attempts`, data),

  ratePlan: (planId: string, rating: number) =>
    api.post(`/api/v1/plans/${planId}/rating`, { rating }),
}

export default api

export const commentsApi = {
  list: (planId: string, lessonNumber: number) =>
    api.get(`/api/v1/plans/${planId}/lessons/${lessonNumber}/comments`),

  create: (planId: string, lessonNumber: number, content: string) =>
    api.post(`/api/v1/plans/${planId}/lessons/${lessonNumber}/comments`, { content }),

  delete: (planId: string, lessonNumber: number, commentId: string) =>
    api.delete(`/api/v1/plans/${planId}/lessons/${lessonNumber}/comments/${commentId}`),
}

export const usageApi = {
  get: () => api.get('/api/v1/usage'),
}