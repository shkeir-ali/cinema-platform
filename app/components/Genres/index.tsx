'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import styles from './Genres.module.css'

// Maps the old string-class shorthand to CSS Module keys
// e.g. 'sizeLg' → styles.sizeLg, 'gDrama' → styles.gDrama, 'r2' → styles.r2
function bubble(size: string, color: string, rot: string) {
  return [styles.genreBubble, styles[size], styles[color], styles[rot]].join(' ')
}

const row1 = [
  { label: 'Drama',   cls: bubble('sizeLg', 'gDrama',   'r2') },
  { label: 'Mystery', cls: bubble('sizeSm', 'gMystery', 'r3') },
  { label: 'Thriller',cls: bubble('sizeLg', 'gThriller','r5') },
  { label: 'Crime',   cls: bubble('sizeMd', 'gCrime',   'r4') },
  { label: 'War',     cls: bubble('sizeSm', 'gWar',     'r2') },
  { label: 'Sci-Fi',  cls: bubble('sizeLg', 'gScifi',   'r1') },
  { label: 'Noir',    cls: bubble('sizeSm', 'gNoir',    'r5') },
  { label: 'Romance', cls: bubble('sizeMd', 'gRomance', 'r2') },
  { label: 'Anime',   cls: bubble('sizeSm', 'gAnime',   'r1') },
]
const row2 = [
  { label: 'Comedy',       cls: bubble('sizeMd', 'gComedy',      'r1') },
  { label: 'Horror',       cls: bubble('sizeLg', 'gHorror',      'r3') },
  { label: 'Western',      cls: bubble('sizeSm', 'gWestern',     'r4') },
  { label: 'Action',       cls: bubble('sizeLg', 'gAction',      'r4') },
  { label: 'Documentary',  cls: bubble('sizeSm', 'gDocumentary', 'r2') },
  { label: 'Biography',    cls: bubble('sizeMd', 'gBiography',   'r5') },
  { label: 'Coming-of-Age',cls: bubble('sizeLg', 'gComingofage', 'r2') },
  { label: 'Musical',      cls: bubble('sizeSm', 'gMusical',     'r3') },
  { label: 'Fantasy',      cls: bubble('sizeMd', 'gFantasy',     'r3') },
]
const row3 = [
  { label: 'Surrealist',    cls: bubble('sizeSm', 'gSurrealist', 'r1') },
  { label: 'Neo-Noir',      cls: bubble('sizeMd', 'gNeonoir',   'r1') },
  { label: 'History',       cls: bubble('sizeSm', 'gHistory',   'r2') },
  { label: 'Adventure',     cls: bubble('sizeMd', 'gAdventure', 'r4') },
  { label: 'Silent',        cls: bubble('sizeSm', 'gSilent',    'r3') },
  { label: 'Sports',        cls: bubble('sizeSm', 'gSports',    'r4') },
  { label: 'Animation',     cls: bubble('sizeSm', 'gAnimation', 'r5') },
  { label: 'Period Drama',  cls: bubble('sizeMd', 'gPeriod',    'r3') },
  { label: 'Psychological', cls: bubble('sizeSm', 'gSurrealist','r1') },
]

const allGenres = [...row1, ...row2, ...row3]

function GenreBubble({ label, cls }: { label: string; cls: string }) {
  return (
    <Link href={`/reviews?genre=${label.toLowerCase().replace(/\s+/g, '-')}`} className={cls}>
      {label}
    </Link>
  )
}

export default function Genres() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let isDown = false, startX = 0, scrollLeft = 0
    const onDown  = (e: MouseEvent) => { isDown = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft }
    const onLeave = () => { isDown = false }
    const onUp    = () => { isDown = false }
    const onMove  = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - track.offsetLeft
      track.scrollLeft = scrollLeft - (x - startX) * 1.2
    }
    track.addEventListener('mousedown', onDown)
    track.addEventListener('mouseleave', onLeave)
    track.addEventListener('mouseup', onUp)
    track.addEventListener('mousemove', onMove)
    return () => {
      track.removeEventListener('mousedown', onDown)
      track.removeEventListener('mouseleave', onLeave)
      track.removeEventListener('mouseup', onUp)
      track.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <div className={styles.genresSection}>
      <div className="section-header">
        <h2 className="section-title">Browse by Genre</h2>
      </div>

      {/* Desktop: 3 staggered rows */}
      <div className={styles.genresRows}>
        <div className={styles.genresRow}>
          {row1.map(g => <GenreBubble key={g.label} {...g} />)}
        </div>
        <div className={styles.genresRow}>
          {row2.map(g => <GenreBubble key={g.label} {...g} />)}
        </div>
        <div className={styles.genresRow}>
          {row3.map(g => <GenreBubble key={g.label} {...g} />)}
        </div>
      </div>

      {/* Mobile: horizontal scroll strip */}
      <div className={styles.genresScrollOuter}>
        <div className={styles.genresScrollTrack} ref={trackRef}>
          {allGenres.map((g, i) => <GenreBubble key={i} {...g} />)}
        </div>
      </div>
    </div>
  )
}
