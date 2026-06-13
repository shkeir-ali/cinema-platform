'use client'

import { useEffect, useRef } from 'react'
import styles from './FeaturedEssay.module.css'

export default function FeaturedEssayEntrance() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const section = ref.current?.closest(`.${styles.essaySection}`) as HTMLElement | null
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add(styles.sectionVisible)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return <span ref={ref} style={{ display: 'none' }} aria-hidden />
}
