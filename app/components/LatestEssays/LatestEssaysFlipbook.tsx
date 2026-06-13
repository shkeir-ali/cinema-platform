'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import styles from './LatestEssays.module.css'

type Post = {
  slug: string
  title: string
  excerpt: string
  category: string
  publishedAt: Date | null
}

function formatMeta(post: Post): string {
  if (!post.publishedAt) return ''
  return new Date(post.publishedAt).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export default function LatestEssaysFlipbook({ posts }: { posts: Post[] }) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev]       = useState<number | null>(null)
  const [dir, setDir]         = useState<'next' | 'prev'>('next')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % posts.length
        setPrev(c)
        setDir('next')
        return next
      })
    }, 10000)
  }, [posts.length])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.flipVisible)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function goTo(next: number, direction: 'prev' | 'next') {
    if (next === current) return
    setPrev(current)
    setDir(direction)
    setCurrent(next)
    startTimer()
  }

  function slideClass(i: number) {
    if (i === current) return `${styles.flipSlide} ${styles.flipSlideActive} ${styles.animIn}`
    if (i === prev)    return `${styles.flipSlide} ${styles.animOut}`
    return styles.flipSlide
  }

  function slideStyle(i: number): React.CSSProperties {
    if (i === current || i === prev) {
      return { '--flip-dir': dir === 'next' ? '40px' : '-40px' } as React.CSSProperties
    }
    return {}
  }

  return (
    <div ref={wrapRef} className={styles.essaysFlip}>
      {posts.map((post, i) => (
        <div
          key={post.slug}
          className={slideClass(i)}
          style={slideStyle(i)}
          data-index={i}
        >
          <div className={styles.flipContent}>
            <div className={styles.flipCounter}>
              <span>{String(i + 1).padStart(2, '0')}</span> / {String(posts.length).padStart(2, '0')}
            </div>
            <div className={styles.flipCategory}>{post.category}</div>
            <h2 className={styles.flipTitle}>{post.title}</h2>
            <p className={styles.flipExcerpt}>{post.excerpt}</p>
            <div className={styles.flipMeta}>{formatMeta(post)}</div>
            <div className={styles.flipNav}>
              <button
                className={styles.flipArrow}
                disabled={current === 0}
                onClick={() => goTo(current - 1, 'prev')}
                suppressHydrationWarning
              >
                &#8592;
              </button>
              <div className={styles.flipDots}>
                {posts.map((_, di) => (
                  <div
                    key={di}
                    className={`${styles.flipDot} ${di === current ? styles.flipDotActive : ''}`}
                    onClick={() => goTo(di, di < current ? 'prev' : 'next')}
                  />
                ))}
              </div>
              <button
                className={styles.flipArrow}
                disabled={current === posts.length - 1}
                onClick={() => goTo(current + 1, 'next')}
                suppressHydrationWarning
              >
                &#8594;
              </button>
              <Link href={`/essays/${post.slug}`} className="pill-btn" style={{ marginLeft: '1rem' }}>
                Read Essay →
              </Link>
            </div>
          </div>
          <div className={styles.flipImage}>
            <img src={`https://picsum.photos/seed/${post.slug}/900/480`} alt={post.title} loading="lazy" />
          </div>
        </div>
      ))}
    </div>
  )
}
