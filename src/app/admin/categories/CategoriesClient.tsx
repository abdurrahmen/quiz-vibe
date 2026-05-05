'use client'

import { useState } from 'react'
import type { Category } from '@/lib/types'
import { createCategory, updateCategory, deleteCategory } from './actions'

type EnrichedCategory = Category & { question_count: number, target: number }

export default function CategoriesClient({ initialCategories, stats }: { initialCategories: EnrichedCategory[], stats: any }) {
  const [categories, setCategories] = useState(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<EnrichedCategory | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  const openNewModal = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
    setError('')
  }

  const openEditModal = (cat: EnrichedCategory) => {
    setEditingCategory(cat)
    setIsModalOpen(true)
    setError('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will fail if there are questions attached.')) return
    
    setIsPending(true)
    const result = await deleteCategory(id)
    if (result.error) {
      alert(result.error)
    } else {
      setCategories(categories.filter(c => c.id !== id))
    }
    setIsPending(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    let result
    if (editingCategory) {
      result = await updateCategory(editingCategory.id, formData)
    } else {
      result = await createCategory(formData)
    }

    if (result.error) {
      setError(result.error)
    } else {
      // Re-fetch or just reload the page to get the updated data
      window.location.reload()
    }
    setIsPending(false)
  }

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Manage Categories</h1>
          <p className="text-on-surface-variant">Create, update, and monitor topic categories for your quizzes.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-gradient-to-r from-primary to-tertiary text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all"
        >
          <span className="material-symbols-outlined filled">add_box</span>
          New Category
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] filled">category</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-on-surface">{stats.totalCategories}</div>
            <div className="text-sm font-semibold text-outline uppercase tracking-wide">Total Categories</div>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] filled">quiz</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-on-surface">{stats.totalQuestions}</div>
            <div className="text-sm font-semibold text-outline uppercase tracking-wide">Total Questions</div>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] filled">equalizer</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-on-surface">{stats.avgPerCategory}</div>
            <div className="text-sm font-semibold text-outline uppercase tracking-wide">Avg Qs / Category</div>
          </div>
        </div>
      </div>

      {/* Categories Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
        {categories.map((category) => {
          const progressPercent = Math.min(100, Math.round((category.question_count / category.target) * 100))
          
          return (
            <div key={category.id} className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex flex-col group relative overflow-hidden">
              {/* Actions Overlay */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                <button onClick={() => openEditModal(category)} className="text-outline hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary-fixed/50" title="Edit Category">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button onClick={() => handleDelete(category.id)} className="text-outline hover:text-error transition-colors p-1.5 rounded-md hover:bg-error-container/80" title="Delete Category">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>

              {/* Decorative gradient corner */}
              <div 
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: category.color || '#4d41df' }}
              />

              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                  style={{ backgroundColor: category.color || '#4d41df' }}
                >
                  <span className="material-symbols-outlined text-[32px]">{category.icon || 'category'}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">{category.name}</h3>
                  <p className="text-sm text-on-surface-variant line-clamp-1">{category.description || 'No description provided'}</p>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-on-surface leading-none">{category.question_count}</span>
                    <span className="text-xs font-semibold text-outline uppercase tracking-wider mt-1">Questions</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-on-surface-variant">Target: {category.target}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${progressPercent}%`, 
                      backgroundColor: category.color || '#4d41df' 
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-right text-outline-variant font-medium">
                  {progressPercent}% to target
                </div>
              </div>
            </div>
          )
        })}

        {/* Add New Card */}
        <button onClick={openNewModal} className="bg-surface-container-low border-2 border-dashed border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-outline hover:text-primary hover:border-primary hover:bg-primary-fixed/30 transition-all group min-h-[220px]">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest group-hover:bg-white flex items-center justify-center transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[32px]">add</span>
          </div>
          <span className="font-bold text-lg">Add New Category</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-surface rounded-3xl shadow-ambient-lg max-w-md w-full p-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-on-surface mb-6">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h2>
            {error && <div className="mb-4 bg-error-container text-on-error-container p-3 rounded-xl text-sm font-medium">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingCategory?.name} 
                  required
                  className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none" 
                  placeholder="e.g. Science" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Description</label>
                <textarea 
                  name="description" 
                  defaultValue={editingCategory?.description || ''} 
                  className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none min-h-[100px]" 
                  placeholder="Short description..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Icon (Material)</label>
                  <input 
                    type="text" 
                    name="icon" 
                    defaultValue={editingCategory?.icon || 'category'} 
                    className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 outline-none" 
                    placeholder="e.g. public" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-1">Color (Hex)</label>
                  <input 
                    type="color" 
                    name="color" 
                    defaultValue={editingCategory?.color || '#4d41df'} 
                    className="w-full h-12 bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-2 outline-none cursor-pointer" 
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-1 py-3 px-4 font-bold bg-primary text-white rounded-xl shadow-primary hover:shadow-primary-lg transition-all disabled:opacity-70"
                >
                  {isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
