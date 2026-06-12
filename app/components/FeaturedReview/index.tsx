import Link from 'next/link'
import { db } from '@/lib/db'
import styles from './FeaturedReview.module.css'

type TitleToken = { text: string; style?: React.CSSProperties }

function renderTitle(titleDisplay: unknown, fallback: string) {
  if (!titleDisplay) return <>{fallback}</>
  const tokens = titleDisplay as TitleToken[]
  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} style={token.style}>{token.text}</span>
      ))}
    </>
  )
}

export default async function FeaturedReview() {
  const review = await db.review.findFirst({
    where: { isFeatured: true, published: true },
  })

  if (!review) return null

  const genres = review.genres.join(' · ')
  const rating = (review.myRating).toFixed(1)
  const titleWords = review.title.split(' ')
  const titleOutline = titleWords.slice(0, -1).join(' ')
  const titleFilled = titleWords[titleWords.length - 1]

  return (
    <div className={styles.featuredWrap}>
      {/* Full-bleed background */}
      <div className={styles.featuredBg}>
        <div className={styles.bgImage} />
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
        <div className={`${styles.star} ${styles.s1}`} />
        <div className={`${styles.star} ${styles.s2}`} />
        <div className={`${styles.star} ${styles.s3}`} />
        <div className={`${styles.star} ${styles.s4}`} />
        <div className={`${styles.star} ${styles.s5}`} />
        <div className={`${styles.star} ${styles.s6}`} />
        <div className={`${styles.star} ${styles.s7}`} />
        <div className={`${styles.star} ${styles.s8}`} />
      </div>

      {/* Content */}
      <div className={styles.featuredContent}>
        {/* Left — film identity */}
        <div className={styles.featuredLeft}>
          <div className={styles.posterFilmTitle}>
            {titleOutline && <span className={styles.titleOutline}>{titleOutline} </span>}
            <span className={styles.titleFilled}>{titleFilled}</span>
          </div>
        </div>

        {/* Right — frosted glass review panel */}
        <div className={styles.featuredRight}>
          <div className={styles.decoRing}>
            <div className={styles.decoScore}>{rating}</div>
            <div className={styles.decoScoreSub}>out of five</div>
          </div>
          <div className={styles.infoLabel}>Featured Review</div>
          <p className={styles.infoQuote}>&ldquo;{review.excerpt}&rdquo;</p>
          <div className={styles.infoMeta}>
            <div className={styles.infoCast}>
              <div className={styles.infoMetaKey}>Director</div>
              <div className={styles.infoMetaVal}>{review.director}</div>
            </div>
            {review.cast && (
              <div className={styles.infoCast}>
                <div className={styles.infoMetaKey}>Cast</div>
                <div className={styles.infoMetaVal}>{review.cast.split(',').map(s => s.trim()).join(' · ')}</div>
              </div>
            )}
            <div className={styles.infoCast}>
              <div className={styles.infoMetaKey}>Genre</div>
              <div className={styles.infoMetaVal}>{genres}</div>
            </div>
            <div className={styles.infoCast}>
              <div className={styles.infoMetaKey}>Year</div>
              <div className={styles.infoMetaVal}>{review.releaseYear}</div>
            </div>
          </div>
          <Link href={`/reviews/${review.slug}`} className={styles.infoBtn}>Read Full Review →</Link>
        </div>
      </div>
    </div>
  )
}
