'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { createDuel, joinDuel } from './actions'
import type { Category } from '@/lib/types'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

export default function DuelHubPage() {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

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
      <div className="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-tertiary text-white py-20 px-6">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: Math.random() * 200 + 50 + 'px',
                height: Math.random() * 200 + 50 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                transform: 'translate(-50%, -50%)',
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-8xl mb-6"
          >
            ⚡
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight"
          >
            Duel Mode
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-white/80 font-medium max-w-xl mx-auto"
          >
            Challenge a friend to a real-time quiz battle. Race through 10 questions and prove who&apos;s the smartest.
          </motion.p>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-ambient-lg w-full max-w-md overflow-hidden border border-slate-100"
        >
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {(['create', 'join'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-4 font-bold text-sm transition-colors capitalize ${
                  tab === t
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                {t === 'create' ? '⚡ Create Duel' : '🚪 Join Duel'}
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
                      className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Category</label>
                    <select
                      name="category_id"
                      className="w-full appearance-none bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none cursor-pointer font-medium"
                    >
                      <option value="">🎲 Any Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Difficulty</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['mixed', 'easy', 'medium', 'hard'].map((d) => (
                        <label key={d} className="cursor-pointer">
                          <input type="radio" name="difficulty" value={d} defaultChecked={d === 'mixed'} className="sr-only peer" />
                          <div className="text-center text-xs font-bold py-2.5 rounded-xl border-2 border-surface-variant peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary text-slate-500 hover:border-primary/50 transition-all capitalize">
                            {d === 'mixed' ? '🎲' : d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'}<br />
                            {d}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-linear-to-r from-primary to-tertiary text-white font-bold py-4 rounded-xl shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                  >
                    {isPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Room...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">add_circle</span>
                        Create Duel Room
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="join"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
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
                      className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Room Code</label>
                    <input
                      name="room_code"
                      type="text"
                      required
                      placeholder="e.g. QM-4X9B"
                      maxLength={7}
                      className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none transition-all font-mono font-bold text-lg tracking-widest uppercase text-center"
                      onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                    />
                  </div>
                  <div className="bg-primary-fixed/50 rounded-xl p-4 text-sm text-on-surface">
                    <p className="font-semibold mb-1">How to join:</p>
                    <ol className="text-on-surface-variant space-y-1 list-decimal list-inside">
                      <li>Ask your friend to create a duel room</li>
                      <li>Enter the 7-character room code they share with you</li>
                      <li>The battle starts immediately!</li>
                    </ol>
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-linear-to-r from-secondary to-tertiary text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
                  >
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
