/* eslint-disable react/no-unescaped-entities, react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { QuizAttempt, Question } from '@/lib/types'
import { Link } from 'lucide-react'

export default function QuizSession({
  attempt,
  questions
}: {
  attempt: QuizAttempt,
  questions: Question[]
}) {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [timeRemaining, setTimeRemaining] = useState(questions.length * 60) // 1 min per question
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQuestion = questions[currentIdx]

  useEffect(() => {
    if (attempt.completed_at) {
      router.push(`/quiz/results/${attempt.id}`)
    }
  }, [attempt, router])

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // eslint-disable-next-line
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleOptionSelect = (optionIdx: number) => {
    const qId = currentQuestion.id
    const currentSelection = answers[qId] || []

    if (currentQuestion.type === 'SCQ' || currentQuestion.type === 'TF') {
      setAnswers({ ...answers, [qId]: [optionIdx] })
    } else {
      // MCQ - toggle selection
      if (currentSelection.includes(optionIdx)) {
        setAnswers({
          ...answers,
          [qId]: currentSelection.filter(i => i !== optionIdx)
        })
      } else {
        setAnswers({
          ...answers,
          [qId]: [...currentSelection, optionIdx]
        })
      }
    }
  }

  const toggleFlag = () => {
    setFlagged({ ...flagged, [currentQuestion.id]: !flagged[currentQuestion.id] })
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Calculate results
      let score = 0
      let correctCount = 0
      let wrongCount = 0
      let unansweredCount = 0

      const processedAnswers = questions.map(q => {
        const selected = answers[q.id] || []
        const isCorrect = selected.length > 0 &&
          selected.length === q.correct_answers.length &&
          selected.every(s => q.correct_answers.includes(s))

        if (selected.length === 0) {
          unansweredCount++
        } else if (isCorrect) {
          correctCount++
          score += q.points
        } else {
          wrongCount++
        }

        return {
          question_id: q.id,
          question_text: q.question_text,
          selected_answers: selected,
          correct_answers: q.correct_answers,
          is_correct: isCorrect,
          options: q.options,
          explanation: q.explanation
        }
      })

      // Max score possible
      const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
      const scorePercentage = Math.round((score / maxScore) * 100)

      const timeTaken = (questions.length * 60) - timeRemaining

      await supabase
        .from('quiz_attempts')
        .update({
          score: scorePercentage,
          total_questions: questions.length,
          correct_count: correctCount,
          wrong_count: wrongCount,
          unanswered_count: unansweredCount,
          time_taken_seconds: timeTaken,
          answers: processedAnswers,
          completed_at: new Date().toISOString()
        })
        .eq('id', attempt.id)

      router.push(`/quiz/results/${attempt.id}`)
    } catch (err) {
      console.error('Failed to submit quiz:', err)
      alert('Failed to submit quiz. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-sans min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-white sticky top-0 z-50 shadow-sm flex flex-col w-full">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-on-background font-black text-2xl tracking-tighter text-gradient">QuizMaster Pro</Link>
            <div className="h-6 w-px bg-surface-variant hidden sm:block"></div>
            <span className="text-primary font-bold text-sm bg-primary-fixed px-3 py-1 rounded-full hidden sm:block">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 font-bold text-xl px-4 py-1.5 rounded-xl transition-colors ${timeRemaining < 60 ? 'bg-error-container text-error animate-pulse' : 'bg-secondary-fixed text-secondary'}`}>
              <span className="material-symbols-outlined text-[20px]">timer</span>
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={toggleFlag}
                className={`transition-all duration-200 p-2 rounded-full hover:bg-surface-container ${flagged[currentQuestion.id] ? 'text-secondary bg-secondary-fixed' : 'text-outline hover:text-primary'}`}
                title="Flag for review"
              >
                <span className={`material-symbols-outlined ${flagged[currentQuestion.id] ? 'filled' : ''}`}>flag</span>
              </button>
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-surface-container-highest">
          <div
            className="h-full bg-linear-to-r from-primary to-tertiary transition-all duration-500 ease-out"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row gap-8 p-4 md:p-8 max-w-[1440px] mx-auto w-full">
        {/* Question Canvas */}
        <div key={currentIdx} className="flex-1 flex flex-col gap-8 animate-slide-in-right">
          {/* Question Header & Badges */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-surface-container-high text-on-surface-variant text-sm font-semibold px-3 py-1 rounded-full">#{currentIdx + 1}</span>
              <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-sm font-semibold px-3 py-1 rounded-full border border-secondary capitalize">
                {currentQuestion.difficulty}
              </span>
              <span className="bg-primary-fixed text-on-primary-fixed-variant text-sm font-semibold px-3 py-1 rounded-full">
                {attempt.category?.name || 'Mixed Category'}
              </span>
              {currentQuestion.type === 'MCQ' && (
                <span className="bg-tertiary-fixed text-tertiary text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_box</span>
                  Multiple Answers
                </span>
              )}
            </div>
            <h2 className="text-3xl font-bold text-on-background leading-tight">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="flex flex-col gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = (answers[currentQuestion.id] || []).includes(idx)

              return (
                <label
                  key={idx}
                  className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${isSelected
                    ? 'bg-surface-container-low border-primary shadow-primary transform -translate-y-1'
                    : 'bg-surface-container-lowest border-surface-container-highest shadow-ambient hover:shadow-ambient-lg hover:-translate-y-1'
                    }`}
                >
                  <input
                    type={currentQuestion.type === 'MCQ' ? 'checkbox' : 'radio'}
                    name={`question-${currentQuestion.id}`}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(idx)}
                    className={`w-6 h-6 text-primary focus:ring-primary ${currentQuestion.type === 'MCQ' ? 'rounded' : ''} ${isSelected ? 'border-primary' : 'border-outline'}`}
                  />
                  <span className="text-lg text-on-surface flex-1">{option}</span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary filled">check_circle</span>
                  )}
                </label>
              )
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-surface-container-highest">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-6 py-3 bg-surface-container-highest text-on-surface-variant rounded-xl font-semibold hover:bg-surface-variant transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Previous
            </button>
            <button
              onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
              disabled={currentIdx === questions.length - 1}
              className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-primary to-tertiary text-white rounded-xl font-semibold shadow-primary hover:shadow-primary-lg transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Next
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Sidebar Panel (Question Grid) */}
        <aside className="w-full lg:w-80 flex flex-col gap-8">
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex flex-col gap-4">
            <h3 className="text-xl font-bold text-on-background">Question Map</h3>
            <p className="text-xs text-outline mb-2">Jump to any question. Flagged questions are marked in red.</p>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx
                const isAnswered = (answers[q.id] || []).length > 0
                const isFlagged = flagged[q.id]

                let btnClass = "aspect-square flex items-center justify-center rounded-lg font-semibold text-sm transition-colors "

                if (isCurrent) {
                  btnClass += "bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest"
                } else if (isFlagged) {
                  btnClass += "bg-secondary-fixed text-on-secondary-fixed-variant border-2 border-secondary"
                } else if (isAnswered) {
                  btnClass += "bg-primary-fixed text-on-primary-fixed"
                } else {
                  btnClass += "bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant"
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={btnClass}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 border-t border-surface-container-highest pt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-secondary text-white rounded-xl font-bold shadow-md hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <>Submit Exam</>
                )}
              </button>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col items-center text-center gap-4 border border-surface-container-highest">
            <span className="material-symbols-outlined text-5xl text-primary filled">school</span>
            <p className="text-on-surface-variant font-medium">You're doing great! Keep up the focus.</p>
          </div>
        </aside>
      </main>
    </div>
  )
}
