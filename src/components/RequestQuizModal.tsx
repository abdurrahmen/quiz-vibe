'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { createClient } from '@/utils/supabase/client'
import type { Category } from '@/lib/types'

interface RequestQuizModalProps {
  onClose: () => void
  categories: Category[]
}

export default function RequestQuizModal({ onClose, categories }: RequestQuizModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [useNewCategory, setUseNewCategory] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    topic: '',
    category_id: '',
    new_category_name: '',
    difficulty: 'medium',
    question_type: 'MCQ',
    question_count: 5,
    message: '',
  })

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username.trim()) {
      setError('Please enter your username.')
      return
    }
    if (!formData.topic.trim()) {
      setError('Please describe the topic you want a quiz about.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const insertData: any = {
        username: formData.username.trim(),
        topic: formData.topic.trim(),
        difficulty: formData.difficulty,
        question_type: formData.question_type,
        question_count: formData.question_count,
        message: formData.message.trim() || null,
      }

      if (useNewCategory && formData.new_category_name.trim()) {
        // Store the new category name in the message field alongside user message
        insertData.category_id = null
        insertData.message = `[NEW CATEGORY: ${formData.new_category_name.trim()}] ${formData.message.trim() || ''}`
      } else {
        insertData.category_id = formData.category_id || null
      }

      const { error: dbError } = await supabase.from('quiz_requests').insert(insertData)

      if (dbError) throw dbError

      setSuccess(true)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-6" 
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-surface w-full max-w-[480px] rounded-2xl p-8 shadow-ambient-lg border border-outline-variant/30 flex flex-col items-center relative" 
          onClick={e => e.stopPropagation()}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-green-600 text-[40px] filled">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Request Submitted!</h2>
          <p className="text-on-surface-variant text-center mb-6">
            Your quiz request has been sent to the admin team. They'll review it and generate the quiz for you shortly.
          </p>
          <button
            onClick={onClose}
            className="bg-linear-to-r from-primary to-tertiary text-white font-semibold py-3 px-8 rounded-2xl shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all"
          >
            Got it, thanks!
          </button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-6"
      onClick={onClose}
      onWheel={e => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface w-full max-w-[520px] rounded-2xl shadow-ambient-lg border border-outline-variant/30 flex flex-col relative max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Fixed header */}
        <div className="p-8 pb-4 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container transition-colors z-10"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="text-center mt-2">
            <div className="w-16 h-16 bg-tertiary-fixed rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-tertiary text-[32px] filled">request_quote</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface">Request a Quiz</h2>
            <p className="text-on-surface-variant mt-2">Tell us what topic you'd like a quiz on and we'll create it for you.</p>
          </div>
        </div>

        {/* Scrollable form content */}
        <div className="overflow-y-auto px-8 pb-8 flex-1 overscroll-contain">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Username</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">person</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full bg-surface-container-high text-on-surface py-3 pl-11 pr-4 rounded-xl border-2 transition-all outline-none ${error && !formData.username.trim() ? 'border-error' : 'border-transparent focus:border-primary focus:bg-surface'}`}
                  placeholder="Enter your display name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Topic */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Topic Description</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-outline pointer-events-none">subject</span>
                <textarea
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  className={`w-full bg-surface-container-high text-on-surface py-3 pl-11 pr-4 rounded-xl border-2 transition-all outline-none min-h-[80px] resize-y ${error && !formData.topic.trim() ? 'border-error' : 'border-transparent focus:border-primary focus:bg-surface'}`}
                  placeholder="e.g. Advanced React Hooks, World War II, Quantum Physics..."
                  disabled={loading}
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Category</label>
              <select
                value={formData.category_id}
                onChange={e => {
                  if (e.target.value === 'CREATE_NEW') {
                    setUseNewCategory(true)
                  } else {
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                }}
                className="w-full bg-surface-container-high text-on-surface py-3 px-4 rounded-xl border-2 border-transparent focus:border-primary focus:bg-surface outline-none transition-all appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="">Any Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="CREATE_NEW" className="font-bold text-primary">➕ Suggest New Category</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-surface-container-high text-on-surface py-3 px-4 rounded-xl border-2 border-transparent focus:border-primary focus:bg-surface outline-none transition-all appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Question Type & Count */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface">Question Format</label>
                <select
                  value={formData.question_type}
                  onChange={e => setFormData({ ...formData, question_type: e.target.value })}
                  className="w-full bg-surface-container-high text-on-surface py-3 px-4 rounded-xl border-2 border-transparent focus:border-primary focus:bg-surface outline-none transition-all appearance-none cursor-pointer"
                  disabled={loading}
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="SCQ">Single Choice</option>
                  <option value="TF">True / False</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface">Questions: {formData.question_count}</label>
                <div className="flex items-center h-[48px]">
                  <input
                    type="range"
                    min="5" max="20"
                    value={formData.question_count}
                    onChange={e => setFormData({ ...formData, question_count: parseInt(e.target.value) })}
                    className="w-full accent-primary"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface flex justify-between">
                Additional Notes
                <span className="text-xs text-outline font-normal">Optional</span>
              </label>
              <textarea
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-surface-container-high text-on-surface py-3 px-4 rounded-xl border-2 border-transparent focus:border-primary focus:bg-surface outline-none transition-all min-h-[60px] resize-y"
                placeholder="Any specific requirements or instructions..."
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-1.5 animate-fade-in">
                <span className="material-symbols-outlined text-error text-[16px]">error</span>
                <span className="text-xs text-error">{error}</span>
              </div>
            )}

            {/* Submit */}
            <div className="mt-2 pt-4 border-t border-surface-container-highest">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-primary to-tertiary text-white font-semibold py-3.5 px-6 rounded-2xl shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Suggest New Category Popup */}
      {useNewCategory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setUseNewCategory(false)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-ambient-lg"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-on-surface mb-4">Suggest New Category</h3>
            <p className="text-sm text-on-surface-variant mb-4">Enter a name for the new category you'd like to suggest.</p>
            <input
              type="text"
              value={formData.new_category_name}
              onChange={e => setFormData({ ...formData, new_category_name: e.target.value })}
              className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none mb-6"
              placeholder="e.g. Cybersecurity"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setUseNewCategory(false)
                  setFormData({ ...formData, new_category_name: '', category_id: '' })
                }}
                className="flex-1 py-2.5 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (formData.new_category_name.trim()) {
                    setUseNewCategory(false)
                    // The select will show empty because category_id is 'CREATE_NEW' but not matched, but we can fake a generic option or let it be empty
                    // Since it's stored in new_category_name we just leave it
                  }
                }}
                disabled={!formData.new_category_name.trim()}
                className="flex-1 py-2.5 font-bold bg-primary text-white rounded-xl shadow-primary disabled:opacity-50 transition-all"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
