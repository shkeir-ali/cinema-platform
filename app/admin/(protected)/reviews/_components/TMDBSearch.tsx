'use client'

import { useState, useRef, useCallback } from 'react'
import { searchTMDB, getTMDBCredits, type TMDBMovie } from '../actions'
import { tmdbGenreNames } from './tmdbUtils'

type Selected = {
  tmdbId: number
  title: string
  releaseYear: number
  posterPath: string
  backdropPath: string
  director: string
  cast: string
  genres: string[]
}

type Props = {
  onSelect: (film: Selected) => void
}

export default function TMDBSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const res = await searchTMDB(val)
      setResults(res)
      setLoading(false)
    }, 350)
  }, [])

  async function handleSelect(film: TMDBMovie) {
    setLoadingId(film.id)
    const { director, cast } = await getTMDBCredits(film.id)
    const genres = tmdbGenreNames(film.genre_ids)
    onSelect({
      tmdbId:      film.id,
      title:       film.title,
      releaseYear: film.release_date ? parseInt(film.release_date.slice(0, 4)) : 0,
      posterPath:  film.poster_path ?? '',
      backdropPath:film.backdrop_path ?? '',
      director,
      cast,
      genres,
    })
    setLoadingId(null)
    setResults([])
    setQuery('')
  }

  return (
    <div style={{ marginBottom: '2rem', maxWidth: 520, position: 'relative' }}>
      <label style={labelStyle}>
        <span style={labelText}>Search TMDB</span>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Type a film title…"
            style={inputStyle}
            autoComplete="off"
          />
          {loading && (
            <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '0.8rem' }}>
              searching…
            </span>
          )}
        </div>
      </label>

      {results.length > 0 && (
        <ul style={dropdownStyle}>
          {results.map((film) => (
            <li key={film.id}>
              <button
                type="button"
                onClick={() => handleSelect(film)}
                disabled={loadingId === film.id}
                style={resultItem}
              >
                {film.poster_path && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://image.tmdb.org/t/p/w92${film.poster_path}`}
                    alt=""
                    width={32}
                    height={48}
                    style={{ objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
                  />
                )}
                <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{film.title}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {film.release_date ? film.release_date.slice(0, 4) : 'Unknown year'}
                  </span>
                </span>
                {loadingId === film.id && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--muted)' }}>loading…</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.35rem' }

const labelText: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  background: 'var(--bg)',
  border: '1px solid rgba(142,59,78,0.22)',
  borderRadius: 3,
  color: 'var(--text)',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  background: 'var(--surface)',
  border: '1px solid rgba(142,59,78,0.2)',
  borderRadius: 3,
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  listStyle: 'none',
  margin: 0,
  padding: '0.25rem 0',
  zIndex: 50,
  maxHeight: 360,
  overflowY: 'auto',
}

const resultItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
}
