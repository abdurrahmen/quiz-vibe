'use client'

import { motion } from 'motion/react'
import type { Duel } from '@/lib/types'

interface DuelLobbyProps {
  duel: Duel
  myRole: 'creator' | 'opponent'
  myUsername: string
  opponentJoined: boolean
}

export default function DuelLobby({ duel, myRole, myUsername, opponentJoined }: DuelLobbyProps) {
  const copyCode = () => {
    navigator.clipboard.writeText(duel.room_code)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-ambient-lg w-full max-w-md overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="bg-linear-to-br from-primary to-tertiary text-white p-8 text-center">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-6xl mb-4"
          >
            ⚡
          </motion.div>
          <h1 className="text-2xl font-extrabold mb-1">Duel Room Created!</h1>
          <p className="text-white/80 text-sm">Share the code below with your opponent</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Room Code */}
          <div className="text-center">
            <p className="text-xs font-bold text-outline uppercase tracking-widest mb-3">Room Code</p>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl px-8 py-4">
                <span className="text-4xl font-black text-primary tracking-[0.2em] font-mono">
                  {duel.room_code}
                </span>
              </div>
              <button
                onClick={copyCode}
                className="p-3 rounded-xl bg-surface-container hover:bg-primary-fixed transition-colors text-outline hover:text-primary"
                title="Copy code"
              >
                <span className="material-symbols-outlined">content_copy</span>
              </button>
            </div>
          </div>

          {/* Players Status */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-outline uppercase tracking-widest">Players</p>

            <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-base filled">person</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">{duel.creator_name}</p>
                  <p className="text-xs text-outline">Creator</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>

            <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-base">person</span>
                </div>
                <div>
                  <p className={`font-bold text-sm ${opponentJoined ? 'text-on-surface' : 'text-outline'}`}>
                    {opponentJoined ? (duel.opponent_name || 'Opponent') : 'Waiting...'}
                  </p>
                  <p className="text-xs text-outline">Challenger</p>
                </div>
              </div>
              {opponentJoined ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Joined!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-outline">
                  <span className="w-3 h-3 border-2 border-outline border-t-transparent rounded-full animate-spin" />
                  Waiting...
                </span>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-surface-container-low rounded-xl px-4 py-3 flex justify-between text-sm">
            <span className="text-outline font-medium">Category</span>
            <span className="font-bold text-on-surface">{duel.category_id ? 'Filtered' : 'Any'}</span>
          </div>

          {opponentJoined && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
            >
              <p className="text-green-700 font-bold">🎉 Opponent joined! Starting battle...</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
