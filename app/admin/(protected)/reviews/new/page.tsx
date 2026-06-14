'use client'

import { useState } from 'react'
import TMDBSearch from '../_components/TMDBSearch'
import ReviewForm from '../_components/ReviewForm'
import { createReview } from '../actions'
import Image from 'next/image'

type FilmSelection = {
  tmdbId: number
  title: string
  releaseYear: number
  posterPath: string
  backdropPath: string
  director: string
  cast: string
  genres: string[]
}

export default function NewReviewPage() {
  const [selected, setSelected] = useState<FilmSelection | null>(null)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={heading}>New Review</h1>
        {selected && (
          <button
            onClick={() => setSelected(null)}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
          >
            ← Change film
          </button>
        )}
      </div>

      {!selected ? (
        <div style={{ maxWidth: 520, background: 'var(--surface)', borderRadius: 8, padding: '2rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(142,59,78,0.08)' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
            Search TMDB to pre-fill film details, then write your review.
          </p>
          <TMDBSearch onSelect={setSelected} />
        </div>
      ) : (
        <>
          <div style={filmCard}>
            {selected.posterPath && (
              <Image
                src={`https://image.tmdb.org/t/p/w92${selected.posterPath}`}
                alt={selected.title}
                width={46}
                height={69}
                style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem' }}>
                {selected.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
                {selected.releaseYear} · {selected.director} · {selected.genres.join(', ')}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 8, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(142,59,78,0.08)', overflow: 'hidden' }}>
            <ReviewForm action={createReview} tmdbDefaults={selected} />
          </div>
        </>
      )}
    </div>
  )
}

const heading: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.75rem',
  fontWeight: 600,
  color: 'var(--text)',
  margin: 0,
}

const filmCard: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.85rem 1.25rem',
  background: 'var(--surface)',
  border: '1px solid rgba(142,59,78,0.12)',
  borderRadius: 8,
  marginBottom: '1rem',
  maxWidth: 600,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
}
