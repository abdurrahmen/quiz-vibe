'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Category } from '@/lib/types'
import { generateQuestions } from './actions'

export default function AIGenerator() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Form State
  const [topic, setTopic] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionType, setQuestionType] = useState('MCQ')
  const [count, setCount] = useState(5)
  const [additionalInstructions, setAdditionalInstructions] = useState('')

  // Preview State
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('*').order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

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
                  <label className="text-sm font-semibold text-on-surface">Assign Category</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full bg-surface border-2 border-surface-variant focus:border-primary rounded-xl px-4 py-3 outline-none transition-colors appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                disabled={generating || !topic || !categoryId}
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
