import Link from 'next/link'
import styles from './FeaturedEssay.module.css'

export default function FeaturedEssay() {
  return (
    <div className={styles.essaySection}>
      <div className={styles.ghostNumber}>01</div>
      <div className={styles.label}>Featured Essay</div>
      <h2 className={styles.title}>
        Why Kubrick&apos;s obsession with <em>symmetry</em> still matters
      </h2>
      <p className={styles.excerpt}>
        Every frame a painting — but what does it mean when the geometry becomes the message? A deep dive into how Kubrick turned the camera into a philosophical instrument.
      </p>
      <Link href="/essays/kubrick-symmetry" className="pill-btn-light">Read the Essay →</Link>
    </div>
  )
}
