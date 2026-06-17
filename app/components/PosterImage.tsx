'use client'

import { useState } from 'react'

// Muted genre accent colours — dark enough to work as a bg tint
const GENRE_COLORS: Record<string, string> = {
  Horror:    '#1a0d0d',
  Thriller:  '#0f1520',
  Drama:     '#0e1a14',
  Crime:     '#160e1a',
  Action:    '#1a1008',
  Comedy:    '#0e1a1a',
  Romance:   '#1a0e14',
  'Sci-Fi':  '#0a1020',
  Fantasy:   '#0f1020',
  Animation: '#0a1a10',
  Western:   '#1a1408',
  War:       '#121208',
  Musical:   '#1a0e1a',
  Biography: '#101510',
  History:   '#181208',
}

function genreColor(genre?: string) {
  if (!genre) return '#1a1510'
  return GENRE_COLORS[genre] ?? '#1a1510'
}

// Popcorn bucket SVG
function PopcornIcon() {
  const puff = 'rgba(245,240,232,0.22)'
  const bucket = 'rgba(245,240,232,0.28)'
  const stripe = 'rgba(245,240,232,0.12)'
  return (
    <svg width="38" height="40" viewBox="0 0 38 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* popcorn puffs — back row */}
      <circle cx="10" cy="14" r="4.5" fill={puff} />
      <circle cx="19" cy="12" r="5"   fill={puff} />
      <circle cx="28" cy="14" r="4.5" fill={puff} />
      {/* popcorn puffs — front row */}
      <circle cx="6"  cy="17" r="3.5" fill={puff} />
      <circle cx="14" cy="15" r="4"   fill={puff} />
      <circle cx="24" cy="15" r="4"   fill={puff} />
      <circle cx="32" cy="17" r="3.5" fill={puff} />

      {/* bucket body — trapezoid wider at top */}
      <path d="M6 18 L9 38 L29 38 L32 18 Z" fill={bucket} />

      {/* vertical stripes on bucket */}
      <path d="M14 18 L15.5 38" stroke={stripe} strokeWidth="3.5" />
      <path d="M24 18 L22.5 38" stroke={stripe} strokeWidth="3.5" />

      {/* horizontal band across middle of bucket */}
      <rect x="6" y="25" width="26" height="4" fill={stripe} />

      {/* bucket outline */}
      <path d="M6 18 L9 38 L29 38 L32 18 Z"
        stroke="rgba(245,240,232,0.35)" strokeWidth="1.2"
        strokeLinejoin="round" fill="none" />
    </svg>
  )
}

type Props = {
  src: string
  alt: string
  genre?: string
  className?: string
  style?: React.CSSProperties
  loading?: 'lazy' | 'eager'
}

export default function PosterImage({ src, alt, genre, className, style, loading = 'lazy' }: Props) {
  const [failed, setFailed] = useState(false)

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, display: failed ? 'none' : undefined }}
        loading={loading}
        onError={() => setFailed(true)}
      />
      {failed && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: genreColor(genre),
            gap: '0.6rem',
            padding: '1rem 0.75rem',
          }}
        >
          <PopcornIcon />
          <span
            style={{
              fontSize: '0.68rem',
              color: 'rgba(245,240,232,0.4)',
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: '85%',
            }}
          >
            {alt}
          </span>
        </div>
      )}
    </>
  )
}
