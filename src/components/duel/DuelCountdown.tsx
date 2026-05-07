'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface DuelCountdownProps {
  onComplete: () => void
}

export default function DuelCountdown({ onComplete }: DuelCountdownProps) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count === 0) {
      const t = setTimeout(onComplete, 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, onComplete])

  return (
    <div className="min-h-screen bg-linear-to-br from-primary to-tertiary flex flex-col items-center justify-center gap-8">
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white/80 font-bold text-xl uppercase tracking-widest"
      >
        Get Ready!
      </motion.p>

      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative"
        >
          {count === 0 ? (
            <span className="text-9xl font-black text-yellow-300 drop-shadow-lg">GO!</span>
          ) : (
            <>
              <span className="text-9xl font-black text-white drop-shadow-lg">{count}</span>
              {/* Ring animation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-4 border-white/50"
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-8 text-white/60 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base">quiz</span>
          10 Questions
        </span>
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base">timer</span>
          Race for speed
        </span>
      </motion.div>
    </div>
  )
}
