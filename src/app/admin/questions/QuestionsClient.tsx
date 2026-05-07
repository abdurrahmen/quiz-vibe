'use client'

import { useState, useMemo } from 'react'
import type { Question, Category } from '@/lib/types'
import { deleteQuestion, updateQuestion, bulkDeleteQuestions } from './actions'
import { toast } from 'react-hot-toast'

export default function QuestionsClient({ initialQuestions, categories }: { initialQuestions: any[], categories: Category[] }) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [isPending, setIsPending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter ? q.category_id === categoryFilter : true
      return matchesSearch && matchesCategory
    })
  }, [questions, searchQuery, categoryFilter])

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredQuestions.map(q => q.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    setIsPending(true)
    const result = await deleteQuestion(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setQuestions(questions.filter(q => q.id !== id))
      setSelectedIds(selectedIds.filter(i => i !== id))
      toast.success('Question deleted')
    }
    setIsPending(false)
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} questions?`)) return

    setIsPending(true)
    const result = await bulkDeleteQuestions(selectedIds)
    if (result.error) {
      toast.error(result.error)
    } else {
      setQuestions(questions.filter(q => !selectedIds.includes(q.id)))
      setSelectedIds([])
      toast.success(`${selectedIds.length} questions deleted`)
    }
    setIsPending(false)
  }

  const openEditModal = (question: any) => {
    setEditingQuestion(question)
    setIsEditModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingQuestion({
      id: '',
      question_text: '',
      category_id: categories[0]?.id || '',
      type: 'SCQ',
      difficulty: 'medium',
      points: 10,
      options: ['', '', '', ''],
      correct_answers: [0],
      explanation: '',
      created_at: new Date().toISOString()
    } as any)
    setIsEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingQuestion) return

    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    
    const options: string[] = []
    let i = 0
    while (formData.has(`option${i}`)) {
      const opt = formData.get(`option${i}`) as string
      if (opt) options.push(opt)
      i++
    }

    const correct_answers = Array.from(formData.getAll('correct_answers')).map(Number)

    const questionData = {
      question_text: formData.get('question_text'),
      category_id: formData.get('category_id'),
      type: formData.get('type'),
      difficulty: formData.get('difficulty'),
      points: Number(formData.get('points')),
      explanation: formData.get('explanation'),
      options,
      correct_answers
    }

    let result
    if (editingQuestion.id) {
      result = await updateQuestion(editingQuestion.id, questionData)
    } else {
      // Need a createQuestion action
      const { createQuestion } = await import('./actions')
      result = await createQuestion(questionData)
    }

    if (result.error) {
      toast.error(result.error)
    } else {
      if (editingQuestion.id) {
        setQuestions(questions.map(q => q.id === editingQuestion.id ? { ...q, ...questionData, category: categories.find(c => c.id === questionData.category_id) } : q))
        toast.success('Question updated')
      } else {
        // Just reload for simplicity when creating new to get the ID from DB
        window.location.reload()
      }
      setIsEditModalOpen(false)
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
        <div className="flex flex-wrap gap-4">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="bg-error-container text-on-error-container border-2 border-error/20 hover:border-error font-semibold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-error transition-all shadow-sm animate-fade-in"
            >
              <span className="material-symbols-outlined">delete</span>
              Delete Selected ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={openCreateModal}
            className="bg-surface text-primary border-2 border-primary/20 hover:border-primary font-semibold py-2 px-6 rounded-xl flex items-center gap-2 hover:bg-primary-fixed transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">add</span>
            New Question
          </button>
          <a href="/admin/ai-generator" className="bg-gradient-to-r from-primary to-tertiary text-white font-semibold py-2 px-6 rounded-xl flex items-center gap-2 shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all">
            <span className="material-symbols-outlined filled">auto_awesome</span>
            Generate Questions
          </a>
        </div>
      </div>

      {/* Filters & Tools Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-variant text-on-surface rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full md:w-48">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none bg-surface-container-low border border-surface-variant text-on-surface font-medium rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
            >
              <option value="">All Categories</option>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-4 text-on-surface-variant text-sm font-medium">
          <span>Showing {filteredQuestions.length} of {questions?.length || 0} questions</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden flex-1 border border-surface-variant/50">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-sm font-semibold border-b border-surface-variant">
                <th className="py-4 px-6 w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0}
                    className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" 
                  />
                </th>
                <th className="py-4 px-6 w-24">ID</th>
                <th className="py-4 px-6">Question Text</th>
                <th className="py-4 px-6 w-32">Type</th>
                <th className="py-4 px-6 w-40">Category</th>
                <th className="py-4 px-6 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {filteredQuestions?.map((q, idx) => {
                const isSCQ = q.type === 'SCQ'
                const isMCQ = q.type === 'MCQ'
                const isSelected = selectedIds.includes(q.id)
                
                return (
                  <tr key={q.id} className={`hover:bg-surface-container-low/50 transition-colors group ${isPending ? 'opacity-50 pointer-events-none' : ''} ${isSelected ? 'bg-primary-fixed/20' : ''}`}>
                    <td className="py-4 px-6 text-center">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleSelectOne(q.id)}
                        className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" 
                      />
                    </td>
                    <td className="py-4 px-6 text-outline font-mono text-xs">#Q-{(q.id).slice(0,4)}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="truncate max-w-[300px] lg:max-w-[500px] font-semibold text-on-surface group-hover:text-primary transition-colors" title={q.question_text}>
                          {q.question_text}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-outline-variant">
                          {q.difficulty} • {q.points} Points
                        </div>
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
                      <div className="flex justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(q)}
                          className="text-outline hover:text-primary transition-colors p-2 rounded-xl hover:bg-primary-fixed/50"
                          title="Edit Question"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(q.id)} 
                          className="text-outline hover:text-error transition-colors p-2 rounded-xl hover:bg-error-container/80"
                          title="Delete Question"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              
              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline">
                        <span className="material-symbols-outlined text-4xl">search_off</span>
                      </div>
                      <div>
                        <p className="text-on-surface font-bold text-lg">No questions match your search</p>
                        <p className="text-on-surface-variant">Try adjusting your filters or search term.</p>
                      </div>
                      <button 
                        onClick={() => {setSearchQuery(''); setCategoryFilter('')}}
                        className="mt-2 text-primary font-bold hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-surface rounded-3xl shadow-ambient-lg max-w-2xl w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-on-surface">Edit Question</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Question Text</label>
                  <textarea 
                    name="question_text" 
                    defaultValue={editingQuestion.question_text} 
                    required
                    rows={3}
                    className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none resize-none transition-all" 
                    placeholder="Enter your question here..." 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Category</label>
                    <select 
                      name="category_id" 
                      defaultValue={editingQuestion.category_id}
                      className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Difficulty</label>
                    <select 
                      name="difficulty" 
                      defaultValue={editingQuestion.difficulty}
                      className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Type</label>
                    <select 
                      name="type" 
                      defaultValue={editingQuestion.type}
                      className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none"
                    >
                      <option value="SCQ">Single Choice (SCQ)</option>
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="TF">True / False</option>
                    </select>
                  </div>
                  {/* Points */}
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Points</label>
                    <input 
                      type="number" 
                      name="points" 
                      defaultValue={editingQuestion.points}
                      min={1}
                      className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none"
                    />
                  </div>
                </div>

                {/* Options Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-on-surface">Options & Correct Answers</label>
                  <p className="text-xs text-on-surface-variant mb-2">Check the box next to the correct answer(s).</p>
                  
                  {editingQuestion.options.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        name="correct_answers" 
                        value={idx}
                        defaultChecked={editingQuestion.correct_answers.includes(idx)}
                        className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                      />
                      <input 
                        type="text" 
                        name={`option${idx}`} 
                        defaultValue={option} 
                        required
                        className="flex-1 bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-2 outline-none"
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                  ))}
                  {/* If fewer than 4 options, allow adding more? For now let's keep it fixed to what's there or 4 max */}
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Explanation (Optional)</label>
                  <textarea 
                    name="explanation" 
                    defaultValue={editingQuestion.explanation || ''} 
                    rows={2}
                    className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none resize-none transition-all" 
                    placeholder="Explain why the answers are correct..." 
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 border-t border-surface-variant">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-1 py-3 px-4 font-bold bg-primary text-white rounded-xl shadow-primary hover:shadow-primary-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  )
}
