'use client'

import { motion } from 'motion/react'
import type { DuelProgress } from '@/lib/types'

interface OpponentProgressBarProps {
  myUsername: string
  opponentName: string
  myProgress: DuelProgress
  opponentProgress: DuelProgress
  totalQuestions: number
}

function PlayerBar({
  username,
  progress,
  total,
  isMe,
  lastCorrect,
}: {
  username: string
  progress: DuelProgress
  total: number
  isMe: boolean
  lastCorrect: boolean | null
}) {
  const pct = total > 0 ? (progress.answered / total) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${isMe ? 'bg-primary' : 'bg-secondary'}`}>
        {username.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs font-bold truncate ${isMe ? 'text-primary' : 'text-secondary'}`}>
            {username} {isMe && '(You)'}
          </span>
          <div className="flex items-center gap-2 ml-2 shrink-0">
            <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              {progress.correct}
            </span>
            <span className="text-xs font-bold text-error flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">cancel</span>
              {progress.answered - progress.correct}
            </span>
          </div>
        </div>
        <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isMe ? 'bg-primary' : 'bg-secondary'}`}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
        <p className="text-[10px] text-outline mt-0.5 text-right">
          {progress.answered}/{total} answered
        </p>
      </div>
    </div>
  )
}

export default function OpponentProgressBar({
  myUsername,
  opponentName,
  myProgress,
  opponentProgress,
  totalQuestions,
}: OpponentProgressBarProps) {
  const isLeading = myProgress.correct >= opponentProgress.correct

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-sm">
      <div className="max-w-2xl mx-auto space-y-3">
        <PlayerBar
          username={myUsername}
          progress={myProgress}
          total={totalQuestions}
          isMe={true}
          lastCorrect={null}
        />
        <PlayerBar
          username={opponentName}
          progress={opponentProgress}
          total={totalQuestions}
          isMe={false}
          lastCorrect={null}
        />
      </div>
    </div>
  )
}
