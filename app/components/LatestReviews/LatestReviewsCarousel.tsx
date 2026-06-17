'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import PosterImage from '@/app/components/PosterImage'
import styles from './LatestReviews.module.css'

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'

type Review = {
  slug: string
  title: string
  director: string
  releaseYear: number
  posterPath: string
  genres: string[]
  myRating: number
}

const S = 9
const svgProps    = { width: S,  height: S,  viewBox: '0 0 24 24', style: { display: 'inline' as const, verticalAlign: 'middle' } }
const svgPropsFull = { width: 10, height: 10, viewBox: '0 0 24 24', style: { display: 'inline' as const, verticalAlign: 'middle' } }
const points  = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26'

const FullStar  = () => <svg {...svgPropsFull}><polygon points={points} fill="currentColor" /></svg>
const HalfStar  = () => (
  <svg {...svgProps}>
    <defs>
      <linearGradient id="hsg">
        <stop offset="50%" stopColor="currentColor" />
        <stop offset="50%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <polygon points={points} fill="url(#hsg)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
const EmptyStar = () => <svg {...svgProps}><polygon points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>

function toStars(rating: number) {
  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return (
    <>
      {Array.from({ length: full  }).map((_, i) => <FullStar  key={`f${i}`} />)}
      {half ? <HalfStar key="h" /> : null}
      {Array.from({ length: empty }).map((_, i) => <EmptyStar key={`e${i}`} />)}
    </>
  )
}

export default function LatestReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const trackRef   = useRef<HTMLDivElement>(null)
  const prevRef    = useRef<HTMLButtonElement>(null)
  const nextRef    = useRef<HTMLButtonElement>(null)
  const wrapRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    const prev  = prevRef.current
    const next  = nextRef.current
    if (!track || !prev || !next) return

    // Clone all cards and append — gives us [originals][clones]
    const originals = Array.from(track.querySelectorAll(`.${styles.reviewCard}`))
    originals.forEach(c => track.appendChild(c.cloneNode(true)))
    const n = originals.length

    function cardSlotWidth() {
      const card = originals[0] as HTMLElement
      const gap = parseFloat(getComputedStyle(track).gap) || 0
      return card.offsetWidth + gap
    }

    function scrollAmount() {
      return window.innerWidth <= 768 ? cardSlotWidth() : cardSlotWidth() * 2
    }

    // After a smooth scroll settles, if we're in clone territory, jump silently back
    let scrollTimer: ReturnType<typeof setTimeout>
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        const half = cardSlotWidth() * n
        if (track.scrollLeft >= half) {
          track.style.scrollBehavior = 'auto'
          track.scrollLeft -= half
          // Force reflow so the browser applies the position before re-enabling smooth
          void track.offsetHeight
          track.style.scrollBehavior = ''
        }
      }, 50)
    })

    next.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount(), behavior: 'smooth' })
    })

    prev.addEventListener('click', () => {
      const half = cardSlotWidth() * n
      // If going prev would take us below 0, jump to clone zone first
      if (track.scrollLeft - scrollAmount() < 0) {
        track.style.scrollBehavior = 'auto'
        track.scrollLeft += half
        void track.offsetHeight
        track.style.scrollBehavior = ''
      }
      track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' })
    })

    prev.disabled = false
    next.disabled = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wrapRef.current?.classList.add(styles.wrapVisible)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (wrapRef.current) observer.observe(wrapRef.current)
  }, [])

  return (
    <div className={styles.carouselWrap} ref={wrapRef}>
      <button className={`${styles.carouselBtn} ${styles.prevBtn}`} ref={prevRef}>&#8592;</button>
      <div className={styles.reviewGrid} ref={trackRef}>
        {reviews.map(r => (
          <Link key={r.slug} href={`/reviews/${r.slug}`} className={styles.reviewCard}>
            <div className={styles.cardPoster}>
              <div className={styles.cardPosterBg} />
              <PosterImage className={styles.cardPosterImg} src={`${TMDB_IMG}${r.posterPath}`} alt={r.title} genre={r.genres[0]} loading="lazy" />
              <div className={styles.cardPosterOverlay}>
                <span className={styles.cardOverlayArrow}>→</span>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardGenreTag}>{r.genres[0]}</div>
              <div className={styles.cardTitle}>{r.title}</div>
            </div>
            <div className={styles.cardMeta}>
              <div className={styles.cardStars}>{toStars(r.myRating)}</div>
              <div className={styles.cardInfo}>{r.director} · {r.releaseYear}</div>
            </div>
          </Link>
        ))}
      </div>
      <button className={`${styles.carouselBtn} ${styles.nextBtn}`} ref={nextRef}>&#8594;</button>
    </div>
  )
}
