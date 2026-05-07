'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { createClient } from '@/utils/supabase/client'
import type { Category, Difficulty } from '@/lib/types'

interface StartQuizModalProps {
  onClose: () => void
  categories: Category[]
  initialCategoryId?: string
}

export default function StartQuizModal({ onClose, categories, initialCategoryId }: StartQuizModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    category_id: initialCategoryId || 'all',
    difficulty: 'all' as Difficulty | 'all',
  })
  const [counts, setCounts] = useState<Record<string, number>>({
    all: 1, // Assume all has questions unless category has 0 total
    easy: 1,
    medium: 1,
    hard: 1,
  })

  // Check availability when category changes
  useEffect(() => {
    const checkAvailability = async () => {
      const supabase = createClient()
      let query = supabase.from('questions').select('difficulty', { count: 'exact' })
      
      if (formData.category_id !== 'all') {
        query = query.eq('category_id', formData.category_id)
      }

      const { data, error: countError } = await query
      
      if (countError) return

      const newCounts = { all: data.length, easy: 0, medium: 0, hard: 0 }
      data.forEach(q => {
        if (q.difficulty in newCounts) {
          newCounts[q.difficulty as keyof typeof newCounts]++
        }
      })
      setCounts(newCounts)

      // If current difficulty is now empty, reset to all
      if (formData.difficulty !== 'all' && newCounts[formData.difficulty] === 0) {
        setFormData(prev => ({ ...prev, difficulty: 'all' }))
      }
    }

    checkAvailability()
  }, [formData.category_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username.trim()) {
      setError('Please provide a username to continue.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Create a new attempt record
      const { data, error: dbError } = await supabase
        .from('quiz_attempts')
        .insert({
          username: formData.username,
          category_id: formData.category_id === 'all' ? null : formData.category_id,
          difficulty: formData.difficulty,
          started_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (dbError) throw dbError
      if (!data) throw new Error('Failed to create attempt')

      // Navigate to the quiz session
      router.push(`/quiz/${data.id}`)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-6" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface w-full max-w-[480px] rounded-2xl p-8 shadow-ambient-lg border border-outline-variant/30 flex flex-col relative" 
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="text-center mb-8 mt-2">
          <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-[32px] filled">rocket_launch</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Start Your Quiz</h2>
          <p className="text-on-surface-variant mt-2">Set up your session parameters below to begin.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-semibold text-on-surface tracking-wide">Username</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">person</span>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className={`w-full bg-surface-container-high text-on-surface py-3 pl-11 pr-4 rounded-xl border-2 transition-all outline-none ${error ? 'border-error' : 'border-transparent focus:border-primary focus:bg-surface'}`}
                placeholder="Enter your display name"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-1 animate-fade-in">
                <span className="material-symbols-outlined text-error text-[16px]">error</span>
                <span className="text-xs text-error">{error}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="category" className="text-sm font-semibold text-on-surface tracking-wide">Category</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">category</span>
              <select
                id="category"
                value={formData.category_id}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-surface-container-high text-on-surface py-3 pl-11 pr-10 rounded-xl border-2 border-transparent focus:border-primary focus:bg-surface outline-none transition-all appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="difficulty" className="text-sm font-semibold text-on-surface tracking-wide">Difficulty</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">tune</span>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value as Difficulty | 'all' })}
                className="w-full bg-surface-container-high text-on-surface py-3 pl-11 pr-10 rounded-xl border-2 border-transparent focus:border-primary focus:bg-surface outline-none transition-all appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="all">All Levels ({counts.all})</option>
                <option value="easy" disabled={counts.easy === 0}>Easy {counts.easy === 0 ? '(Empty)' : `(${counts.easy})`}</option>
                <option value="medium" disabled={counts.medium === 0}>Medium {counts.medium === 0 ? '(Empty)' : `(${counts.medium})`}</option>
                <option value="hard" disabled={counts.hard === 0}>Hard {counts.hard === 0 ? '(Empty)' : `(${counts.hard})`}</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-surface-container-highest">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-primary to-tertiary text-white font-semibold py-3.5 px-6 rounded-2xl shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <>
                  <span>Start Session</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-outline mt-4">
              By starting, you agree to our academic integrity policy.
            </p>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
