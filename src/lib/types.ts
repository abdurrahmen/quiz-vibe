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

export interface Duel {
  id: string
  room_code: string
  creator_name: string
  opponent_name: string | null
  category_id: string | null
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  mode: 'standard' | 'blitz' | 'category_wars'
  question_ids: string[]
  status: 'waiting' | 'playing' | 'finished'
  creator_score: number | null
  opponent_score: number | null
  creator_time_ms: number | null
  opponent_time_ms: number | null
  creator_blitz_score: number
  opponent_blitz_score: number
  creator_category_id: string | null
  opponent_category_id: string | null
  creator_wars_ready: boolean
  opponent_wars_ready: boolean
  winner_name: string | null
  created_at: string
  started_at: string | null
  finished_at: string | null
}

export interface DuelProgress {
  answered: number
  correct: number
}

export interface QuizRequest {
  id: string
  username: string
  topic: string
  category_id: string | null
  category?: Category
  difficulty: string
  question_type: string
  question_count: number
  message: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
}
