'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import type { Duel } from '@/lib/types'

interface DuelResultsProps {
  duel: Duel
  myRole: 'creator' | 'opponent'
  myUsername: string
  myScore: number
  myTimeMs: number
  opponentScore: number | null
  opponentTimeMs: number | null
  waitingForOpponent: boolean
}

export default function DuelResults({
  duel,
  myRole,
  myUsername,
  myScore,
  myTimeMs,
  opponentScore,
  opponentTimeMs,
  waitingForOpponent,
}: DuelResultsProps) {
  const opponentName = myRole === 'creator' ? duel.opponent_name : duel.creator_name
  const totalQuestions = duel.question_ids.length

  const formatTime = (ms: number) => {
    const s = (ms / 1000).toFixed(1)
    return `${s}s`
  }

  const winner = duel.winner_name

  if (waitingForOpponent) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary/10 to-tertiary/10 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-ambient-lg p-10 text-center max-w-md w-full"
        >
          <div className="text-6xl mb-6">🏁</div>
          <h2 className="text-2xl font-extrabold text-on-surface mb-2">You finished!</h2>
          <p className="text-on-surface-variant mb-8">
            Your score: <span className="font-black text-primary">{myScore}/{totalQuestions}</span>
            <br />
            <span className="text-sm">({formatTime(myTimeMs)})</span>
          </p>
          <div className="flex items-center justify-center gap-3 text-outline">
            <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-medium">Waiting for {opponentName} to finish...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const didIWin = winner === myUsername
  const isTie = myScore === opponentScore && winner !== myUsername && winner !== opponentName

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 to-tertiary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Winner Banner */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-7xl mb-4"
          >
            {isTie ? '🤝' : didIWin ? '🏆' : '😔'}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className={`text-4xl font-black mb-2 ${
              isTie ? 'text-secondary' : didIWin ? 'text-primary' : 'text-on-surface'
            }`}
          >
            {isTie ? "It's a Tie!" : didIWin ? 'You Win! 🎉' : `${winner} Wins!`}
          </motion.h1>
          {!isTie && (
            <p className="text-on-surface-variant font-medium">
              {didIWin ? 'Outstanding performance!' : 'Better luck next time!'}
            </p>
          )}
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-ambient-lg border border-slate-100 overflow-hidden mb-6"
        >
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            {/* Me */}
            <div className={`p-6 text-center ${didIWin ? 'bg-primary/5' : ''}`}>
              {didIWin && (
                <div className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-2 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[12px]">star</span>
                  Winner
                </div>
              )}
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm mx-auto mb-3">
                {myUsername.slice(0, 2).toUpperCase()}
              </div>
              <p className="font-bold text-on-surface text-sm mb-3">{myUsername} <span className="text-outline">(You)</span></p>
              <div className="text-5xl font-black text-primary mb-1">{myScore}</div>
              <div className="text-sm text-outline">/ {totalQuestions} correct</div>
              <div className="mt-3 text-sm text-on-surface-variant font-medium">{formatTime(myTimeMs)}</div>
              <div className="mt-2 flex justify-center gap-3 text-xs text-outline">
                <span className="text-green-600 font-bold">✓ {myScore} correct</span>
                <span className="text-error font-bold">✗ {totalQuestions - myScore} wrong</span>
              </div>
            </div>

            {/* Opponent */}
            <div className={`p-6 text-center ${!didIWin && !isTie ? 'bg-secondary/5' : ''}`}>
              {!didIWin && !isTie && (
                <div className="inline-flex items-center gap-1 bg-secondary text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-2 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[12px]">star</span>
                  Winner
                </div>
              )}
              <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-black text-sm mx-auto mb-3">
                {(opponentName || 'OP').slice(0, 2).toUpperCase()}
              </div>
              <p className="font-bold text-on-surface text-sm mb-3">{opponentName}</p>
              <div className="text-5xl font-black text-secondary mb-1">{opponentScore ?? '?'}</div>
              <div className="text-sm text-outline">/ {totalQuestions} correct</div>
              <div className="mt-3 text-sm text-on-surface-variant font-medium">
                {opponentTimeMs ? formatTime(opponentTimeMs) : '—'}
              </div>
              <div className="mt-2 flex justify-center gap-3 text-xs text-outline">
                <span className="text-green-600 font-bold">✓ {opponentScore ?? 0} correct</span>
                <span className="text-error font-bold">✗ {totalQuestions - (opponentScore ?? 0)} wrong</span>
              </div>
            </div>
          </div>

          {/* Tiebreaker note */}
          {!isTie && myScore === (opponentScore ?? -1) && (
            <div className="bg-surface-container-low p-3 text-center text-xs text-outline font-medium border-t border-slate-100">
              🏁 Tiebreaker: decided by completion speed
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/duel"
            className="flex-1 bg-linear-to-r from-primary to-tertiary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined">replay</span>
            Play Again
          </Link>
          <Link
            href="/"
            className="flex-1 bg-white border-2 border-surface-variant text-on-surface font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined">home</span>
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
