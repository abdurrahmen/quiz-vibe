'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import type { Duel } from '@/lib/types'

interface BlitzResultsProps {
  duel: Duel
  myRole: 'creator' | 'opponent'
  myUsername: string
  myScore: number
  opponentScore: number | null
  waitingForOpponent: boolean
}

export default function BlitzResults({
  duel,
  myRole,
  myUsername,
  myScore,
  opponentScore,
  waitingForOpponent,
}: BlitzResultsProps) {
  const opponentName = myRole === 'creator' ? duel.opponent_name : duel.creator_name
  const winner = duel.winner_name

  if (waitingForOpponent) {
    return (
      <div className="min-h-screen bg-linear-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-ambient-lg p-10 text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">⏱️</div>
          <h2 className="text-2xl font-extrabold text-on-surface mb-1">Time's Up!</h2>
          <p className="text-on-surface-variant mb-2">Your Blitz Score</p>
          <div className="text-7xl font-black text-primary mb-6">{myScore}</div>
          <div className="flex items-center justify-center gap-2 text-outline">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-medium text-sm">Waiting for {opponentName} to finish...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  const didIWin = winner === myUsername
  const isTie = myScore === opponentScore

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-7xl mb-4"
          >
            {isTie ? '🤝' : didIWin ? '⚡' : '😤'}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className={`text-4xl font-black mb-2 ${didIWin ? 'text-yellow-600' : isTie ? 'text-secondary' : 'text-on-surface'}`}
          >
            {isTie ? "It's a Tie!" : didIWin ? 'Blitz Champion! ⚡' : `${winner} Wins!`}
          </motion.h1>
          <p className="text-on-surface-variant font-medium">
            {didIWin ? 'You answered more questions correctly in 60 seconds!' : 'Better luck next blitz!'}
          </p>
        </motion.div>

        {/* Score Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-ambient-lg overflow-hidden mb-6 border border-slate-100"
        >
          <div className="bg-yellow-400/20 px-6 py-3 border-b border-yellow-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-600">bolt</span>
            <span className="font-black text-yellow-700 uppercase tracking-wide text-sm">Blitz Round — 60 Seconds</span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-100">
            {/* Me */}
            <div className={`p-6 text-center ${didIWin ? 'bg-yellow-50' : ''}`}>
              {didIWin && (
                <div className="inline-flex items-center gap-1 bg-yellow-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-2 uppercase tracking-widest">
                  ⚡ Winner
                </div>
              )}
              <div className="w-12 h-12 rounded-full bg-yellow-400 text-white flex items-center justify-center font-black text-sm mx-auto mb-3">
                {myUsername.slice(0, 2).toUpperCase()}
              </div>
              <p className="font-bold text-on-surface text-sm mb-2">{myUsername} <span className="text-outline">(You)</span></p>
              <div className="text-6xl font-black text-yellow-600 mb-1">{myScore}</div>
              <div className="text-sm text-outline font-medium">correct answers</div>
            </div>

            {/* Opponent */}
            <div className={`p-6 text-center ${!didIWin && !isTie ? 'bg-yellow-50' : ''}`}>
              {!didIWin && !isTie && (
                <div className="inline-flex items-center gap-1 bg-yellow-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mb-2 uppercase tracking-widest">
                  ⚡ Winner
                </div>
              )}
              <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-black text-sm mx-auto mb-3">
                {(opponentName || 'OP').slice(0, 2).toUpperCase()}
              </div>
              <p className="font-bold text-on-surface text-sm mb-2">{opponentName}</p>
              <div className="text-6xl font-black text-secondary mb-1">{opponentScore ?? '?'}</div>
              <div className="text-sm text-outline font-medium">correct answers</div>
            </div>
          </div>

          {isTie && (
            <div className="bg-surface-container-low p-3 text-center text-xs text-outline font-medium border-t border-slate-100">
              🤝 Incredibly close — both answered the same number correctly!
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
            className="flex-1 bg-linear-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-md"
          >
            <span className="material-symbols-outlined">bolt</span>
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
