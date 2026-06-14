'use client'

import { useState, useEffect, useRef } from 'react'
import { getTMDBImages, type TMDBImageItem } from '../actions'

type AssetType = 'backdrop' | 'logo' | 'poster'

// Thumbnail sizes used in the modal grid
const GRID_SIZE: Record<AssetType, string> = {
  backdrop: 'w500',
  logo:     'w300',
  poster:   'w342',
}

// Preview thumbnail shown next to the change button in the form
const PREVIEW_SIZE: Record<AssetType, string> = {
  backdrop: 'w300',
  logo:     'w185',
  poster:   'w154',
}

const LABEL: Record<AssetType, string> = {
  backdrop: 'Backdrop',
  logo:     'Logo',
  poster:   'Poster',
}

// Aspect ratios for the grid cells
const ASPECT: Record<AssetType, string> = {
  backdrop: '16 / 9',
  logo:     'unset',   // logos vary wildly — don't force aspect ratio
  poster:   '2 / 3',
}

// Preview box dimensions (form inline thumb)
const PREVIEW_W: Record<AssetType, number> = { backdrop: 160, logo: 120, poster: 72 }
const PREVIEW_H: Record<AssetType, number> = { backdrop: 90,  logo: 56,  poster: 108 }

type Props = {
  type: AssetType
  tmdbId: number
  initialPath: string
  name: string
}

export default function AssetPicker({ type, tmdbId, initialPath, name }: Props) {
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [open, setOpen]               = useState(false)
  const [images, setImages]           = useState<TMDBImageItem[]>([])
  const [loading, setLoading]         = useState(false)
  const hiddenRef    = useRef<HTMLInputElement>(null)
  const mountedRef   = useRef(false)

  // Fire a native change event when the selected path changes so the form's
  // auto-save listener picks it up (React state updates don't fire DOM events)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    hiddenRef.current?.dispatchEvent(new Event('change', { bubbles: true }))
  }, [currentPath])

  const gridBase    = `https://image.tmdb.org/t/p/${GRID_SIZE[type]}`
  const previewBase = `https://image.tmdb.org/t/p/${PREVIEW_SIZE[type]}`
  const pw = PREVIEW_W[type]
  const ph = PREVIEW_H[type]

  async function openModal() {
    setOpen(true)
    if (images.length > 0) return
    setLoading(true)
    const data = await getTMDBImages(tmdbId)
    setImages(
      type === 'backdrop' ? data.backdrops :
      type === 'logo'     ? data.logos :
                            data.posters
    )
    setLoading(false)
  }

  const isLogo = type === 'logo'

  return (
    <>
      <input ref={hiddenRef} type="hidden" name={name} value={currentPath} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={labelStyle}>{LABEL[type]}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${previewBase}${currentPath}`}
              alt={`Selected ${type}`}
              width={pw}
              height={ph}
              style={{
                objectFit: isLogo ? 'contain' : 'cover',
                borderRadius: 4,
                border: '1px solid rgba(142,59,78,0.2)',
                background: '#1c1a18',
                width: pw,
                height: ph,
              }}
            />
          ) : (
            <div style={{ width: pw, height: ph, borderRadius: 4, border: '1px dashed rgba(142,59,78,0.25)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>None</span>
            </div>
          )}
          <button type="button" onClick={openModal} style={changeBtn}>
            {currentPath ? `Change ${LABEL[type]}` : `Pick ${LABEL[type]}`}
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div style={overlay} onClick={() => setOpen(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0 }}>
                Choose {LABEL[type]}
              </h2>
              <button type="button" onClick={() => setOpen(false)} style={closeBtn}>✕</button>
            </div>

            {loading ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Loading…</p>
            ) : images.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>No images found.</p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isLogo
                  ? 'repeat(auto-fill, minmax(180px, 1fr))'
                  : type === 'poster'
                    ? 'repeat(auto-fill, minmax(140px, 1fr))'
                    : 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.6rem',
              }}>
                {images.map((img) => {
                  const selected = currentPath === img.file_path
                  return (
                    <button
                      key={img.file_path}
                      type="button"
                      onClick={() => { setCurrentPath(img.file_path); setOpen(false) }}
                      style={{
                        position: 'relative',
                        aspectRatio: ASPECT[type] === 'unset' ? undefined : ASPECT[type],
                        borderRadius: 4,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#1c1a18',
                        padding: isLogo ? '0.75rem' : 0,
                        border: 'none',
                        outline: selected ? '2px solid var(--rose)' : '2px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={img.file_path}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${gridBase}${img.file_path}`}
                        alt=""
                        style={{
                          width: '100%',
                          height: isLogo ? 'auto' : '100%',
                          maxHeight: isLogo ? '80px' : undefined,
                          objectFit: isLogo ? 'contain' : 'cover',
                          display: 'block',
                        }}
                      />
                      {selected && (
                        <div style={selectedBadge}>✓</div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const changeBtn: React.CSSProperties = {
  padding: '0.4rem 0.85rem',
  background: 'none',
  border: '1px solid rgba(142,59,78,0.3)',
  borderRadius: 4,
  color: 'var(--rose)',
  fontSize: '0.82rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.72)',
  zIndex: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
}

const modal: React.CSSProperties = {
  background: 'var(--surface)',
  borderRadius: 8,
  padding: '1.5rem',
  width: '100%',
  maxWidth: 900,
  maxHeight: '85vh',
  overflowY: 'auto',
  boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
}

const closeBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '1.1rem',
  color: 'var(--muted)',
  cursor: 'pointer',
  padding: '0.25rem',
  lineHeight: 1,
}

const selectedBadge: React.CSSProperties = {
  position: 'absolute',
  top: 6,
  right: 6,
  background: 'var(--rose)',
  color: '#fff',
  borderRadius: '50%',
  width: 22,
  height: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.72rem',
  fontWeight: 700,
  pointerEvents: 'none',
}
