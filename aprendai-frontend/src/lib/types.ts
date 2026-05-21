// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  is_teacher: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  is_teacher: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export type DifficultyLevel = 'iniciante' | 'intermediario' | 'especialista'
export type ToneStyle = 'didatico_simples' | 'academico' | 'para_crianca' | 'tecnico_direto'

export interface PlanRequest {
  prompt: string
  num_lessons: number
  level: DifficultyLevel
  tone: ToneStyle
}

export interface LessonSummary {
  number: number
  title: string
  description: string
}

export interface PlanResponse {
  subject: string
  tags: string[]
  lessons: LessonSummary[]
  total_lessons: number
}

// ─── Saved Plans (com banco) ──────────────────────────────────────────────────

export interface LessonSummaryDB {
  id: string
  number: number
  title: string
  description: string
  generated: boolean
  viewed: boolean
  quiz_passed: boolean
}

export interface StudyPlanListItem {
  id: string
  subject: string
  num_lessons: number
  level: string
  current_lesson: number
  completed: boolean
  avg_rating: number | null
  created_at: string
}

export interface StudyPlanDetail {
  id: string
  subject: string
  original_prompt: string
  num_lessons: number
  level: string
  tone: string
  tags: string[]
  current_lesson: number
  completed: boolean
  avg_rating: number | null
  lessons: LessonSummaryDB[]
  created_at: string
}

// ─── Lesson Content ───────────────────────────────────────────────────────────

export interface LessonSection {
  heading: string
  body: string
}

export interface LessonContent {
  lesson_number: number
  title: string
  estimated_reading_minutes: number
  sections: LessonSection[]
  key_concepts: string[]
  reflection_question: string
}

// ─── Assessment ───────────────────────────────────────────────────────────────

export interface QuizOption {
  letter: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface QuizQuestion {
  number: number
  question: string
  options: QuizOption[]
  correct_letter: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export interface QuizResponse {
  total_questions: number
  questions: QuizQuestion[]
}

export interface Flashcard {
  front: string
  back: string
}

export interface FlashcardsResponse {
  total_cards: number
  cards: Flashcard[]
}

// ─── Trending ─────────────────────────────────────────────────────────────────

export interface TrendingItem {
  subject: string
  total_generations: number
  avg_rating: number | null
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export interface CommentAuthor {
  id  : string
  name: string
}

export interface Comment {
  id        : string
  content   : string
  created_at: string
  user      : CommentAuthor
  is_own    : boolean
}

// ─── Usage ────────────────────────────────────────────────────────────────────

export interface UsageInfo {
  subscription_plan : string
  plan_label        : string
  plan_description  : string
  plans_this_month  : number
  plans_limit       : number | null
  is_within_limit   : boolean
  remaining         : number | null
  max_lessons       : number
  has_flashcards    : boolean
  has_export_pptx   : boolean
  has_methodology   : boolean
}