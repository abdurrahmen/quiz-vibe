'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Question, DuelProgress } from '@/lib/types'
import { fetchBlitzQuestions } from '@/app/duel/actions'
import OpponentProgressBar from './OpponentProgressBar'

const BLITZ_DURATION = 60 // seconds

interface BlitzBattleProps {
  duel: { id: string; category_id: string | null; difficulty: string }
  myUsername: string
  opponentName: string
  opponentProgress: DuelProgress
  onAnswer: (questionIndex: number, isCorrect: boolean) => void
  onFinished: (score: number, timeMs: number) => void
}

export default function BlitzBattle({
  duel,
  myUsername,
  opponentName,
  opponentProgress,
  onAnswer,
  onFinished,
}: BlitzBattleProps) {
  const [questionPool, setQuestionPool] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(BLITZ_DURATION)
  const [isLoading, setIsLoading] = useState(true)
  const [flashCorrect, setFlashCorrect] = useState<boolean | null>(null)
  const [myProgress, setMyProgress] = useState<DuelProgress>({ answered: 0, correct: 0 })
  const usedIdsRef = useRef<Set<string>>(new Set())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const finishedRef = useRef(false)
  const startTimeRef = useRef(Date.now())
  const scoreRef = useRef(0)

  // Keep scoreRef in sync for use in callbacks
  useEffect(() => { scoreRef.current = score }, [score])

  // ── Load initial question batch ───────────────────────────────────
  const loadMoreQuestions = useCallback(async () => {
    const excludeIds = Array.from(usedIdsRef.current)
    const result = await fetchBlitzQuestions(duel.category_id, duel.difficulty, excludeIds)
    if (result.questions && result.questions.length > 0) {
      result.questions.forEach(q => usedIdsRef.current.add(q.id))
      setQuestionPool(prev => [...prev, ...result.questions as Question[]])
    }
    setIsLoading(false)
  }, [duel.category_id, duel.difficulty])

  useEffect(() => {
    loadMoreQuestions()
  }, [loadMoreQuestions])

  // Pre-load more when running low
  useEffect(() => {
    if (questionPool.length > 0 && questionPool.length - currentIdx < 8) {
      loadMoreQuestions()
    }
  }, [currentIdx, questionPool.length, loadMoreQuestions])

  // ── Countdown Timer ───────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return
    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          if (!finishedRef.current) {
            finishedRef.current = true
            const elapsed = Date.now() - startTimeRef.current
            onFinished(scoreRef.current, elapsed)
          }
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isLoading, onFinished])

  // ── Answer Selection ──────────────────────────────────────────────
  const handleSelect = useCallback((optionIndex: number) => {
    if (answered || timeLeft === 0) return
    const q = questionPool[currentIdx]
    if (!q) return

    const isCorrect = q.correct_answers.includes(optionIndex)
    setSelectedOption(optionIndex)
    setAnswered(true)
    setFlashCorrect(isCorrect)

    if (isCorrect) {
      setScore(s => s + 1)
      scoreRef.current += 1
    }

    setMyProgress(prev => ({
      answered: prev.answered + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }))

    onAnswer(currentIdx, isCorrect)

    // Fast advance — 600ms feedback then next question
    setTimeout(() => {
      setCurrentIdx(i => i + 1)
      setSelectedOption(null)
      setAnswered(false)
      setFlashCorrect(null)
    }, 600)
  }, [answered, timeLeft, questionPool, currentIdx, onAnswer])

  const q = questionPool[currentIdx]
  const pct = (timeLeft / BLITZ_DURATION) * 100
  const timerColor = timeLeft > 30 ? '#22c55e' : timeLeft > 15 ? '#f97316' : '#ef4444'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-on-surface font-bold">Loading Blitz Questions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Opponent Progress */}
      <OpponentProgressBar
        myUsername={myUsername}
        opponentName={opponentName}
        myProgress={myProgress}
        opponentProgress={opponentProgress}
        totalQuestions={BLITZ_DURATION} // not used in blitz label but required
      />

      {/* Blitz Header */}
      <div className={`px-4 py-3 border-b border-slate-100 flex justify-between items-center transition-colors ${
        flashCorrect === true ? 'bg-green-50' : flashCorrect === false ? 'bg-red-50' : 'bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-yellow-500 text-base">bolt</span>
            <span className="font-black text-sm text-on-surface uppercase tracking-wide">Blitz</span>
          </div>
          <div className="text-sm font-medium text-outline">
            Q#{currentIdx + 1}
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          <div className="text-center">
            <div className="text-2xl font-black text-primary leading-none">{score}</div>
            <div className="text-[9px] uppercase tracking-widest text-outline font-bold">Score</div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <div
            className="text-2xl font-black tabular-nums leading-none transition-colors"
            style={{ color: timerColor }}
          >
            {String(timeLeft).padStart(2, '0')}s
          </div>
          {timeLeft <= 10 && (
            <span className="material-symbols-outlined text-error animate-pulse">timer</span>
          )}
        </div>
      </div>

      {/* Timer Bar */}
      <div className="h-1.5 bg-surface-container-high">
        <motion.div
          className="h-full transition-colors duration-1000"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'linear' }}
          style={{ backgroundColor: timerColor }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          {q ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                {/* Question card */}
                <div className="bg-white rounded-2xl shadow-ambient border border-slate-100 p-6 mb-5">
                  <p className="text-lg md:text-xl font-bold text-on-surface leading-relaxed">
                    {q.question_text}
                  </p>
                </div>

                {/* Options — larger tap targets for speed */}
                <div className="grid grid-cols-1 gap-3">
                  {q.options.map((option, idx) => {
                    let cls = 'bg-white border-surface-variant text-on-surface hover:border-primary hover:bg-primary/5 cursor-pointer active:scale-95'
                    if (answered) {
                      if (q.correct_answers.includes(idx)) cls = 'bg-green-500 border-green-500 text-white'
                      else if (idx === selectedOption) cls = 'bg-red-500 border-red-500 text-white'
                      else cls = 'bg-white/50 border-surface-variant text-on-surface-variant opacity-40'
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-100 flex items-center gap-4 ${cls}`}
                      >
                        <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-black shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-semibold">{option}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center text-outline animate-pulse font-medium">Loading next question...</div>
          )}
        </div>
      </div>

      {/* Time's up overlay */}
      <AnimatePresence>
        {timeLeft === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white rounded-3xl p-10 text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">⏱️</div>
              <h2 className="text-3xl font-black text-on-surface mb-2">Time's Up!</h2>
              <p className="text-on-surface-variant">Final score: <span className="font-black text-primary text-2xl">{score}</span></p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
