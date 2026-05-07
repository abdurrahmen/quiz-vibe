'use client'

import { motion, AnimatePresence } from 'motion/react'
import type { TournamentMatch } from '@/lib/types'
import Link from 'next/link'

interface BracketViewProps {
  matches: TournamentMatch[]
  maxPlayers: 4 | 8
  currentUsername?: string
}

const ROUND_LABELS: Record<number, string> = {
  1: 'Quarter-Finals',
  2: 'Semi-Finals',
  3: 'Final',
}

const ROUND_LABELS_4P: Record<number, string> = {
  1: 'Semi-Finals',
  2: 'Final',
}

function MatchCard({ match, currentUsername }: { match: TournamentMatch; currentUsername?: string }) {
  const isLive = match.status === 'in_progress'
  const isDone = match.status === 'finished'

  const playerRow = (name: string | null, isWinner: boolean) => {
    const isMe = name === currentUsername
    return (
      <div className={`flex items-center justify-between px-3 py-2 ${isWinner ? 'bg-primary/10' : ''} ${!name ? 'opacity-40' : ''}`}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center text-white ${
            isWinner ? 'bg-primary' : 'bg-slate-300'
          }`}>
            {name ? name.slice(0, 2).toUpperCase() : '?'}
          </div>
          <span className={`text-sm font-semibold ${isWinner ? 'text-primary' : 'text-on-surface'} ${isMe ? 'underline decoration-dotted' : ''}`}>
            {name ?? 'TBD'} {isMe ? '(You)' : ''}
          </span>
        </div>
        {isWinner && <span className="material-symbols-outlined text-primary text-sm">emoji_events</span>}
      </div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-xl overflow-hidden border-2 shadow-sm min-w-[180px] ${
        isLive ? 'border-primary shadow-primary/20' : isDone ? 'border-green-200' : 'border-slate-200'
      }`}
    >
      {/* Status badge */}
      <div className={`px-3 py-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${
        isLive ? 'bg-primary text-white' : isDone ? 'bg-green-50 text-green-700' : 'bg-surface-container text-outline'
      }`}>
        <span>{isLive ? '🔴 LIVE' : isDone ? '✅ Done' : '⏳ Pending'}</span>
        {match.room_code && isLive && (
          <Link href={`/duel/${match.room_code}`} className="underline">
            {match.room_code}
          </Link>
        )}
      </div>
      <div className="divide-y divide-slate-100">
        {playerRow(match.player1_name, match.winner_name === match.player1_name)}
        {playerRow(match.player2_name, match.winner_name === match.player2_name)}
      </div>
    </motion.div>
  )
}

export default function BracketView({ matches, maxPlayers, currentUsername }: BracketViewProps) {
  const totalRounds = maxPlayers === 8 ? 3 : 2
  const roundLabels = maxPlayers === 8 ? ROUND_LABELS : ROUND_LABELS_4P

  // Group matches by round
  const byRound: Record<number, TournamentMatch[]> = {}
  for (let r = 1; r <= totalRounds; r++) {
    byRound[r] = matches.filter(m => m.round === r).sort((a, b) => a.match_number - b.match_number)
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 items-stretch min-w-max p-4">
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => (
          <div key={round} className="flex flex-col">
            {/* Round label */}
            <div className="text-center mb-4">
              <span className="text-xs font-black text-outline uppercase tracking-widest">
                {roundLabels[round] ?? `Round ${round}`}
              </span>
            </div>

            {/* Matches, vertically spaced to align with bracket lines */}
            <div
              className="flex flex-col gap-6 justify-around flex-1"
              style={{ minHeight: `${Math.pow(2, totalRounds - round) * 90}px` }}
            >
              {byRound[round]?.length > 0 ? (
                byRound[round].map(match => (
                  <MatchCard key={match.id} match={match} currentUsername={currentUsername} />
                ))
              ) : (
                // Placeholder cards for future rounds
                Array.from({ length: Math.pow(2, totalRounds - round) }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/50 rounded-xl border-2 border-dashed border-slate-200 min-w-[180px] h-[76px] flex items-center justify-center"
                  >
                    <span className="text-xs text-outline font-medium">Awaiting results...</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}

        {/* Champion slot */}
        <div className="flex flex-col">
          <div className="text-center mb-4">
            <span className="text-xs font-black text-outline uppercase tracking-widest">Champion</span>
          </div>
          <div className="flex items-center justify-center flex-1">
            {matches.find(m => m.round === totalRounds)?.winner_name ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-center bg-linear-to-br from-yellow-400 to-orange-400 text-white rounded-2xl p-6 shadow-lg"
              >
                <div className="text-4xl mb-2">🏆</div>
                <p className="font-black text-lg">{matches.find(m => m.round === totalRounds)!.winner_name}</p>
                <p className="text-[10px] uppercase tracking-widest opacity-80">Champion</p>
              </motion.div>
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-yellow-300 flex items-center justify-center text-3xl opacity-40">
                🏆
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
