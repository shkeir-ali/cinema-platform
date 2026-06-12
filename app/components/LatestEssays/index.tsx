'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import styles from './LatestEssays.module.css'

const slides = [
  {
    num: '01', category: 'Film Theory',
    title: "Why Kubrick's obsession with symmetry still matters",
    excerpt: "Every frame a painting — but what does it mean when the geometry becomes the message? A deep dive into how Kubrick used the camera as a philosophical instrument.",
    meta: 'June 2026 · 8 min read',
    slug: 'kubrick-symmetry',
    img: 'https://picsum.photos/seed/kubrick/900/480',
  },
  {
    num: '02', category: 'History',
    title: 'The French New Wave and its lasting shadow on modern cinema',
    excerpt: "Godard, Truffaut, Varda — sixty years later their fingerprints are on everything from Tarantino to Céline Song. How a movement born of rebellion became the establishment.",
    meta: 'May 2026 · 11 min read',
    slug: 'french-new-wave',
    img: 'https://picsum.photos/seed/newwave/900/480',
  },
  {
    num: '03', category: 'Director Study',
    title: "Villeneuve's silence: how Denis speaks without words",
    excerpt: "From Incendies to Dune, Denis Villeneuve has made restraint his signature. An exploration of how silence, scale, and stillness carry more weight than any dialogue could.",
    meta: 'April 2026 · 9 min read',
    slug: 'villeneuve-silence',
    img: 'https://picsum.photos/seed/villeneuve/900/480',
  },
]

export default function LatestEssays() {
  const [current, setCurrent] = useState(0)
  const [busy, setBusy] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function isMobile() {
    return typeof window !== 'undefined' && window.innerWidth <= 768
  }

  function goTo(next: number, direction: 'prev' | 'next') {
    if (busy || next === current) return
    const prev = current

    if (isMobile()) {
      setCurrent(next)
      return
    }

    setBusy(true)
    const dir = direction === 'prev' ? '-40px' : '40px'
    const container = containerRef.current
    if (!container) return

    const prevEl = container.querySelectorAll(`.${styles.flipSlide}`)[prev] as HTMLElement
    const nextEl = container.querySelectorAll(`.${styles.flipSlide}`)[next] as HTMLElement

    prevEl.style.setProperty('--flip-dir', dir)
    nextEl.style.setProperty('--flip-dir', dir)

    prevEl.classList.add(styles.animOut)
    nextEl.classList.add(styles.flipSlideActive, styles.animIn)

    prevEl.addEventListener('animationend', () => {
      prevEl.classList.remove(styles.flipSlideActive, styles.animOut)
      setBusy(false)
    }, { once: true })
    nextEl.addEventListener('animationend', () => {
      nextEl.classList.remove(styles.animIn)
    }, { once: true })

    setCurrent(next)
  }

  return (
    <div className={styles.essaysFlip} ref={containerRef}>
      {slides.map((s, i) => (
        <div
          key={s.slug}
          className={`${styles.flipSlide} ${i === current ? styles.flipSlideActive : ''}`}
          data-index={i}
        >
          <div className={styles.flipContent}>
            <div className={styles.flipCounter}><span>{s.num}</span> / {slides.length.toString().padStart(2, '0')}</div>
            <div className={styles.flipCategory}>{s.category}</div>
            <h2 className={styles.flipTitle}>{s.title}</h2>
            <p className={styles.flipExcerpt}>{s.excerpt}</p>
            <div className={styles.flipMeta}>{s.meta}</div>
            <div className={styles.flipNav}>
              <button
                className={styles.flipArrow}
                disabled={current === 0}
                onClick={() => goTo(current - 1, 'prev')}
              >
                &#8592;
              </button>
              <div className={styles.flipDots}>
                {slides.map((_, di) => (
                  <div
                    key={di}
                    className={`${styles.flipDot} ${di === current ? styles.flipDotActive : ''}`}
                    onClick={() => goTo(di, di < current ? 'prev' : 'next')}
                  />
                ))}
              </div>
              <button
                className={styles.flipArrow}
                disabled={current === slides.length - 1}
                onClick={() => goTo(current + 1, 'next')}
              >
                &#8594;
              </button>
              <Link href={`/essays/${s.slug}`} className="pill-btn-light" style={{ marginLeft: '1rem' }}>
                Read Essay →
              </Link>
            </div>
          </div>
          <div className={styles.flipImage}>
            <img src={s.img} alt={s.title} />
          </div>
        </div>
      ))}
    </div>
  )
}
