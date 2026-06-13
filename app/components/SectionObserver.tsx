'use client'

import { useEffect } from 'react'

export default function SectionObserver() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.section-title')

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
