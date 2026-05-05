'use client'

import { useState } from 'react'
import type { AttemptAnswer } from '@/lib/types'

export default function ResultsClient({ answers }: { answers: AttemptAnswer[] }) {
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredAnswers = answers.filter(a => {
    if (filter === 'all') return true
    if (filter === 'correct') return a.is_correct
    return !a.is_correct
  })

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-y-4">
        <h3 className="text-2xl font-bold text-on-surface">Question Review</h3>
        
        {/* Filters */}
        <div className="flex bg-surface-container-low rounded-xl p-1 border border-surface-variant">
          <button 
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
              filter === 'all' 
                ? 'bg-primary-container text-on-primary-container shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/50'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('correct')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
              filter === 'correct' 
                ? 'bg-green-100 text-green-800 shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/50'
            }`}
          >
            Correct
          </button>
          <button 
            onClick={() => setFilter('wrong')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
              filter === 'wrong' 
                ? 'bg-error-container text-on-error-container shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/50'
            }`}
          >
            Wrong
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="flex flex-col gap-4">
        {filteredAnswers.map((answer, index) => {
          const isExpanded = expandedId === answer.question_id
          const hasAnswered = answer.selected_answers.length > 0
          
          let statusColor = "border-outline"
          let icon = "help"
          let iconColor = "text-outline"
          
          if (answer.is_correct) {
            statusColor = "border-primary"
            icon = "check_circle"
            iconColor = "text-primary"
          } else if (hasAnswered) {
            statusColor = "border-error"
            icon = "cancel"
            iconColor = "text-error"
          }

          return (
            <div 
              key={answer.question_id}
              onClick={() => setExpandedId(isExpanded ? null : answer.question_id)}
              className={`bg-surface-container-lowest rounded-2xl shadow-ambient border-l-4 ${statusColor} overflow-hidden group cursor-pointer hover:shadow-ambient-lg transition-all duration-300`}
            >
              <div className="p-6 flex items-start gap-5">
                <div className="flex-shrink-0 mt-1">
                  <span className={`material-symbols-outlined ${iconColor} filled text-2xl`}>{icon}</span>
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Question {index + 1}
                    </span>
                    <span className={`material-symbols-outlined text-outline-variant transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:text-primary'}`}>
                      expand_more
                    </span>
                  </div>
                  
                  <p className="text-lg font-medium text-on-surface mb-3 pr-8">
                    {answer.question_text}
                  </p>

                  {/* Collapsed view short summary */}
                  {!isExpanded && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold text-on-surface-variant block mb-1">Your Answer</span>
                      {hasAnswered ? (
                        <p className={`text-sm font-medium truncate ${answer.is_correct ? 'text-primary' : 'text-error line-through'}`}>
                          {answer.selected_answers.map(i => answer.options[i]).join(', ')}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-outline italic">No answer provided</p>
                      )}
                    </div>
                  )}

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-6 space-y-4 animate-fade-in border-t border-surface-variant pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface-container-low p-4 rounded-xl border border-surface-variant">
                          <span className="text-xs font-semibold text-on-surface-variant block mb-2 uppercase tracking-wide">Your Answer</span>
                          {hasAnswered ? (
                            <ul className="space-y-1">
                              {answer.selected_answers.map(i => (
                                <li key={i} className={`text-sm font-medium ${answer.is_correct ? 'text-primary' : 'text-error line-through'}`}>
                                  {answer.options[i]}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm font-medium text-outline italic">Skipped</p>
                          )}
                        </div>
                        
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                          <span className="text-xs font-semibold text-primary block mb-2 uppercase tracking-wide">Correct Answer</span>
                          <ul className="space-y-1">
                            {answer.correct_answers.map(i => (
                              <li key={i} className="text-sm font-medium text-primary">
                                {answer.options[i]}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {answer.explanation && (
                        <div className="bg-surface-container-highest p-4 rounded-xl border border-outline-variant mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">lightbulb</span>
                            <span className="text-sm font-bold text-on-surface">Explanation</span>
                          </div>
                          <p className="text-sm text-on-surface-variant leading-relaxed">
                            {answer.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filteredAnswers.length === 0 && (
          <div className="text-center py-12 bg-surface-container-low rounded-2xl border border-dashed border-outline">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">sentiment_dissatisfied</span>
            <p className="text-on-surface-variant font-medium">No questions match this filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
