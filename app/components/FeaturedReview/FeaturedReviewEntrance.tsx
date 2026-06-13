'use client'

import { useEffect, useRef } from 'react'
import styles from './FeaturedReview.module.css'

export default function FeaturedReviewEntrance() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = ref.current?.closest(`.${styles.featuredWrap}`) as HTMLElement | null
    if (!wrap) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wrap.classList.add(styles.wrapVisible)
          observer.disconnect()
        }
      },
      { threshold: 0.75 }
    )
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  return <span ref={ref} style={{ display: 'none' }} aria-hidden />
}
