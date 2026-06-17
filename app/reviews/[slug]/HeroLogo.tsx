'use client'

import { useState } from 'react'
import styles from './ReviewPage.module.css'

type TitleToken = { text: string; style?: React.CSSProperties }

type Props = {
  src: string
  alt: string
  titleDisplay: TitleToken[] | null
  className?: string
}

export default function HeroLogo({ src, alt, titleDisplay, className }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    if (titleDisplay && titleDisplay.length > 0) {
      return (
        <h1 className={styles.heroTitle}>
          {titleDisplay.map((token, i) => (
            <span key={i} style={token.style}>{token.text}</span>
          ))}
        </h1>
      )
    }
    return <h1 className={styles.heroTitlePlain}>{alt}</h1>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
