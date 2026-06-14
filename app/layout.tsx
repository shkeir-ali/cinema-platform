import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, Parisienne, Poiret_One, Great_Vibes } from 'next/font/google'
import SectionObserver from './components/SectionObserver'
import './globals.css'

const poiretOne = Poiret_One({
  variable: '--font-poiret',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

const parisienne = Parisienne({
  variable: '--font-parisienne',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

// Script face for review-page film titles (matches the design prototype)
const greatVibes = Great_Vibes({
  variable: '--font-great-vibes',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ali Shkeir — Cinema',
  description: 'Honest reviews, personal essays, and curated lists — from a film obsessive who believes every frame tells a story.',
  metadataBase: new URL('https://alishkeir.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ali Shkeir — Cinema',
    description: 'Honest reviews, personal essays, and curated lists — from a film obsessive who believes every frame tells a story.',
    url: 'https://alishkeir.com',
    siteName: 'Ali Shkeir — Cinema',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ali Shkeir — Film Criticism & Essays',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ali Shkeir — Cinema',
    description: 'Honest reviews, personal essays, and curated lists — from a film obsessive who believes every frame tells a story.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${parisienne.variable} ${poiretOne.variable} ${greatVibes.variable}`}>
      <body>
        {children}
        <SectionObserver />
      </body>
    </html>
  )
}
