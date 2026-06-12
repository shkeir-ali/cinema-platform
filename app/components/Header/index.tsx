'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './Header.module.css'

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
const LetterboxdIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="currentColor"/>
    <circle cx="6.5"  cy="12" r="3.8" fill="var(--bg)"/>
    <circle cx="12"   cy="12" r="3.8" fill="var(--bg)"/>
    <circle cx="17.5" cy="12" r="3.8" fill="var(--bg)"/>
  </svg>
)
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function Header() {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  function toggleSearch() {
    if (!searchOpen) {
      setSearchOpen(true)
      setTimeout(() => searchRef.current?.focus(), 50)
    } else {
      setSearchOpen(false)
      if (searchRef.current) searchRef.current.value = ''
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as Element).closest(`.${styles.searchWrap}`)) {
        setSearchOpen(false)
        if (searchRef.current) searchRef.current.value = ''
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  function handleSearchKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setSearchOpen(false)
      if (searchRef.current) searchRef.current.value = ''
    }
  }

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoFirst}>ali</span>
          <span className={styles.logoLast}>Shkeir</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/reviews" className={styles.navLink}>Reviews</Link>
          <Link href="/essays"  className={styles.navLink}>Essays</Link>
          <Link href="/lists"   className={styles.navLink}>Lists</Link>
          <Link href="/about"   className={styles.navLink}>About</Link>
          <div className={styles.searchWrap}>
            <input
              ref={searchRef}
              className={`${styles.searchField} ${searchOpen ? styles.searchFieldOpen : ''}`}
              type="text"
              placeholder="Search…"
              onKeyDown={handleSearchKey}
            />
            <button className={styles.searchBtn} onClick={toggleSearch} aria-label="Search">
              <SearchIcon />
            </button>
          </div>
          <Link href="/signin" className={`${styles.navLink} ${styles.navPill}`}>Sign in</Link>
        </nav>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </header>

      <div className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ''}`}>
        <div className={styles.mobileSearchWrap}>
          <input className={styles.mobileSearchInput} type="text" placeholder="Search reviews, essays…" />
          <span className={styles.mobileSearchIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
        </div>
        <Link href="/reviews" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Reviews</Link>
        <Link href="/essays"  className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Essays</Link>
        <Link href="/lists"   className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Lists</Link>
        <Link href="/about"   className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>About</Link>
        <Link href="/signin"  className={styles.mobileNavPill} onClick={() => setMenuOpen(false)}>Sign in</Link>
        <div className={styles.mobileNavSocials}>
          <a href="https://github.com/shkeir-ali" title="GitHub" target="_blank" rel="noopener noreferrer"><GithubIcon /></a>
          <a href="https://www.linkedin.com/in/ali-shkeir" title="LinkedIn" target="_blank" rel="noopener noreferrer"><LinkedInIcon /></a>
          <a href="https://boxd.it/aPRFT" title="Letterboxd" target="_blank" rel="noopener noreferrer"><LetterboxdIcon /></a>
        </div>
      </div>
    </>
  )
}
