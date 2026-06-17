import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import Footer from '@/app/components/Footer'
import Newsletter from '@/app/components/Newsletter'
import ScoreBlock from '@/app/reviews/[slug]/ScoreBlock'
import MoreReviewsReveal from '@/app/reviews/[slug]/MoreReviewsReveal'
import styles from '@/app/reviews/[slug]/ReviewPage.module.css'
import PreviewRefresher from '@/app/preview/PreviewRefresher'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const TMDB_ORIGINAL = 'https://image.tmdb.org/t/p/original'
const TMDB_W500     = 'https://image.tmdb.org/t/p/w500'

type TitleToken = { text: string; style?: React.CSSProperties }

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

export default async function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const saved = await db.review.findUnique({ where: { previewToken: token } })
  if (!saved) notFound()

  // Merge any unsaved draft changes on top of the committed fields
  const draft = saved.draftData as Record<string, unknown> | null
  const review = draft ? { ...saved, ...draft } : saved

  const backdropUrl = review.backdropPath ? `${TMDB_ORIGINAL}${review.backdropPath}` : null
  const cast = review.cast?.split(',').map(s => s.trim()).filter(Boolean) ?? []

  const moreReviews = await db.review.findMany({
    where: { published: true, slug: { not: review.slug } },
    orderBy: { createdAt: 'desc' },
    take: 4,
    select: { slug: true, title: true, director: true, releaseYear: true, posterPath: true },
  })

  return (
    <>
      <PreviewRefresher />

      {/* Preview header — replaces the site Header entirely */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 400,
        background: '#1c1117',
        color: '#fff',
        padding: '0 1.5rem',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.82rem',
        fontWeight: 500,
        boxShadow: '0 1px 0 rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            background: 'var(--rose)',
            color: '#fff',
            padding: '0.15rem 0.55rem',
            borderRadius: 3,
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
          }}>
            Preview
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
            {review.title} — {review.published ? 'Published' : 'Draft (not yet published)'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link href={`/admin/reviews/${review.id}/edit`} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.82rem' }}>
            ← Edit
          </Link>
          <Link href="/admin/reviews" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.82rem' }}>
            Reviews list
          </Link>
        </div>
      </div>

      <main>
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

        <div className={styles.bodyWrap}>
          <article>
            {review.excerpt && <p className={styles.reviewLede}>{review.excerpt}</p>}
            {renderBody(review.myReview as string, styles.reviewText)}
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
                  <div className={styles.moreCardMeta}>{r.director} · {r.releaseYear}</div>
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
