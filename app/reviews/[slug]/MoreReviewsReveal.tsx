'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import styles from './ReviewPage.module.css'

export default function MoreReviewsReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.dataset.ready = '' // enables CSS animations only when JS runs
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.moreGridVisible)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={styles.moreGrid}>
      {children}
    </div>
  )
}
