'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './Newsletter.module.css'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.sectionVisible)
          observer.disconnect()
        }
      },
      { threshold: 0.75 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <div ref={sectionRef} className={styles.newsletterSection}>
      <div className={styles.eyebrow}>Dispatches from the dark</div>
      <h2 className={styles.title}>New reviews, essays &amp; lists — straight to your inbox.</h2>
      <p className={styles.sub}>No noise. No schedule. Just honest writing about film, sent whenever something is worth saying.</p>
      {submitted ? (
        <p className={styles.confirmed}>You&apos;re in. Talk soon.</p>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button className={styles.btn} type="submit">Subscribe</button>
        </form>
      )}
      <p className={styles.note}>No spam, ever. Unsubscribe any time.</p>
    </div>
  )
}
