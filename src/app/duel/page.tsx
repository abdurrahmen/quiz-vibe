'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createDuel, joinDuel } from './actions'
import type { Category } from '@/lib/types'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

/* ─── Floating background icons (same style as homepage hero) ─── */
const DUEL_FLOATING_ICONS = [
  // Left side
  { id: 1, icon: 'psychology', top: 12, left: 8, size: 44, rot: -15, dur: 4.5, delay: 0, mobile: true },
  { id: 2, icon: 'help', top: 55, left: 10, size: 38, rot: 25, dur: 5.2, delay: 0.5, mobile: false },
  { id: 3, icon: 'emoji_events', top: 35, left: 18, size: 50, rot: -20, dur: 3.8, delay: 1.2, mobile: true },
  { id: 4, icon: 'lightbulb', top: 78, left: 6, size: 42, rot: 10, dur: 6.0, delay: 0.8, mobile: true },
  { id: 5, icon: 'star', top: 20, left: 28, size: 28, rot: 30, dur: 4.0, delay: 2.1, mobile: false },
  { id: 6, icon: 'bolt', top: 68, left: 22, size: 36, rot: -5, dur: 5.5, delay: 1.5, mobile: false },
  { id: 7, icon: 'school', top: 45, left: 5, size: 32, rot: -25, dur: 4.2, delay: 0.3, mobile: true },
  // Right side
  { id: 8, icon: 'emoji_events', top: 15, left: 85, size: 48, rot: 15, dur: 5.8, delay: 0.2, mobile: true },
  { id: 9, icon: 'psychology', top: 42, left: 90, size: 40, rot: -15, dur: 4.6, delay: 1.1, mobile: false },
  { id: 10, icon: 'help', top: 65, left: 88, size: 34, rot: 20, dur: 3.9, delay: 2.2, mobile: true },
  { id: 11, icon: 'lightbulb', top: 82, left: 78, size: 46, rot: -25, dur: 6.2, delay: 0.9, mobile: true },
  { id: 12, icon: 'star', top: 25, left: 72, size: 26, rot: -10, dur: 5.0, delay: 1.7, mobile: false },
  { id: 13, icon: 'bolt', top: 50, left: 82, size: 30, rot: 30, dur: 4.3, delay: 0.4, mobile: true },
  // Center-ish top/bottom
  { id: 14, icon: 'bolt', top: 8, left: 48, size: 32, rot: 10, dur: 4.1, delay: 2.0, mobile: true },
  { id: 15, icon: 'star', top: 88, left: 55, size: 24, rot: 45, dur: 3.2, delay: 1.8, mobile: false },
]

/* ─── Difficulty config ─── */
const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; selectedBg: string; selectedBorder: string; selectedText: string }> = {
  mixed: { label: 'Mixed', color: '🎲', selectedBg: 'bg-purple-100', selectedBorder: 'border-purple-400', selectedText: 'text-purple-700' },
  easy: { label: 'Easy', color: '🟢', selectedBg: 'bg-emerald-100', selectedBorder: 'border-emerald-400', selectedText: 'text-emerald-700' },
  medium: { label: 'Medium', color: '🟡', selectedBg: 'bg-amber-100', selectedBorder: 'border-amber-400', selectedText: 'text-amber-700' },
  hard: { label: 'Hard', color: '🔴', selectedBg: 'bg-red-100', selectedBorder: 'border-red-400', selectedText: 'text-red-700' },
}

