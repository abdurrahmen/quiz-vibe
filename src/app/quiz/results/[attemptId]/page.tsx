import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ResultsClient from './ResultsClient'
import ResultsActions from './ResultsActions'

export default async function ResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .select('*, category:categories(*)')
    .eq('id', attemptId)
    .single()

  if (error || !attempt) {
    notFound()
  }

  // Format time taken
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Determine feedback message
  let feedback = { text: '', emoji: '' }
  if (attempt.score >= 90) feedback = { text: 'Outstanding Performance!', emoji: '🏆' }
  else if (attempt.score >= 70) feedback = { text: 'Great Job!', emoji: '🌟' }
  else if (attempt.score >= 50) feedback = { text: 'Good Effort!', emoji: '👍' }
  else feedback = { text: 'Keep Practicing!', emoji: '📚' }

  return (
    <div className="bg-background text-on-background antialiased flex flex-col min-h-screen">
      {/* TopNavBar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-ambient flex justify-between items-center px-6 py-4 w-full">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-gradient">
          QuizMaster Pro
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="font-medium text-slate-600 hover:text-primary transition-colors">Home</Link>
          <ResultsActions score={attempt.score} categoryName={attempt.category?.name || 'Mixed'} variant="icon" />
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 md:p-12 flex flex-col">
        {/* Top Actions / Breadcrumbs Context */}
        <div className="mb-10 text-center animate-fade-in">
          <p className="text-on-surface-variant font-medium mb-1">
            {attempt.category?.name || 'Mixed Categories'} • {attempt.difficulty}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface">Quiz Results</h1>
        </div>

        {/* Bento Grid: Hero & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12 animate-scale-in">
          {/* Hero Score Card */}
          <div className="md:col-span-7 bg-surface-container-lowest rounded-2xl p-8 shadow-ambient-lg flex flex-col items-center justify-center relative overflow-hidden group">
            {/* CSS Confetti Effect mapping via Tailwind global css */}
            {attempt.score >= 70 && (
              <>
                <div className="confetti-piece bg-tertiary left-1/4 top-10"></div>
                <div className="confetti-piece bg-secondary right-1/4 top-20"></div>
                <div className="confetti-piece bg-primary left-1/3 bottom-10"></div>
                <div className="confetti-piece bg-primary-container right-1/3 top-1/4"></div>
              </>
            )}
            
            <div className="relative w-48 h-48 mb-6 transition-transform duration-500 group-hover:scale-105">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-surface-dim" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                {/* Progress Circle */}
                <path 
                  className={attempt.score >= 70 ? "text-primary" : attempt.score >= 50 ? "text-tertiary" : "text-error"} 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeDasharray={`${attempt.score}, 100`} 
                  strokeWidth="3"
                />
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold text-on-surface">{attempt.score}<span className="text-2xl">%</span></span>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-on-surface flex items-center gap-3">
              {feedback.text} {feedback.emoji}
            </h2>
            <p className="text-on-surface-variant mt-3 text-center max-w-sm">
              {attempt.username}, you completed the quiz with {attempt.correct_count} correct answers out of {attempt.total_questions}.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex flex-col justify-between hover:shadow-ambient-lg transition-shadow">
              <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="font-semibold text-sm tracking-wide">Correct</span>
              </div>
              <div className="text-5xl font-extrabold text-primary">{attempt.correct_count}</div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex flex-col justify-between hover:shadow-ambient-lg transition-shadow">
              <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                <span className="material-symbols-outlined text-error">cancel</span>
                <span className="font-semibold text-sm tracking-wide">Wrong</span>
              </div>
              <div className="text-5xl font-extrabold text-error">{attempt.wrong_count}</div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex flex-col justify-between hover:shadow-ambient-lg transition-shadow">
              <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                <span className="material-symbols-outlined text-outline">help</span>
                <span className="font-semibold text-sm tracking-wide">Unanswered</span>
              </div>
              <div className="text-5xl font-extrabold text-outline">{attempt.unanswered_count}</div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex flex-col justify-between hover:shadow-ambient-lg transition-shadow">
              <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                <span className="material-symbols-outlined text-tertiary">timer</span>
                <span className="font-semibold text-sm tracking-wide">Time</span>
              </div>
              <div className="text-4xl font-extrabold text-on-surface">{formatTime(attempt.time_taken_seconds)}</div>
            </div>
          </div>
        </div>

        {/* Question Review Section (Interactive Client Component) */}
        <ResultsClient answers={attempt.answers || []} />

        {/* Bottom Actions */}
        <ResultsActions score={attempt.score} categoryName={attempt.category?.name || 'Mixed'} />
      </main>
    </div>
  )
}
