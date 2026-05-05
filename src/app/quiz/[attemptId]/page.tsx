/* eslint-disable react/no-unescaped-entities, @next/next/no-html-link-for-pages */
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import QuizSession from './QuizSession'

export default async function QuizPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  // 1. Fetch the attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select('*, category:categories(*)')
    .eq('id', attemptId)
    .single()

  if (attemptError || !attempt) {
    notFound()
  }

  // If already completed, don't let them take it again
  if (attempt.completed_at) {
    // We would redirect to results, but for now we'll just handle it in the client
  }

  // 2. Fetch questions matching the attempt criteria
  let query = supabase.from('questions').select('*')
  
  if (attempt.category_id) {
    query = query.eq('category_id', attempt.category_id)
  }
  
  if (attempt.difficulty !== 'all') {
    query = query.eq('difficulty', attempt.difficulty)
  }

  const { data: questions, error: questionsError } = await query
  
  if (questionsError || !questions || questions.length === 0) {
    // Handle no questions case
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="bg-surface rounded-2xl p-8 shadow-ambient-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">No Questions Found</h2>
          <p className="text-on-surface-variant mb-6">We couldn't find any questions matching your selected category and difficulty.</p>
          <a href="/" className="inline-flex bg-primary text-white px-6 py-3 rounded-xl font-semibold">Return Home</a>
        </div>
      </div>
    )
  }

  // For a real app we'd shuffle and limit questions. 
  // For this demo, we'll take up to 20 questions and shuffle them.
  // eslint-disable-next-line react-hooks/purity
  const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random()).slice(0, 20)

  return <QuizSession attempt={attempt} questions={shuffledQuestions} />
}
