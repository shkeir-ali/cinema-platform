import Link from 'next/link'
import styles from './FilmStrip.module.css'

const collections = [
  { num: '01', category: 'Canon',    title: 'Criterion Essentials',  desc: 'The films that redefined what cinema could be.',         count: '38 films' },
  { num: '02', category: 'Studio',   title: 'The A24 Universe',      desc: 'Every release, ranked and dissected.',                  count: '24 films' },
  { num: '03', category: 'Auteur',   title: 'Directors I Trust',     desc: "Filmmakers whose entire body of work I've seen.",       count: '61 films' },
  { num: '04', category: 'Genre',    title: 'The Horror Canon',      desc: 'Essential dread from 1960 to now.',                    count: '44 films' },
  { num: '05', category: 'Decade',   title: 'Capsule: 2010s',        desc: 'The films that defined a generation.',                 count: '52 films' },
  { num: '06', category: 'Personal', title: 'Late Night Watches',    desc: 'Films best experienced after midnight.',               count: '17 films' },
]

export default function FilmStrip() {
  return (
    <div className={styles.filmstripSection}>
      <div className={styles.filmstripHeader}>
        <h2 className="section-title">The Collections</h2>
        <Link href="/lists" className="section-link">Browse all →</Link>
      </div>
      <div className={styles.filmstripWrap}>
        <div className={styles.filmstripPerfs} />
        <div className={styles.filmstripReel}>
          <div className={styles.filmstripInner}>
            {[...collections, ...collections].map((c, i) => (
              <div key={i} className={styles.filmFrame} data-num={c.num}>
                <div className={styles.filmFrameCategory}>{c.category}</div>
                <div className={styles.filmFrameTitle}>{c.title}</div>
                <div className={styles.filmFrameDesc}>{c.desc}</div>
                <div className={styles.filmFrameCount}>{c.count}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.filmstripPerfs} />
      </div>
    </div>
  )
}
