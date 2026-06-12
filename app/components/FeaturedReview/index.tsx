import Link from 'next/link'
import styles from './FeaturedReview.module.css'

export default function FeaturedReview() {
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
          <div className={styles.posterGenreTag}>Romance · Musical</div>
          <div className={styles.posterFilmTitle}>La La<em>Land</em></div>
          <div className={styles.posterDivider} />
          <div className={styles.posterDir}>Damien Chazelle · 2016</div>
        </div>
      </div>

      <div className={styles.featuredInfo}>
        <div className={styles.infoContent}>
          <div className={styles.infoLabel}>Featured Review</div>
          <div className={styles.infoHeadline}>
            A film that dares to ask<br />what it costs to <em>chase a dream.</em>
          </div>
          <p className={styles.infoQuote}>
            &ldquo;Chazelle makes melancholy feel like magic — a love letter to ambition and the people we leave behind in its pursuit.&rdquo;
          </p>
          <div className={`${styles.infoCast}`}>
            <div className={styles.infoMetaKey}>Cast</div>
            <div className={styles.infoMetaVal}>Ryan Gosling · Emma Stone · John Legend</div>
          </div>
          <Link href="/reviews/la-la-land" className="pill-btn">Read Full Review →</Link>
        </div>
        <div className={styles.infoDeco}>
          <div className={styles.decoRing}>
            <div className={styles.decoScore}>5.0</div>
            <div className={styles.decoScoreSub}>out of five</div>
          </div>
          <div className={styles.decoVline} />
          <div className={styles.decoVtitle}>La La Land</div>
        </div>
      </div>
    </div>
  )
}
