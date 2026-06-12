'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './LatestReviews.module.css'

const reviews = [
  { slug: 'blade-runner-2049', genre: 'Sci-Fi',   title: 'Blade Runner 2049',      stars: '★★★★★', director: 'Villeneuve',   year: 2017, poster: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' },
  { slug: 'the-godfather',     genre: 'Drama',    title: 'The Godfather',          stars: '★★★★★', director: 'Coppola',      year: 1972, poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg' },
  { slug: 'parasite',          genre: 'Thriller', title: 'Parasite',               stars: '★★★★★', director: 'Bong Joon-ho', year: 2019, poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg' },
  { slug: 'in-the-mood',       genre: 'Romance',  title: 'In the Mood for Love',   stars: '★★★★★', director: 'Wong Kar-wai', year: 2000, poster: 'https://image.tmdb.org/t/p/w500/iYypPT4bhqXfq1b6EnmxvRt6b2Y.jpg' },
  { slug: 'hereditary',        genre: 'Horror',   title: 'Hereditary',             stars: '★★★★☆', director: 'Ari Aster',   year: 2018, poster: 'https://image.tmdb.org/t/p/w500/4GFPuL14eXi66V96xBWY73Y9PfR.jpg' },
  { slug: 'mulholland-drive',  genre: 'Thriller', title: 'Mulholland Drive',       stars: '★★★★★', director: 'David Lynch',  year: 2001, poster: 'https://image.tmdb.org/t/p/w500/x7A59t6ySylr1L7aubOQEA480vM.jpg' },
  { slug: 'no-country',        genre: 'Thriller', title: 'No Country for Old Men', stars: '★★★★★', director: 'Coen Bros',   year: 2007, poster: 'https://image.tmdb.org/t/p/w500/6d5XOczc226jECq0LIX0siKtgHR.jpg' },
  { slug: '2001',              genre: 'Sci-Fi',   title: '2001: A Space Odyssey',  stars: '★★★★★', director: 'Kubrick',     year: 1968, poster: 'https://image.tmdb.org/t/p/w500/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg' },
]

export default function LatestReviews() {
  const trackRef = useRef<HTMLDivElement>(null)
  const prevRef  = useRef<HTMLButtonElement>(null)
  const nextRef  = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const track = trackRef.current
    const prev  = prevRef.current
    const next  = nextRef.current
    if (!track || !prev || !next) return

    // Clone all cards for the infinite loop effect
    const originals = Array.from(track.querySelectorAll(`.${styles.reviewCard}`))
    originals.forEach(c => track.appendChild(c.cloneNode(true)))
    const totalCards = originals.length

    function cardWidth() {
      const card = track.querySelector(`.${styles.reviewCard}`) as HTMLElement | null
      return card ? card.offsetWidth + 20 : 0
    }
    function scrollAmount() {
      return window.innerWidth <= 768 ? cardWidth() : cardWidth() * 2
    }
    function loopCheck() {
      const cw = cardWidth()
      const halfPoint = cw * totalCards
      if (track.scrollLeft >= halfPoint) track.scrollLeft -= halfPoint
      if (track.scrollLeft <= 0 && (track as any)._loopDir === 'prev') track.scrollLeft += halfPoint
    }

    prev.addEventListener('click', () => {
      ;(track as any)._loopDir = 'prev'
      const target = track.scrollLeft - scrollAmount()
      if (target < 0) track.scrollLeft += cardWidth() * totalCards
      track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' })
    })
    next.addEventListener('click', () => {
      ;(track as any)._loopDir = 'next'
      track.scrollBy({ left: scrollAmount(), behavior: 'smooth' })
    })

    track.addEventListener('scroll', loopCheck)
    prev.disabled = false
    next.disabled = false
  }, [])

  return (
    <div className={styles.reviewsSection}>
      <div className="section-header">
        <h2 className="section-title">Latest Reviews</h2>
        <Link href="/reviews" className="section-link">View all →</Link>
      </div>
      <div className={styles.carouselWrap}>
        <button className={`${styles.carouselBtn} ${styles.prevBtn}`} ref={prevRef}>&#8592;</button>
        <div className={styles.reviewGrid} ref={trackRef}>
          {reviews.map(r => (
            <Link key={r.slug} href={`/reviews/${r.slug}`} className={styles.reviewCard}>
              <div className={styles.cardPoster}>
                <div className={styles.cardPosterBg} />
                <img className={styles.cardPosterImg} src={r.poster} alt={r.title} />
                <div className={styles.cardPosterOverlay}>
                  <span className={styles.cardOverlayArrow}>→</span>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardGenreTag}>{r.genre}</div>
                <div className={styles.cardTitle}>{r.title}</div>
              </div>
              <div className={styles.cardMeta}>
                <div className={styles.cardStars}>{r.stars}</div>
                <div className={styles.cardInfo}>{r.director} · {r.year}</div>
              </div>
            </Link>
          ))}
        </div>
        <button className={`${styles.carouselBtn} ${styles.nextBtn}`} ref={nextRef}>&#8594;</button>
      </div>
    </div>
  )
}
