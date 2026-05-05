'use client'

import { useState } from 'react'
import type { Question } from '@/lib/types'
import { deleteQuestion } from './actions'

export default function QuestionsClient({ initialQuestions, categories }: { initialQuestions: any[], categories: any[] }) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    setIsPending(true)
    const result = await deleteQuestion(id)
    if (result.error) {
      alert(result.error)
    } else {
      setQuestions(questions.filter(q => q.id !== id))
    }
    setIsPending(false)
  }

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Question Bank</h1>
          <p className="text-on-surface-variant">Manage, edit, and organize all your quiz questions in one central repository.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-surface text-secondary border-2 border-secondary/20 hover:border-secondary font-semibold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-secondary-fixed transition-all shadow-sm">
            <span className="material-symbols-outlined">delete</span>
            Bulk Delete
          </button>
          <a href="/admin/ai-generator" className="bg-gradient-to-r from-primary to-tertiary text-white font-semibold py-2 px-6 rounded-xl flex items-center gap-2 shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all">
            <span className="material-symbols-outlined filled">auto_awesome</span>
            Generate Questions
          </a>
        </div>
      </div>

      {/* Filters & Tools Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none md:w-48">
            <select className="w-full appearance-none bg-surface-container-low border border-surface-variant text-on-surface font-medium rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-colors">
              <option value="">All Categories</option>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-4 text-on-surface-variant text-sm font-medium">
          <span>Showing 1-{Math.min(50, questions?.length || 0)} of {questions?.length || 0} questions</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden flex-1">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-sm font-semibold border-b border-surface-variant">
                <th className="py-4 px-6 w-12 text-center">
                  <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                </th>
                <th className="py-4 px-6 w-24">ID</th>
                <th className="py-4 px-6">Question Text</th>
                <th className="py-4 px-6 w-32">Type</th>
                <th className="py-4 px-6 w-40">Category</th>
                <th className="py-4 px-6 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {questions?.map((q, idx) => {
                const isSCQ = q.type === 'SCQ'
                const isMCQ = q.type === 'MCQ'
                
                return (
                  <tr key={q.id} className={`hover:bg-surface-container-low/50 transition-colors group ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                    <td className="py-4 px-6 text-center">
                      <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="py-4 px-6 text-outline font-mono text-sm">#Q-{(q.id).slice(0,4)}</td>
                    <td className="py-4 px-6">
                      <div className="truncate max-w-[300px] lg:max-w-[500px] font-medium text-on-surface" title={q.question_text}>
                        {q.question_text}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container-highest text-on-surface-variant">
                        {q.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isMCQ ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 
                        isSCQ ? 'bg-primary-fixed text-on-primary-fixed-variant' : 
                        'bg-secondary-fixed text-on-secondary-fixed-variant'
                      }`}>
                        {q.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-outline hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary-fixed/50">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="text-outline hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error-container/80">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {(!questions || questions.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                    No questions found. Click "Generate Questions" to create some.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
