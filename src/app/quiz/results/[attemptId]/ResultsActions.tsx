'use client'

import Link from 'next/link'

export default function ResultsActions({
  score,
  categoryName,
  variant = 'default'
}: {
  score: number,
  categoryName: string,
  variant?: 'default' | 'icon'
}) {
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Quiz Results - QuizMaster Pro',
        text: `I scored ${score}% on the ${categoryName} quiz!`,
        url: window.location.href,
      }).catch(err => console.error('Share failed:', err))
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`I scored ${score}% on the ${categoryName} quiz on QuizMaster Pro! ${window.location.href}`)
      alert('Results copied to clipboard!')
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className="bg-surface-container-highest text-on-surface hover:bg-surface-dim transition-colors rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">share</span>
        Share
      </button>
    )
  }

  return (
    <div className="mt-12 pt-8 border-t border-surface-dim flex flex-col sm:flex-row gap-4 justify-center items-center pb-12">
      <Link
        href="/"
        className="w-full sm:w-auto px-10 py-4 rounded-xl bg-linear-to-r from-primary to-tertiary text-white font-bold shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">replay</span>
        Take Another Quiz
      </Link>
      <button
        onClick={handleShare}
        className="w-full sm:w-auto px-10 py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-all text-center flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[20px]">share</span>
        Share My Results
      </button>
    </div>
  )
}
