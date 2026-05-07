'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Category } from '@/lib/types'
import { generateQuestions, createCategoryAction } from './actions'

export default function AIGeneratorPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[40px]">sync</span>
      </main>
    }>
      <AIGenerator />
    </Suspense>
  )
}

function AIGenerator() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  // Form State — initialized from URL search params (from quiz request accept flow)
  const [topic, setTopic] = useState(searchParams.get('topic') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '')
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'medium')
  const [questionType, setQuestionType] = useState(searchParams.get('type') || 'MCQ')
  const [count, setCount] = useState(parseInt(searchParams.get('count') || '5'))
  const [additionalInstructions, setAdditionalInstructions] = useState('')

  // Preview State
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])

  // Inline new category state
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(!!searchParams.get('newCategory'))
  const [newCatName, setNewCatName] = useState(searchParams.get('newCategory') || '')
  const [newCatIcon, setNewCatIcon] = useState('category')
  const [newCatColor, setNewCatColor] = useState('#4d41df')
  const [creatingCategory, setCreatingCategory] = useState(false)

  // Sync form fields from URL params when they change (e.g. router.push from quiz-requests accept)
  // This handles the case where the component is already mounted and params change client-side
  useEffect(() => {
    const newTopic = searchParams.get('topic') || ''
    const newCategoryId = searchParams.get('category') || ''
    const newDifficulty = searchParams.get('difficulty') || 'medium'
    const newQuestionType = searchParams.get('type') || 'MCQ'
    const newCount = parseInt(searchParams.get('count') || '5')
    const newCategoryName = searchParams.get('newCategory') || ''

    setTopic(newTopic)
    setCategoryId(newCategoryId)
    setDifficulty(newDifficulty)
    setQuestionType(newQuestionType)
    setCount(newCount)

    if (newCategoryName) {
      setNewCatName(newCategoryName)
      setShowNewCategoryForm(true)
      setCategoryId('') // no existing category, need to create
    } else {
      // Only hide form if there's no pending new category name
      setShowNewCategoryForm(false)
      setNewCatName('')
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return
    setCreatingCategory(true)
    try {
      const { data, error } = await createCategoryAction(newCatName.trim(), newCatIcon, newCatColor)
      
      if (error) throw new Error(error)
      if (data) {
        setCategories(prev => [...prev, data as Category].sort((a, b) => a.name.localeCompare(b.name)))
        setCategoryId(data.id)
        setShowNewCategoryForm(false)
        setNewCatName('')
        setNewCatIcon('category')
        setNewCatColor('#4d41df')
        
        // Update URL via router to ensure Next.js state stays in sync
        const params = new URLSearchParams(searchParams.toString())
        if (params.has('newCategory')) {
          params.delete('newCategory')
        }
        // Set the newly created category in the URL params so that server revalidations 
        // don't overwrite our local state with an empty ID!
        params.set('category', data.id)
        router.replace(`?${params.toString()}`, { scroll: false })
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create category')
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic || !categoryId) return

    setGenerating(true)

    try {
      const result = await generateQuestions({
        topic,
        categoryId,
        difficulty,
        questionType,
        count,
        additionalInstructions
      } as any)

      if (result.error) {
        alert(result.error)
        setGenerating(false)
        return
      }

      if (result.data) {
        setGeneratedQuestions(result.data)
      }
    } catch (err) {
      console.error(err)
      alert('An unexpected error occurred during generation.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveToDatabase = async () => {
    if (generatedQuestions.length === 0) return

    setLoading(true)
    try {
      const supabase = createClient()

      // Map mock data to db format
      const toInsert = generatedQuestions.map(q => ({
        category_id: categoryId,
        question_text: q.question_text,
        type: q.type,
        difficulty: q.difficulty,
        options: q.options,
        correct_answers: q.correct_answers,
        explanation: q.explanation,
        points: q.points
      }))

      const { error } = await supabase.from('questions').insert(toInsert)

      if (error) throw error

      alert('Questions saved successfully!')
      setGeneratedQuestions([])
      setTopic('')
    } catch (err) {
      console.error(err)
      alert('Failed to save questions.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col h-[calc(100vh-72px)] overflow-y-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-linear-to-r from-primary-container/20 to-tertiary-container/20 text-primary-fixed-variant px-4 py-1.5 rounded-full text-sm font-bold mb-4 border border-primary/10">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          Powered by Gemini 2.5 Flash
        </div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">AI Question Generator</h1>
        <p className="text-on-surface-variant max-w-2xl">
          Instantly generate high-quality, diverse questions for any topic. Let AI handle the heavy lifting while you review and approve.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8">
        {/* Left Column: Configuration Form */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <form onSubmit={handleGenerate} className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient">
            <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tune</span>
              Generation Parameters
            </h2>

            <div className="space-y-5">
              {/* Topic Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Target Topic / Subject Matter</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">subject</span>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Advanced React Hooks, World War II..."
                    className="w-full bg-surface border-2 border-surface-variant focus:border-primary rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-on-surface">Assign Category</label>
                  </div>
                  
                  <select
                    value={showNewCategoryForm ? 'CREATE_NEW' : categoryId}
                    onChange={e => {
                      if (e.target.value === 'CREATE_NEW') {
                        setShowNewCategoryForm(true)
                        setCategoryId('')
                      } else {
                        setShowNewCategoryForm(false)
                        setCategoryId(e.target.value)
                      }
                    }}
                    className="w-full bg-surface border-2 border-surface-variant focus:border-primary rounded-xl px-4 py-3 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    <option value="CREATE_NEW" className="font-bold text-primary">➕ Create New Category</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full bg-surface border-2 border-surface-variant focus:border-primary rounded-xl px-4 py-3 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Inline Create New Category Form */}
              {showNewCategoryForm && (
                <div className="bg-primary-fixed/10 border-2 border-primary/20 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">add_circle</span>
                      New Category
                    </p>
                    <button
                      type="button"
                      onClick={() => { setShowNewCategoryForm(false); setNewCatName(''); setCategoryId('') }}
                      className="text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Category name (e.g. Science, History...)"
                    className="w-full bg-surface border-2 border-surface-variant focus:border-primary rounded-xl px-4 py-2.5 outline-none transition-colors text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-on-surface-variant">Icon (Material Symbol)</label>
                      <input
                        type="text"
                        value={newCatIcon}
                        onChange={e => setNewCatIcon(e.target.value)}
                        placeholder="e.g. science, history"
                        className="w-full bg-surface border-2 border-surface-variant focus:border-primary rounded-xl px-3 py-2 outline-none transition-colors text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-on-surface-variant">Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={newCatColor}
                          onChange={e => setNewCatColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border-2 border-surface-variant cursor-pointer p-0.5"
                        />
                        <span className="text-xs text-outline font-mono">{newCatColor}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCatName.trim()}
                    className="w-full bg-primary text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {creatingCategory ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">save</span>Create &amp; Select Category</>
                    )}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Question Type */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface">Format</label>
                  <select
                    value={questionType}
                    onChange={e => setQuestionType(e.target.value)}
                    className="w-full bg-surface border-2 border-surface-variant focus:border-primary rounded-xl px-4 py-3 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="SCQ">Single Choice</option>
                    <option value="TF">True / False</option>
                  </select>
                </div>

                {/* Count */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-on-surface">Count</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1" max="20"
                      value={count}
                      onChange={e => setCount(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <span className="font-bold text-on-surface min-w-[24px] text-center">{count}</span>
                  </div>
                </div>
              </div>

              {/* Advanced Prompting */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface flex justify-between">
                  Additional Instructions
                  <span className="text-xs text-outline font-normal">Optional</span>
                </label>
                <textarea
                  value={additionalInstructions}
                  onChange={e => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Focus on practical scenarios, avoid date-based questions..."
                  className="w-full bg-surface border-2 border-surface-variant focus:border-primary rounded-xl p-4 outline-none transition-colors min-h-[100px] resize-y"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={generating || !topic || !categoryId || showNewCategoryForm}
                className="w-full bg-linear-to-r from-primary to-tertiary text-white font-bold py-4 px-6 rounded-xl shadow-primary hover:shadow-primary-lg transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:pointer-events-none"
              >
                {generating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Generating Content...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Generate {count} Questions
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Preview & Editor */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[600px]">
          <div className="bg-surface-container-lowest rounded-2xl shadow-ambient flex-1 flex flex-col overflow-hidden border border-outline-variant/30">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-surface-variant flex justify-between items-center bg-surface-bright">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">preview</span>
                Preview & Edit
              </h2>
              {generatedQuestions.length > 0 && (
                <div className="flex gap-2 text-sm">
                  <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-md font-semibold">
                    {generatedQuestions.length} Items
                  </span>
                </div>
              )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#fcf8ff]">
              {generatedQuestions.length === 0 ? (
                // Empty State
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                  <div className="w-24 h-24 mb-4 text-outline relative">
                    <span className="material-symbols-outlined text-[96px]">article</span>
                    <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-[48px] text-primary filled bg-[#fcf8ff] rounded-full border-4 border-[#fcf8ff]">auto_awesome</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">Awaiting Generation</h3>
                  <p className="text-on-surface-variant max-w-sm">
                    Configure your parameters on the left and click "Generate" to see AI-created questions appear here.
                  </p>
                </div>
              ) : (
                // Generated Content List
                <div className="flex flex-col gap-6">
                  {generatedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white border border-surface-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                      {/* Controls */}
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-outline hover:text-primary p-1.5 rounded bg-surface-container-highest transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button className="text-outline hover:text-error p-1.5 rounded bg-surface-container-highest transition-colors" onClick={() => setGeneratedQuestions(prev => prev.filter((_, i) => i !== idx))}>
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-surface-container-high text-on-surface-variant text-xs font-bold px-2 py-1 rounded">Q{idx + 1}</span>
                        <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-bold px-2 py-1 rounded">{q.type}</span>
                        <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-bold px-2 py-1 rounded capitalize">{q.difficulty}</span>
                      </div>

                      <p className="font-semibold text-lg text-on-surface mb-4 pr-16">{q.question_text}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isCorrect = q.correct_answers.includes(optIdx)
                          return (
                            <div key={optIdx} className={`p-3 rounded-lg border flex items-start gap-3 text-sm ${isCorrect ? 'bg-primary-fixed/30 border-primary text-primary-fixed-variant font-medium' : 'bg-surface border-surface-variant text-on-surface-variant'}`}>
                              <span className={`material-symbols-outlined text-[20px] ${isCorrect ? 'text-primary' : 'text-outline-variant'}`}>
                                {isCorrect ? 'check_circle' : 'radio_button_unchecked'}
                              </span>
                              <span>{opt}</span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="bg-surface-container p-4 rounded-lg border border-surface-variant text-sm flex gap-3">
                        <span className="material-symbols-outlined text-tertiary text-[20px]">lightbulb</span>
                        <p className="text-on-surface-variant leading-relaxed">
                          <span className="font-semibold text-on-surface mr-1">Explanation:</span>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="p-4 border-t border-surface-variant bg-surface flex justify-between items-center">
              <span className="text-sm font-medium text-on-surface-variant">
                {generatedQuestions.length > 0 ? 'Review carefully before saving' : 'No pending items'}
              </span>
              <button
                onClick={handleSaveToDatabase}
                disabled={generatedQuestions.length === 0 || loading}
                className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg shadow-sm hover:bg-primary-fixed-variant transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">save</span>
                )}
                Save to Database
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
