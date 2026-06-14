'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './ReviewPage.module.css'

const STAR_POINTS = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26'

export default function ScoreBlock({ rating }: { rating: number }) {
  const [displayed, setDisplayed] = useState(0)
  const [triggered, setTriggered] = useState(false)
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isMasterpiece = rating === 5

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect() } },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!triggered) return
    const duration = 2200
    const startTime = performance.now()
    let raf: number

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(eased * rating)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setDisplayed(rating)
        // small beat of silence before the shimmer fires
        if (isMasterpiece) setTimeout(() => setDone(true), 180)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [triggered, rating, isMasterpiece])

  const full = Math.floor(displayed)
  const half = displayed % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half

  return (
    <div
      ref={ref}
      className={`${styles.scoreBlock} ${triggered ? styles.scoreBlockVisible : ''} ${isMasterpiece && done ? styles.scoreBlockMasterpiece : ''}`}
    >
      <div className={`${styles.scoreNumber} ${done ? styles.scoreNumberPerfect : ''}`}>
        {displayed.toFixed(1)}
      </div>
      <div className={styles.scoreOutOf}>out of 5</div>
      <div
        className={`${styles.scoreStars} ${done ? styles.starsShimmer : ''}`}
        aria-label={`${rating} out of 5`}
      >
        {Array.from({ length: full }).map((_, i) => (
          <svg key={`f${i}`} viewBox="0 0 24 24">
            <polygon points={STAR_POINTS} fill="currentColor" />
          </svg>
        ))}
        {half ? (
          <svg key="h" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="scoreHalfStar">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <polygon points={STAR_POINTS} fill="url(#scoreHalfStar)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        ) : null}
        {Array.from({ length: empty }).map((_, i) => (
          <svg key={`e${i}`} viewBox="0 0 24 24">
            <polygon points={STAR_POINTS} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        ))}
      </div>
      {isMasterpiece && (
        <div className={`${styles.masterpieceLabel} ${done ? styles.masterpieceLabelVisible : ''}`}>
          Masterpiece
        </div>
      )}
    </div>
  )
}
