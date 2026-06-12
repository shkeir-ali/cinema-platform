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

  return (
    <div className={styles.featuredWrap}>
      <div className={styles.featuredPoster}>
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
        <div className={styles.posterSceneImg} />
        <div className={styles.posterBody}>
          <div className={styles.posterGenreTag}>{genres}</div>
          <div className={styles.posterFilmTitle}>
            {renderTitle(review.titleDisplay, review.title)}
          </div>
          <div className={styles.posterDivider} />
          <div className={styles.posterDir}>{review.director} · {review.releaseYear}</div>
        </div>
      </div>

      <div className={styles.featuredInfo}>
        <div className={styles.infoContent}>
          <div className={styles.infoLabel}>Featured Review</div>
          <div className={styles.infoHeadline}>
            {review.excerpt}
          </div>
          <p className={styles.infoQuote}>
            &ldquo;{review.excerpt}&rdquo;
          </p>
          {review.cast && (
            <div className={styles.infoCast}>
              <div className={styles.infoMetaKey}>Cast</div>
              <div className={styles.infoMetaVal}>{review.cast?.split(',').map(s => s.trim()).join(' · ')}</div>
            </div>
          )}
          <Link href={`/reviews/${review.slug}`} className="pill-btn">Read Full Review →</Link>
        </div>
        <div className={styles.infoDeco}>
          <div className={styles.decoRing}>
            <div className={styles.decoScore}>{rating}</div>
            <div className={styles.decoScoreSub}>out of five</div>
          </div>
          <div className={styles.decoVline} />
          <div className={styles.decoVtitle}>{review.title}</div>
        </div>
      </div>
    </div>
  )
}