export default function DuelHubPage() {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'standard' | 'blitz' | 'category_wars'>('standard')
  const [selectedDifficulty, setSelectedDifficulty] = useState('mixed')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    const result = await createDuel(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
    // On success, server redirects to /duel/[roomCode]
  }

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    const result = await joinDuel(formData)
    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
    // On success, server redirects to /duel/[roomCode]
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-80 border-b border-slate-100/80 shadow-ambient">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-gradient">
            QuizMaster Pro
          </Link>
          <Link href="/" className="text-slate-600 hover:text-primary transition-colors font-medium text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-tertiary text-white px-6 py-16 text-center">
        {/* Floating Decorative Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]" aria-hidden="true">
          {DUEL_FLOATING_ICONS.map((icon) => (
            <div
              key={icon.id}
              className={`absolute ${icon.mobile ? 'block' : 'hidden md:block'}`}
              style={{
                top: `${icon.top}%`,
                left: `${icon.left}%`,
                animation: `float-pulse-icon ${icon.dur}s ease-in-out infinite`,
                animationDelay: `${icon.delay}s`,
              }}
            >
              <span
                className="material-symbols-outlined text-white"
                style={{
                  fontSize: `${icon.size}px`,
                  transform: `rotate(${icon.rot}deg)`,
                  display: 'block',
                }}
              >
                {icon.icon}
              </span>
            </div>
          ))}
        </div>

        {/* Dark gradient overlay at bottom for smooth blend */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent z-[1] pointer-events-none" />

        <div className="relative z-10">
          <div className="text-6xl mb-4" style={{ animation: 'goldenGlow 3s ease-in-out infinite' }}>
            ⚡
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Duel Mode</h1>
          <p className="text-white/80 max-w-md mx-auto">
            Challenge a friend to a real-time quiz battle. Race through 10 questions and prove who&apos;s the smartest.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
          style={{
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 24px rgba(26, 26, 46, 0.08), 0 1px 6px rgba(26, 26, 46, 0.04)',
          }}
        >
          {/* Tabs */}
          <div className="flex border-b border-slate-100 relative">
            {(['create', 'join'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-4 font-bold text-sm transition-colors duration-200 capitalize relative ${
                  tab === t
                    ? 'text-primary bg-primary/5'
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                {t === 'create' ? '⚡ Create Duel' : '🚪 Join Duel'}
                {/* Animated underline */}
                {tab === t && (
                  <motion.div
                    layoutId="duel-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {tab === 'create' ? (
                <motion.form
                  key="create"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  onSubmit={handleCreate}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Your Username</label>
                    <input
                      name="creator_name"
                      type="text"
                      required
                      placeholder="e.g. QuizKing99"
                      className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none transition-all duration-200 font-medium"
                    />
                  </div>

                  {/* Mode Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Game Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'standard', emoji: '⚔️', label: 'Standard', desc: 'Classic 10-question battle' },
                        { value: 'blitz', emoji: '⚡', label: 'Blitz', desc: 'Speed round, 60 seconds only' },
                        { value: 'category_wars', emoji: '🏹', label: 'Cat. Wars', desc: 'Pick your battlefield' },
                      ].map((m) => (
                        <label key={m.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="mode"
                            value={m.value}
                            defaultChecked={m.value === 'standard'}
                            className="sr-only peer"
                            onChange={() => setSelectedMode(m.value as 'standard' | 'blitz' | 'category_wars')}
                          />
                          <div className={`
                            text-center text-xs font-bold py-3 px-1 rounded-xl border-2 
                            border-surface-variant text-slate-500
                            peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary 
                            peer-checked:border-l-4 peer-checked:border-l-primary
                            hover:border-primary/50 hover:scale-[1.02] hover:shadow-md
                            transition-all duration-200 ease-in-out
                          `}>
                            <div className="text-lg mb-0.5">{m.emoji}</div>
                            <div>{m.label}</div>
                            <div className="text-[10px] font-medium opacity-70 mt-0.5 leading-tight">{m.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Category — hidden in blitz */}
                  {selectedMode !== 'blitz' && (
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">Category</label>
                      <select
                        name="category_id"
                        className="w-full appearance-none bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none cursor-pointer font-medium transition-all duration-200"
                      >
                        <option value="">🎲 Any Category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Difficulty — hidden in blitz */}
                  {selectedMode !== 'blitz' && (
                    <div>
                      <label className="block text-sm font-semibold text-on-surface mb-2">Difficulty</label>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(DIFFICULTY_CONFIG).map(([d, config]) => {
                          const isSelected = selectedDifficulty === d
                          return (
                            <label key={d} className="cursor-pointer">
                              <input 
                                type="radio" 
                                name="difficulty" 
                                value={d} 
                                checked={isSelected}
                                onChange={() => setSelectedDifficulty(d)}
                                className="sr-only peer" 
                              />
                              <div className={`
                                text-center text-xs font-bold py-2.5 rounded-xl border-2 capitalize
                                transition-all duration-200 ease-in-out
                                ${isSelected 
                                  ? `${config.selectedBg} ${config.selectedBorder} ${config.selectedText}` 
                                  : 'border-surface-variant text-slate-500 hover:border-primary/50'
                                }
                              `}>
                                <span className={`
                                  inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider mb-1
                                  ${isSelected
                                    ? `${config.selectedText} ${config.selectedBg}`
                                    : 'bg-slate-100 text-slate-400'
                                  }
                                  transition-all duration-200
                                `}>
                                  {d}
                                </span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Blitz info banner */}
                  {selectedMode === 'blitz' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
                      <p className="font-bold text-yellow-700 flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-outlined text-base">bolt</span>
                        Blitz Mode — 60 Seconds
                      </p>
                      <p className="text-yellow-600">Answer as many questions as you can. No question limit — the stream is infinite! Winner = most correct answers.</p>
                    </div>
                  )}

                  {/* CTA Button with shimmer */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className={`
                      relative w-full text-white font-bold py-4 rounded-xl transition-all duration-200 ease-in-out
                      disabled:opacity-70 flex items-center justify-center gap-2 mt-2
                      hover:-translate-y-0.5 hover:scale-[1.02] overflow-hidden
                      ${selectedMode === 'blitz'
                        ? 'bg-linear-to-r from-yellow-500 to-orange-500 shadow-md hover:shadow-lg'
                        : 'bg-linear-to-r from-primary to-tertiary shadow-primary hover:shadow-primary-lg'
                      }
                    `}
                  >
                    {/* Shimmer effect */}
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                        animation: 'shimmer 3s ease-in-out infinite',
                        width: '50%',
                      }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isPending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Room...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">add_circle</span>
                          Create {selectedMode === 'blitz' ? 'Blitz' : selectedMode === 'category_wars' ? 'Cat. Wars' : 'Duel'} Room
                        </>
                      )}
                    </span>
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="join"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  onSubmit={handleJoin}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Your Username</label>
                    <input
                      name="opponent_name"
                      type="text"
                      required
                      placeholder="e.g. BrainMaster42"
                      className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none transition-all duration-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Room Code</label>
                    <input
                      name="room_code"
                      type="text"
                      required
                      placeholder="QM-4X9B"
                      maxLength={7}
                      className="w-full bg-surface-container-low border-2 border-dashed border-slate-300 focus:border-primary focus:border-solid rounded-xl px-4 py-4 outline-none transition-all duration-200 font-mono font-bold text-xl tracking-[0.25em] uppercase text-center placeholder:text-slate-300 placeholder:tracking-[0.25em]"
                      onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                    />
                  </div>

                  {/* How to Join — styled with purple accent */}
                  <div className="rounded-xl p-5 text-sm text-on-surface border-l-4 border-primary" style={{ background: 'rgba(77, 65, 223, 0.05)' }}>
                    <p className="font-semibold mb-3 text-primary">How to join:</p>
                    <div className="space-y-3">
                      {[
                        'Ask your friend to create a duel room',
                        'Enter the 7-character room code they share with you',
                        'The battle starts immediately!',
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-on-surface-variant leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Join Button with shimmer */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="relative w-full bg-linear-to-r from-secondary to-tertiary text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200 ease-in-out disabled:opacity-70 flex items-center justify-center gap-2 mt-2 overflow-hidden"
                  >
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                        animation: 'shimmer 3.5s ease-in-out infinite',
                        width: '50%',
                      }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isPending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Joining Room...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">login</span>
                          Join the Duel
                        </>
                      )}
                    </span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
