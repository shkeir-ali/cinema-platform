import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, Parisienne, Poiret_One } from 'next/font/google'
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

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${parisienne.variable} ${poiretOne.variable}`}>
      <body>
        {children}
        <SectionObserver />
      </body>
    </html>
  )
}
