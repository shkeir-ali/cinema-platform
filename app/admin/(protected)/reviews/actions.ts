'use server'

import { db } from '@/lib/db'
import { Prisma } from '@/generated/prisma/client'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ── TMDB search ───────────────────────────────────────────────────────────────

export type TMDBMovie = {
  id: number
  title: string
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  genre_ids: number[]
}

export async function searchTMDB(query: string): Promise<TMDBMovie[]> {
  if (!query.trim()) return []
  const key = process.env.TMDB_API_KEY
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&api_key=${key}&language=en-US&page=1`,
    { cache: 'no-store' }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).slice(0, 8)
}

export async function getTMDBCredits(tmdbId: number) {
  const key = process.env.TMDB_API_KEY
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${key}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return { director: '', cast: '' }
  const data = await res.json()
  const director = (data.crew ?? []).find((c: { job: string; name: string }) => c.job === 'Director')?.name ?? ''
  const cast = (data.cast ?? [])
    .slice(0, 5)
    .map((a: { name: string }) => a.name)
    .join(', ')
  return { director, cast }
}

// ── TMDB images ───────────────────────────────────────────────────────────────

export type TMDBImageItem = {
  file_path: string
  width: number
  height: number
  vote_average: number
}

export type TMDBImages = {
  backdrops: TMDBImageItem[]
  logos: TMDBImageItem[]
  posters: TMDBImageItem[]
}

export async function getTMDBImages(tmdbId: number): Promise<TMDBImages> {
  const key = process.env.TMDB_API_KEY
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}/images?api_key=${key}&include_image_language=en,null`,
    { cache: 'no-store' }
  )
  if (!res.ok) return { backdrops: [], logos: [], posters: [] }
  const data = await res.json()
  return {
    backdrops: data.backdrops ?? [],
    logos:     data.logos     ?? [],
    posters:   data.posters   ?? [],
  }
}

// ── Form parsing ──────────────────────────────────────────────────────────────

// Canonical shape of editable review fields (used for both live save and draft)
type ReviewFields = {
  tmdbId:       number
  title:        string
  slug:         string
  director:     string
  cast:         string | null
  posterPath:   string
  backdropPath: string | null
  logoPath:     string | null
  releaseYear:  number
  genres:       string[]
  tags:         string[]
  excerpt:      string | null
  myRating:     number
  myReview:     string
  isFeatured:   boolean
  published:    boolean
  titleDisplay: Prisma.InputJsonValue | null
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function parseForm(data: FormData): ReviewFields {
  const rating = parseFloat(data.get('myRating') as string)
  const titleDisplayRaw = (data.get('titleDisplay') as string).trim()
  let titleDisplay: Prisma.InputJsonValue | null = null
  if (titleDisplayRaw) {
    try { titleDisplay = JSON.parse(titleDisplayRaw) } catch { /* leave null */ }
  }
  return {
    tmdbId:       parseInt(data.get('tmdbId') as string),
    title:        (data.get('title') as string).trim(),
    slug:         (data.get('slug') as string).trim() || slugify(data.get('title') as string),
    director:     (data.get('director') as string).trim(),
    cast:         (data.get('cast') as string).trim() || null,
    posterPath:   (data.get('posterPath') as string).trim(),
    backdropPath: (data.get('backdropPath') as string).trim() || null,
    logoPath:     (data.get('logoPath') as string).trim() || null,
    releaseYear:  parseInt(data.get('releaseYear') as string),
    genres:       (data.get('genres') as string).split(',').map((g) => g.trim()).filter(Boolean),
    tags:         (data.get('tags') as string).split(',').map((t) => t.trim()).filter(Boolean),
    excerpt:      (data.get('excerpt') as string).trim() || null,
    myRating:     isNaN(rating) ? 0 : rating,
    myReview:     (data.get('myReview') as string).trim(),
    isFeatured:   data.get('isFeatured') === 'on',
    published:    data.get('published') === 'on',
    titleDisplay,
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

// Prisma nullable JSON fields require DbNull instead of plain null
function toDbData(fields: ReviewFields) {
  return {
    ...fields,
    titleDisplay: fields.titleDisplay ?? Prisma.DbNull,
  }
}

export async function createReview(_: unknown, formData: FormData) {
  const fields = parseForm(formData)
  await db.review.create({ data: toDbData(fields) })
  revalidatePath('/admin/reviews')
  redirect('/admin/reviews')
}

export async function updateReview(_: unknown, formData: FormData) {
  const id = parseInt(formData.get('id') as string)
  const fields = parseForm(formData)
  // Commit the form fields and clear any pending draft — the two are now in sync
  await db.review.update({ where: { id }, data: { ...toDbData(fields), draftData: Prisma.DbNull } })
  revalidatePath('/admin/reviews')
  revalidatePath('/preview', 'layout')
  redirect('/admin/reviews')
}

// Stores unsaved edits in draftData without touching the published record.
// The preview route merges draftData over the saved fields so the admin can
// see live changes while the published page remains untouched.
export async function saveDraft(_: unknown, formData: FormData): Promise<void> {
  const id = parseInt(formData.get('id') as string)
  if (!id) return
  const fields = parseForm(formData)
  // JSON.parse(JSON.stringify(...)) strips undefined and coerces to plain JSON —
  // required because Prisma's InputJsonValue doesn't accept undefined or null literals
  const json = JSON.parse(JSON.stringify(fields)) as Prisma.InputJsonValue
  await db.review.update({ where: { id }, data: { draftData: json } })
  revalidatePath('/preview', 'layout')
}

// Called on Cancel — discards pending draft so the preview reverts to saved state.
export async function clearDraft(id: number): Promise<void> {
  await db.review.update({ where: { id }, data: { draftData: Prisma.DbNull } })
  revalidatePath('/preview', 'layout')
}

export async function deleteReview(id: number) {
  await db.review.delete({ where: { id } })
  revalidatePath('/admin/reviews')
}

export async function togglePublished(id: number, current: boolean) {
  await db.review.update({ where: { id }, data: { published: !current } })
  revalidatePath('/admin/reviews')
}

// ── Preview tokens ────────────────────────────────────────────────────────────

export async function generatePreviewToken(id: number): Promise<string> {
  const token = crypto.randomUUID()
  await db.review.update({ where: { id }, data: { previewToken: token } })
  revalidatePath('/admin/reviews')
  return token
}
