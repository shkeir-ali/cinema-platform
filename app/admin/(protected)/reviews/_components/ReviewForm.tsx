'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import type { Review } from '@/generated/prisma/client'
import AssetPicker from './AssetPicker'
import PreviewLink from './PreviewLink'
import { saveDraft, clearDraft } from '../actions'

type Props = {
  action: (prev: unknown, formData: FormData) => Promise<void>
  review?: Partial<Review>
  tmdbDefaults?: {
    tmdbId: number
    title: string
    releaseYear: number
    posterPath: string
    backdropPath: string
    director: string
    cast: string
    genres: string[]
  }
}

export default function ReviewForm({ action, review, tmdbDefaults }: Props) {
  const [, formAction, pending] = useActionState(action, null)
  const formRef    = useRef<HTMLFormElement>(null)
  const timerRef   = useRef<ReturnType<typeof setTimeout>>()
  const channelRef = useRef<BroadcastChannel | null>(null)
  const [draftStatus, setDraftStatus] = useState<'idle' | 'pending' | 'saved'>('idle')

  useEffect(() => {
    if (!review?.id) return
    channelRef.current = new BroadcastChannel('cinema-preview')
    return () => { channelRef.current?.close() }
  }, [review?.id])

  // Native DOM listener — bypasses React synthetic event system for reliability
  useEffect(() => {
    const form = formRef.current
    if (!form || !review?.id) return

    function handleInput() {
      clearTimeout(timerRef.current)
      setDraftStatus('pending')
      timerRef.current = setTimeout(async () => {
        if (!formRef.current) return
        const fd = new FormData(formRef.current)
        await saveDraft(undefined, fd)
        channelRef.current?.postMessage({ type: 'refresh' })
        setDraftStatus('saved')
        setTimeout(() => setDraftStatus('idle'), 2000)
      }, 1200)
    }

    form.addEventListener('input', handleInput)
    form.addEventListener('change', handleInput)
    return () => {
      form.removeEventListener('input', handleInput)
      form.removeEventListener('change', handleInput)
      clearTimeout(timerRef.current)
    }
  }, [review?.id])

  const v = review ?? {}
  const t = tmdbDefaults

  const tmdbId      = v.tmdbId      ?? t?.tmdbId      ?? 0
  const title       = v.title       ?? t?.title       ?? ''
  const releaseYear = v.releaseYear ?? t?.releaseYear  ?? ''
  const posterPath  = v.posterPath  ?? t?.posterPath   ?? ''
  const backdropPath= v.backdropPath?? t?.backdropPath ?? ''
  const logoPath    = v.logoPath    ?? ''
  const director    = v.director    ?? t?.director     ?? ''
  const cast        = v.cast        ?? t?.cast         ?? ''
  const genres      = v.genres      ?? t?.genres       ?? []
  const slug        = v.slug        ?? ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Preview link + draft status (edit mode only) */}
      {v.id && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          {draftStatus === 'pending' && (
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Saving draft…</span>
          )}
          {draftStatus === 'saved' && (
            <span style={{ fontSize: '0.78rem', color: '#2a9a2a' }}>✓ Draft saved</span>
          )}
          <PreviewLink id={v.id} token={v.previewToken ?? null} variant="form" />
        </div>
      )}

      <form
        ref={formRef}
        action={formAction}
        onSubmit={() => {
          clearTimeout(timerRef.current)
          channelRef.current?.postMessage({ type: 'refresh' })
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '0' }}
      >
        {v.id && <input type="hidden" name="id" value={v.id} />}
        <input type="hidden" name="tmdbId" value={tmdbId} />

        {/* ── Section: Assets ────────────────────────────────────────── */}
        <Section title="Assets">
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <AssetPicker type="poster"   tmdbId={tmdbId} initialPath={posterPath}   name="posterPath" />
            <AssetPicker type="backdrop" tmdbId={tmdbId} initialPath={backdropPath} name="backdropPath" />
            <AssetPicker type="logo"     tmdbId={tmdbId} initialPath={logoPath}     name="logoPath" />
          </div>
        </Section>

        {/* ── Section: Film info ─────────────────────────────────────── */}
        <Section title="Film info">
          <div style={row}>
            <Field label="Title" name="title" defaultValue={title} required />
            <Field label="Slug" name="slug" defaultValue={slug} placeholder="auto-generated if blank" />
          </div>
          <div style={row}>
            <Field label="Director" name="director" defaultValue={director} required />
            <Field label="Release Year" name="releaseYear" type="number" defaultValue={String(releaseYear)} required style={{ maxWidth: 140 }} />
          </div>
          <Field label="Cast (comma-separated)" name="cast" defaultValue={cast} />
          <div style={row}>
            <Field label="Genres (comma-separated)" name="genres" defaultValue={genres.join(', ')} />
            <Field label="Tags (comma-separated)" name="tags" defaultValue={(v.tags ?? []).join(', ')} />
          </div>
          <Field
            label="titleDisplay JSON (optional)"
            name="titleDisplay"
            multiline
            rows={2}
            defaultValue={v.titleDisplay ? JSON.stringify(v.titleDisplay, null, 2) : ''}
            placeholder={'[{"text":"Title","style":{"color":"#c8922a"}}]'}
          />
        </Section>

        {/* ── Section: Review ────────────────────────────────────────── */}
        <Section title="Your review">
          <Field label="Excerpt" name="excerpt" multiline rows={2} defaultValue={v.excerpt ?? ''} />
          <Field label="Review body" name="myReview" multiline rows={12} defaultValue={v.myReview ?? ''} required />
          <Field label="Rating (0.5 – 5)" name="myRating" type="number" inputProps={{ min: '0.5', max: '5', step: '0.5' }} defaultValue={String(v.myRating ?? '')} required style={{ maxWidth: 140 }} />
        </Section>

        {/* ── Section: Settings ──────────────────────────────────────── */}
        <Section title="Settings">
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <label style={checkLabel}>
              <input type="checkbox" name="isFeatured" defaultChecked={v.isFeatured ?? false} style={{ accentColor: 'var(--rose)', width: 16, height: 16 }} />
              Featured on homepage
            </label>
            <label style={checkLabel}>
              <input type="checkbox" name="published" defaultChecked={v.published ?? false} style={{ accentColor: 'var(--rose)', width: 16, height: 16 }} />
              Published (visible publicly)
            </label>
          </div>
        </Section>

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <div style={{ padding: '1.5rem 0 0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button type="submit" disabled={pending} style={submitBtn}>
            {pending ? 'Saving…' : 'Save Review'}
          </button>
          <button
            type="button"
            onClick={async () => {
              clearTimeout(timerRef.current)
              if (v.id) await clearDraft(v.id)
              channelRef.current?.postMessage({ type: 'refresh' })
              window.location.href = '/admin/reviews'
            }}
            style={{ fontSize: '0.875rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: '1.5rem',
      borderBottom: '1px solid rgba(142,59,78,0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <h3 style={{
        margin: 0,
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--rose)',
      }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────

type FieldProps = {
  label: string
  name: string
  type?: string
  defaultValue?: string
  required?: boolean
  multiline?: boolean
  rows?: number
  placeholder?: string
  style?: React.CSSProperties
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

function Field({ label, name, type = 'text', defaultValue, required, multiline, rows = 3, placeholder, style, inputProps }: FieldProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, minWidth: 180, ...style }}>
      <span style={labelText}>{label}{required && <span style={{ color: 'var(--rose)' }}> *</span>}</span>
      {multiline ? (
        <textarea name={name} rows={rows} defaultValue={defaultValue} placeholder={placeholder} style={inputStyle as React.CSSProperties} />
      ) : (
        <input name={name} type={type} defaultValue={defaultValue} required={required} placeholder={placeholder} style={inputStyle as React.CSSProperties} {...inputProps} />
      )}
    </label>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const row: React.CSSProperties = { display: 'flex', gap: '1rem', flexWrap: 'wrap' }

const labelText: React.CSSProperties = {
  fontSize: '0.78rem',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  fontWeight: 500,
}

const inputStyle = {
  padding: '0.55rem 0.75rem',
  background: 'var(--bg)',
  border: '1px solid rgba(142,59,78,0.2)',
  borderRadius: 5,
  color: 'var(--text)',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  resize: 'vertical',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s',
} as const

const checkLabel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  fontSize: '0.9rem',
  color: 'var(--text)',
  cursor: 'pointer',
}

const submitBtn: React.CSSProperties = {
  padding: '0.7rem 2rem',
  background: 'var(--rose)',
  color: '#fff',
  border: 'none',
  borderRadius: 5,
  fontFamily: 'var(--font-display)',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '0.02em',
}
