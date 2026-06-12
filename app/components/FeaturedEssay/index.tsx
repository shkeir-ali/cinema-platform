import Link from 'next/link'
import { db } from '@/lib/db'
import styles from './FeaturedEssay.module.css'

export default async function FeaturedEssay() {
  const post = await db.post.findFirst({
    where: { isFeatured: true, published: true },
  })

  if (!post) return null

  return (
    <div className={styles.essaySection}>
      <div className={styles.ghostNumber}>01</div>
      <div className={styles.label}>Featured Essay</div>
      <h2 className={styles.title}>{post.title}</h2>
      <p className={styles.excerpt}>{post.excerpt}</p>
      <Link href={`/essays/${post.slug}`} className="pill-btn">Read the Essay →</Link>
    </div>
  )
}
