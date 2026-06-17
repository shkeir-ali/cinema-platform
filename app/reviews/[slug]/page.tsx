import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import Newsletter from '@/app/components/Newsletter'
import ScoreBlock from './ScoreBlock'
import MoreReviewsReveal from './MoreReviewsReveal'
import styles from './ReviewPage.module.css'

const TMDB_ORIGINAL = 'https://image.tmdb.org/t/p/original'
const TMDB_W500 = 'https://image.tmdb.org/t/p/w500'

type TitleToken = { text: string; style?: React.CSSProperties }

/* Render the per-film styled title from the DB (titleDisplay tokens carry
   their own colours/italics); fall back to the plain title string. */
function renderTitle(titleDisplay: unknown, fallback: string) {
  if (!titleDisplay || !Array.isArray(titleDisplay)) return <>{fallback}</>
  return (
    <>
      {(titleDisplay as TitleToken[]).map((token, i) => (
        <span key={i} style={token.style}>{token.text}</span>
      ))}
    </>
  )
}


function renderBody(content: string, className: string) {
  if (content.trimStart().startsWith('<')) {
    return <div dangerouslySetInnerHTML={{ __html: content }} className={className} />
  }
  return (
    <div className={className}>
      {content.split(/\n\n+/).map((p, i) => <p key={i}>{p.trim()}</p>)}
    </div>
  )
}

type RelatedCandidate = {
  slug: string; title: string; director: string; releaseYear: number
  posterPath: string; genres: string[]; tags: string[]; tmdbCollectionId: number | null
}

function getRelated(
  current: { genres: string[]; tags: string[]; director: string; releaseYear: number; tmdbCollectionId: number | null },
  all: RelatedCandidate[]
) {
  return all
    .map(r => {
      let score = 0
      if (current.tmdbCollectionId && r.tmdbCollectionId === current.tmdbCollectionId) score += 10
      if (r.director === current.director) score += 4
      score += r.genres.filter(g => current.genres.includes(g)).length * 2
      score += r.tags.filter(t => current.tags.includes(t)).length
      if (Math.abs(r.releaseYear - current.releaseYear) <= 5) score += 1
      return { ...r, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
}

async function getReview(slug: string) {
  return db.review.findFirst({ where: { slug, published: true } })
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const review = await getReview(slug)
  if (!review) return { title: 'Review not found — Film Journal' }

  const title = `${review.title} (${review.releaseYear}) — Film Journal`
  const description = review.excerpt ?? `A review of ${review.title}, directed by ${review.director}.`
  const ogImage = review.backdropPath ? `${TMDB_ORIGINAL}${review.backdropPath}` : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  }
}

export default async function ReviewPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const review = await getReview(slug)
  if (!review) notFound()

  const backdropUrl = review.backdropPath ? `${TMDB_ORIGINAL}${review.backdropPath}` : null
  const cast = review.cast?.split(',').map(s => s.trim()).filter(Boolean) ?? []

  const allOtherReviews = await db.review.findMany({
    where: { published: true, slug: { not: review.slug } },
    orderBy: { createdAt: 'desc' },
    select: { slug: true, title: true, director: true, releaseYear: true, posterPath: true, genres: true, tags: true, tmdbCollectionId: true },
  })
  const moreReviews = getRelated(review, allOtherReviews)

  return (
    <>
      <Header overDark />

      <main>
        {/* ── HERO ───────────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <div
            className={styles.heroBackdrop}
            style={backdropUrl ? { backgroundImage: `url('${backdropUrl}')` } : undefined}
            data-fallback={backdropUrl ? undefined : ''}
          />
          <div className={styles.heroFade} />

          <div className={styles.heroContentLogo}>
            {!review.titleDisplay && review.logoPath ? (
              <img
                src={`${TMDB_ORIGINAL}${review.logoPath}`}
                alt={review.title}
                className={styles.heroLogo}
              />
            ) : review.titleDisplay ? (
              <h1 className={styles.heroTitle}>
                {renderTitle(review.titleDisplay, review.title)}
              </h1>
            ) : (
              <h1 className={styles.heroTitlePlain}>{review.title}</h1>
            )}
            <div className={styles.heroDirector}>
              {review.director} <span className={styles.heroDot}>·</span> {review.releaseYear}
            </div>
          </div>
        </section>

        {/* ── BODY + SIDEBAR ─────────────────────────────────────────── */}
        <div className={styles.bodyWrap}>
          <article>
            {review.excerpt && <p className={styles.reviewLede}>{review.excerpt}</p>}
            {renderBody(review.myReview, styles.reviewText)}
          </article>

          <aside className={styles.sidebar}>
            <ScoreBlock rating={review.myRating} />

            <div className={styles.sidebarBlock}>
              <div className={styles.sidebarLabel}>Director</div>
              <div className={styles.sidebarValue}>{review.director}</div>
            </div>

            {cast.length > 0 && (
              <>
                <hr className={styles.sidebarRule} />
                <div className={styles.sidebarBlock}>
                  <div className={styles.sidebarLabel}>Cast</div>
                  <ul className={styles.castList}>
                    {cast.map((name, i) => <li key={i}>{name}</li>)}
                  </ul>
                </div>
              </>
            )}

            {review.genres.length > 0 && (
              <>
                <hr className={styles.sidebarRule} />
                <div className={styles.sidebarBlock}>
                  <div className={styles.sidebarLabel}>Genres</div>
                  <div className={styles.pills}>
                    {review.genres.map(g => <span key={g} className={styles.pill}>{g}</span>)}
                  </div>
                </div>
              </>
            )}

            {review.tags.length > 0 && (
              <>
                <hr className={styles.sidebarRule} />
                <div className={styles.sidebarBlock}>
                  <div className={styles.sidebarLabel}>Themes</div>
                  <div className={styles.pills}>
                    {review.tags.map(t => <span key={t} className={`${styles.pill} ${styles.pillMuted}`}>{t}</span>)}
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>

        {/* ── MORE REVIEWS ───────────────────────────────────────────── */}
        {moreReviews.length > 0 && (
          <div className={styles.moreSection}>
            <div className={styles.moreHeader}>
              <h2 className={styles.moreTitle}>More Reviews</h2>
              <Link href="/reviews" className={styles.moreLink}>View all →</Link>
            </div>
            <MoreReviewsReveal>
              {moreReviews.map(r => (
                <Link key={r.slug} href={`/reviews/${r.slug}`} className={styles.moreCard}>
                  <div className={styles.moreCardImg}>
                    <img src={`${TMDB_W500}${r.posterPath}`} alt={r.title} loading="lazy" />
                  </div>
                  <div className={styles.moreCardTitle}>{r.title}</div>
                  <div className={styles.moreCardMeta}>{r.genres[0] && `${r.genres[0]} · `}{r.director} · {r.releaseYear}</div>
                </Link>
              ))}
            </MoreReviewsReveal>
          </div>
        )}
      </main>

      <Newsletter />
      <Footer />
    </>
  )
}
