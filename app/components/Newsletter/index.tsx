'use client'

import { useState } from 'react'
import styles from './Newsletter.module.css'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <div className={styles.newsletterSection}>
      <div className={styles.eyebrow}>Stay in the loop</div>
      <h2 className={styles.title}>New reviews, essays &amp; lists — straight to your inbox.</h2>
      <p className={styles.sub}>No noise. Just honest writing about film, dropped whenever something is worth saying.</p>
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
