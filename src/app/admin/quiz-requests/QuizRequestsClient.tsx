'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { updateRequestStatus, deleteRequest } from './actions'
import toast from 'react-hot-toast'

interface QuizRequestItem {
  id: string
  username: string
  topic: string
  category_id: string | null
  category: { name: string; icon: string; color: string } | null
  difficulty: string
  question_type: string
  question_count: number
  message: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
}

interface Props {
  initialRequests: QuizRequestItem[]
  stats: { total: number; pending: number; approved: number; rejected: number }
}

export default function QuizRequestsClient({ initialRequests, stats }: Props) {
  const router = useRouter()
  const [requests, setRequests] = useState(initialRequests)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [actionPending, setActionPending] = useState<string | null>(null)

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  const handleAccept = async (req: QuizRequestItem) => {
    setActionPending(req.id)
    const result = await updateRequestStatus(req.id, 'approved')
    if (result.error) {
      toast.error(result.error)
      setActionPending(null)
      return
    }
    // Update local state
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' as const, reviewed_at: new Date().toISOString() } : r))
    setActionPending(null)

    // Extract [NEW CATEGORY: name] from message if present
    let newCategory = ''
    if (req.message && req.message.includes('[NEW CATEGORY: ')) {
      const match = req.message.match(/\[NEW CATEGORY: (.*?)\]/)
      if (match) newCategory = match[1]
    }

    // Navigate to AI generator with pre-filled params
    const params = new URLSearchParams({
      topic: req.topic,
      difficulty: req.difficulty,
      type: req.question_type,
      count: String(req.question_count),
      ...(req.category_id ? { category: req.category_id } : {}),
      ...(newCategory ? { newCategory } : {}),
    })
    router.push(`/admin/ai-generator?${params.toString()}`)
  }

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this request?')) return
    setActionPending(id)
    const result = await updateRequestStatus(id, 'rejected')
    if (result.error) {
      toast.error(result.error)
    } else {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const, reviewed_at: new Date().toISOString() } : r))
    }
    setActionPending(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this request?')) return
    setActionPending(id)
    const result = await deleteRequest(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setRequests(prev => prev.filter(r => r.id !== id))
    }
    setActionPending(null)
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Pending</span>
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Approved</span>
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Rejected</span>
      default:
        return null
    }
  }

  const difficultyBadge = (d: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-50 text-green-700',
      medium: 'bg-amber-50 text-amber-700',
      hard: 'bg-red-50 text-red-700',
    }
    return <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${colors[d] || 'bg-surface-container-high text-on-surface-variant'}`}>{d}</span>
  }

  const typeBadge = (t: string) => {
    const labels: Record<string, string> = { MCQ: 'Multiple Choice', SCQ: 'Single Choice', TF: 'True/False' }
    return <span className="px-2 py-0.5 rounded text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed-variant">{labels[t] || t}</span>
  }

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Quiz Requests</h1>
          <p className="text-on-surface-variant">Review and manage quiz requests from users.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button onClick={() => setFilter('all')} className={`bg-surface-container-lowest rounded-2xl p-5 shadow-ambient flex items-center gap-3 transition-all hover:shadow-ambient-lg ${filter === 'all' ? 'ring-2 ring-primary' : ''}`}>
          <div className="w-11 h-11 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
            <span className="material-symbols-outlined filled">inbox</span>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-on-surface">{stats.total}</div>
            <div className="text-xs font-semibold text-outline uppercase tracking-wide">Total</div>
          </div>
        </button>

        <button onClick={() => setFilter('pending')} className={`bg-surface-container-lowest rounded-2xl p-5 shadow-ambient flex items-center gap-3 transition-all hover:shadow-ambient-lg ${filter === 'pending' ? 'ring-2 ring-amber-500' : ''}`}>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined filled">schedule</span>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-on-surface">{stats.pending}</div>
            <div className="text-xs font-semibold text-outline uppercase tracking-wide">Pending</div>
          </div>
        </button>

        <button onClick={() => setFilter('approved')} className={`bg-surface-container-lowest rounded-2xl p-5 shadow-ambient flex items-center gap-3 transition-all hover:shadow-ambient-lg ${filter === 'approved' ? 'ring-2 ring-green-500' : ''}`}>
          <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <span className="material-symbols-outlined filled">check_circle</span>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-on-surface">{stats.approved}</div>
            <div className="text-xs font-semibold text-outline uppercase tracking-wide">Approved</div>
          </div>
        </button>

        <button onClick={() => setFilter('rejected')} className={`bg-surface-container-lowest rounded-2xl p-5 shadow-ambient flex items-center gap-3 transition-all hover:shadow-ambient-lg ${filter === 'rejected' ? 'ring-2 ring-red-500' : ''}`}>
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <span className="material-symbols-outlined filled">cancel</span>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-on-surface">{stats.rejected}</div>
            <div className="text-xs font-semibold text-outline uppercase tracking-wide">Rejected</div>
          </div>
        </button>
      </div>

      {/* Requests List */}
      <div className="flex flex-col gap-4 pb-8">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl p-12 shadow-ambient text-center"
            >
              <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">inbox</span>
              <h3 className="text-xl font-bold text-on-surface mb-2">No requests found</h3>
              <p className="text-on-surface-variant">
                {filter === 'all' ? 'No quiz requests have been submitted yet.' : `No ${filter} requests.`}
              </p>
            </motion.div>
          ) : (
            filtered.map(req => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
                key={req.id} 
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient hover:shadow-ambient-lg transition-all group"
              >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* User & Topic Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-tertiary text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {req.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">{req.username}</div>
                      <div className="text-xs text-outline">{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="ml-auto md:ml-4">
                      {statusBadge(req.status)}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-on-surface mb-2">{req.topic}</h3>

                  {req.message && (
                    <p className="text-sm text-on-surface-variant mb-3 bg-surface-container-low rounded-lg p-3 border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[14px] mr-1 align-middle text-outline">chat</span>
                      {req.message}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {req.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-fixed text-primary">
                        <span className="material-symbols-outlined text-[14px]">{req.category.icon || 'category'}</span>
                        {req.category.name}
                      </span>
                    )}
                    {difficultyBadge(req.difficulty)}
                    {typeBadge(req.question_type)}
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-secondary-fixed text-on-secondary-fixed-variant">
                      {req.question_count} Questions
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex-col gap-2 shrink-0">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(req)}
                        disabled={actionPending === req.id}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                        Accept & Generate
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={actionPending === req.id}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-container-high text-on-surface-variant rounded-xl font-bold text-sm hover:bg-error-container hover:text-on-error-container transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(req.id)}
                    disabled={actionPending === req.id}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-outline hover:text-error hover:bg-error-container/50 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Delete
                  </button>
                </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
