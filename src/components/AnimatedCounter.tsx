'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView } from 'motion/react'

export function AnimatedCounter({ value, suffix = "" }: { value: number | string, suffix?: string }) {
  // Parse the numeric part and keep any string suffix from the value
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0 : value;
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, numValue, { duration: 2, ease: "easeOut" })
      return animation.stop
    }
  }, [numValue, count, isInView])

  return (
    <span ref={ref} className="inline-block">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}
