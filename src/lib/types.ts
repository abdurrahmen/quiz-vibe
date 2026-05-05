export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'SCQ' | 'MCQ' | 'TF'

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  created_at: string
  question_count?: number
}

export interface Question {
  id: string
  category_id: string
  category?: Category
  question_text: string
  type: QuestionType
  difficulty: Difficulty
  options: string[]
  correct_answers: number[] // indices into options array
  explanation: string | null
  points: number
  created_at: string
}

export interface QuizAttempt {
  id: string
  username: string
  category_id: string | null
  category?: Category
  difficulty: Difficulty | 'all'
  score: number
  total_questions: number
  correct_count: number
  wrong_count: number
  unanswered_count: number
  time_taken_seconds: number
  answers: AttemptAnswer[]
  started_at: string
  completed_at: string
  created_at: string
}

export interface AttemptAnswer {
  question_id: string
  question_text: string
  selected_answers: number[]
  correct_answers: number[]
  is_correct: boolean
  options: string[]
  explanation: string | null
}

export interface DashboardStats {
  total_questions: number
  total_categories: number
  total_attempts: number
  avg_score: number
}
