'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      // If it's a link and has an href starting with #
      if (link && link.getAttribute('href')?.startsWith('#')) {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          e.preventDefault();
          e.stopPropagation();
          lenis.scrollTo(href);
        }
      }
    };

    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
