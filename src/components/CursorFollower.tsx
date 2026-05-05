'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

export default function CursorFollower() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const isVisible = useRef(false)
  const opacity = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 }
  const smoothX = useSpring(cursorX, springConfig)
  const smoothY = useSpring(cursorY, springConfig)
  const smoothOpacity = useSpring(opacity, { damping: 20, stiffness: 300 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Offset by half of w-80 (320px / 2 = 160) to center on cursor
      cursorX.set(e.clientX - 160)
      cursorY.set(e.clientY - 160)
      if (!isVisible.current) {
        isVisible.current = true
        opacity.set(1)
      }
    }

    const handleMouseLeave = () => {
      isVisible.current = false
      opacity.set(0)
    }

    const handleMouseEnter = () => {
      isVisible.current = true
      opacity.set(1)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [cursorX, cursorY, opacity])

  return (
    <motion.div
      className="fixed top-0 left-0 w-80 h-80 rounded-full pointer-events-none z-50 blur-3xl hidden md:block"
      style={{
        x: smoothX,
        y: smoothY,
        opacity: smoothOpacity,
        background: 'radial-gradient(circle, rgba(103,93,249,0.2) 0%, rgba(77,65,223,0.05) 50%, transparent 70%)',
      }}
    />
  )
}
