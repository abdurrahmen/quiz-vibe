'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Question, DuelProgress } from '@/lib/types'
import OpponentProgressBar from './OpponentProgressBar'

interface DuelBattleProps {
  questions: Question[]
  myUsername: string
  opponentName: string
  myProgress: DuelProgress
  opponentProgress: DuelProgress
  onAnswer: (questionIndex: number, selectedOptionIndex: number, isCorrect: boolean) => void
  onFinished: () => void
}

export default function DuelBattle({
  questions,
  myUsername,
  opponentName,
  myProgress,
  opponentProgress,
  onAnswer,
  onFinished,
}: DuelBattleProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [startTime] = useState(Date.now())
  const [direction, setDirection] = useState(1)

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => setElapsedMs(Date.now() - startTime), 100)
    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleSelect = useCallback((optionIndex: number) => {
    if (answered) return
    setSelectedOption(optionIndex)
    setAnswered(true)

    const q = questions[currentIndex]
    const isCorrect = q.correct_answers.includes(optionIndex)

    onAnswer(currentIndex, optionIndex, isCorrect)

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setDirection(1)
        setCurrentIndex(i => i + 1)
        setSelectedOption(null)
        setAnswered(false)
      } else {
        onFinished()
      }
    }, 1200)
  }, [answered, currentIndex, questions, onAnswer, onFinished])

  const q = questions[currentIndex]
  if (!q) return null

  const getOptionClass = (idx: number) => {
    if (!answered) {
      return 'border-surface-variant bg-white text-on-surface hover:border-primary hover:bg-primary/5 cursor-pointer'
    }
    if (q.correct_answers.includes(idx)) {
      return 'border-green-500 bg-green-50 text-green-800 font-bold'
    }
    if (idx === selectedOption && !q.correct_answers.includes(idx)) {
      return 'border-error bg-error-container/20 text-error'
    }
    return 'border-surface-variant bg-white/50 text-on-surface-variant opacity-60'
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col">
      {/* Live Progress Bars */}
      <OpponentProgressBar
        myUsername={myUsername}
        opponentName={opponentName}
        myProgress={myProgress}
        opponentProgress={opponentProgress}
        totalQuestions={questions.length}
      />

      {/* Timer bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm font-bold text-outline">
          <span className="material-symbols-outlined text-base">quiz</span>
          Question {currentIndex + 1} of {questions.length}
        </div>
        <div className="flex items-center gap-1.5 font-mono font-bold text-primary text-sm">
          <span className="material-symbols-outlined text-base">timer</span>
          {formatTime(elapsedMs)}
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-8">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i < currentIndex ? 'w-6 bg-primary' :
                  i === currentIndex ? 'w-8 bg-primary' :
                    'w-3 bg-surface-container-high'
                  }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Question Card */}
              <div className="bg-white rounded-2xl shadow-ambient border border-slate-100 p-6 md:p-8 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-tertiary flex items-center justify-center text-white font-black text-sm shrink-0">
                    {currentIndex + 1}
                  </div>
                  <p className="text-lg md:text-xl font-bold text-on-surface leading-relaxed">
                    {q.question_text}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {q.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={!answered ? { scale: 1.01 } : {}}
                    whileTap={!answered ? { scale: 0.99 } : {}}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${getOptionClass(idx)}`}
                  >
                    <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium">{option}</span>
                    {answered && q.correct_answers.includes(idx) && (
                      <span className="ml-auto material-symbols-outlined text-green-600">check_circle</span>
                    )}
                    {answered && idx === selectedOption && !q.correct_answers.includes(idx) && (
                      <span className="ml-auto material-symbols-outlined text-error">cancel</span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {answered && q.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-on-surface"
                  >
                    <span className="font-bold text-primary flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-base">lightbulb</span>
                      Explanation
                    </span>
                    {q.explanation}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
