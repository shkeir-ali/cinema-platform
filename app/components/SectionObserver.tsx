'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function SectionObserver() {
  const pathname = usePathname()

  useEffect(() => {
    // Re-query on every route change — layout never unmounts so [] would
    // only observe the initial page's elements, missing any soft-nav'd page.
    const els = document.querySelectorAll<HTMLElement>('.section-title:not(.is-visible)')

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
  }, [pathname])

  return null
}
