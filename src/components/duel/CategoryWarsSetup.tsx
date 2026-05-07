'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { setCategoryWarsPick } from '@/app/duel/actions'
import type { Category } from '@/lib/types'

interface CategoryWarsSetupProps {
  duelId: string
  myRole: 'creator' | 'opponent'
  categories: Category[]
  opponentName: string
  myPicked: boolean          // true if this player already submitted their pick
  opponentPicked: boolean    // true if opponent already submitted (we see the flag but not the choice)
  onPicked?: () => void      // fired after a successful server pick
}

export default function CategoryWarsSetup({
  duelId,
  myRole,
  categories,
  opponentName,
  myPicked: initialMyPicked,
  opponentPicked: initialOpponentPicked,
  onPicked,
}: CategoryWarsSetupProps) {
  const [myPicked, setMyPicked] = useState(initialMyPicked)
  const [opponentPicked, setOpponentPicked] = useState(initialOpponentPicked)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handlePick = async () => {
    if (!selectedCategoryId || isSubmitting) return
    setIsSubmitting(true)
    setError('')

    const result = await setCategoryWarsPick(duelId, myRole, selectedCategoryId)
    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setMyPicked(true)
      onPicked?.()  // notify DuelClient so it can broadcast 'category_picked'
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-surface-container-low flex flex-col">
      {/* Header */}
      <div className="bg-linear-to-r from-secondary to-tertiary text-white px-6 py-8 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl mb-3"
        >
          🏹
        </motion.div>
        <h1 className="text-2xl font-extrabold mb-1">Category Wars</h1>
        <p className="text-white/80 text-sm max-w-xs mx-auto">
          Pick your <strong>strongest</strong> category. Your opponent won&apos;t know which one you chose until the battle!
        </p>
      </div>

      {/* Player Status */}
      <div className="flex justify-center gap-4 px-6 py-4 bg-white border-b border-slate-100">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${myPicked ? 'bg-green-100 text-green-700' : 'bg-surface-container text-outline'}`}>
          <span className="material-symbols-outlined text-base">{myPicked ? 'check_circle' : 'radio_button_unchecked'}</span>
          You {myPicked ? '— Locked in! 🔒' : '— Picking...'}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${opponentPicked ? 'bg-green-100 text-green-700' : 'bg-surface-container text-outline'}`}>
          <span className="material-symbols-outlined text-base">{opponentPicked ? 'check_circle' : 'pending'}</span>
          {opponentName} {opponentPicked ? '— Ready! 🔒' : '— Thinking...'}
        </div>
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {!myPicked ? (
          <>
            {/* Strategy tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm">
              <p className="font-bold text-amber-700 mb-1">⚔️ Strategy</p>
              <p className="text-amber-600">
                Questions <strong>1, 3, 5, 7, 9</strong> will be from <strong>your</strong> category.
                Questions <strong>2, 4, 6, 8, 10</strong> will be from your <strong>opponent&apos;s</strong> category.
                Pick what you know best!
              </p>
            </div>

            {/* Category grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {categories.map(cat => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedCategoryId === cat.id
                      ? 'border-secondary bg-secondary/10 shadow-md'
                      : 'border-surface-variant bg-white hover:border-secondary/50'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 text-white"
                    style={{ backgroundColor: cat.color || '#6366f1' }}
                  >
                    {cat.icon || '📚'}
                  </div>
                  <p className={`font-bold text-sm leading-tight ${selectedCategoryId === cat.id ? 'text-secondary' : 'text-on-surface'}`}>
                    {cat.name}
                  </p>
                  {cat.question_count !== undefined && (
                    <p className="text-[10px] text-outline mt-0.5">{cat.question_count} questions</p>
                  )}
                </motion.button>
              ))}
            </div>

            {error && (
              <p className="text-error text-sm font-medium mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </p>
            )}

            <button
              onClick={handlePick}
              disabled={!selectedCategoryId || isSubmitting}
              className="w-full bg-linear-to-r from-secondary to-tertiary text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Locking in...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">lock</span>
                  Lock in{selectedCategoryId ? ` "${categories.find(c => c.id === selectedCategoryId)?.name}"` : ' My Pick'}
                </>
              )}
            </button>
          </>
        ) : (
          // Waiting for opponent
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-extrabold text-on-surface mb-2">Category Locked!</h2>
            <p className="text-on-surface-variant mb-8 max-w-xs">
              Your pick is secret. Waiting for <strong>{opponentName}</strong> to choose their category...
            </p>
            <div className="flex items-center gap-3 text-outline">
              <span className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">{opponentPicked ? 'Both ready! Starting...' : 'Waiting...'}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
