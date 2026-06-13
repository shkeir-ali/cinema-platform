import { db } from '@/lib/db'
import Link from 'next/link'
import LatestReviewsCarousel from './LatestReviewsCarousel'
import styles from './LatestReviews.module.css'

export default async function LatestReviews() {
  const reviews = await db.review.findMany({
    where: { published: true, isFeatured: false },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      slug: true,
      title: true,
      director: true,
      releaseYear: true,
      posterPath: true,
      genres: true,
      myRating: true,
    },
  })

  return (
    <div className={styles.reviewsSection}>
      <div className="section-header">
        <h2 className="section-title">Reviews</h2>
        <Link href="/reviews" className="section-link">View all →</Link>
      </div>
      <LatestReviewsCarousel reviews={reviews} />
    </div>
  )
}
