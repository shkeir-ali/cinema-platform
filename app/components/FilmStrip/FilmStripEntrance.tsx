'use client'

import { useEffect, useRef } from 'react'
import styles from './FilmStrip.module.css'

export default function FilmStripEntrance() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = ref.current?.closest(`.${styles.filmstripWrap}`) as HTMLElement | null
    if (!wrap) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wrap.classList.add(styles.stripVisible)
          setTimeout(() => wrap.classList.add(styles.stripRolling), 400)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  return <span ref={ref} style={{ display: 'none' }} aria-hidden />
}
