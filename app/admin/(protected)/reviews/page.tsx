import { db } from '@/lib/db'
import { togglePublished } from './actions'
import Link from 'next/link'
import DeleteButton from './_components/DeleteButton'
import PreviewLink from './_components/PreviewLink'

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, releaseYear: true, myRating: true,
      published: true, isFeatured: true, slug: true, previewToken: true,
    },
  })

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={heading}>Reviews</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--muted)', fontSize: '0.875rem' }}>
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} total
          </p>
        </div>
        <Link href="/admin/reviews/new" style={newBtn}>+ New Review</Link>
      </div>

      {reviews.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface)', borderRadius: 8, border: '1px dashed rgba(142,59,78,0.2)' }}>
          No reviews yet. <Link href="/admin/reviews/new" style={{ color: 'var(--rose)' }}>Create the first one →</Link>
        </div>
      ) : (
        <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(142,59,78,0.1)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: 'var(--surface)' }}>
                  {['Title', 'Year', 'Rating', 'Status', 'Featured', 'Actions'].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} style={{ background: 'var(--bg)' }} className="admin-row">
                    <td style={td}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem' }}>{r.title}</span>
                      <br />
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>/{r.slug}</span>
                    </td>
                    <td style={tdCenter}>{r.releaseYear}</td>
                    <td style={tdCenter}>
                      <span style={{ fontWeight: 600 }}>{r.myRating}</span>
                      <span style={{ color: 'var(--amber)', marginLeft: 2 }}>★</span>
                    </td>
                    <td style={tdCenter}>
                      <form action={togglePublished.bind(null, r.id, r.published)} style={{ display: 'inline' }}>
                        <button
                          type="submit"
                          style={pillStyle(r.published)}
                          title={r.published ? 'Click to unpublish' : 'Click to publish'}
                        >
                          <span style={dot(r.published)} />
                          {r.published ? 'Published' : 'Draft'}
                        </button>
                      </form>
                    </td>
                    <td style={tdCenter}>
                      {r.isFeatured
                        ? <span style={{ color: 'var(--amber)', fontSize: '0.82rem', fontWeight: 600 }}>★ Featured</span>
                        : <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>—</span>
                      }
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link href={`/admin/reviews/${r.id}/edit`} style={actionPill}>Edit</Link>
                        <DeleteButton id={r.id} title={r.title} />
                        <PreviewLink id={r.id} token={r.previewToken ?? null} variant="table" />
                        {r.published && (
                          <a href={`/reviews/${r.slug}`} target="_blank" rel="noreferrer" style={{ ...actionPill, background: 'transparent', border: '1px solid rgba(142,59,78,0.18)', color: 'var(--muted)' }}>
                            View ↗
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .admin-row:hover { background: rgba(142,59,78,0.03) !important; }
      `}</style>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const heading: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.75rem',
  fontWeight: 600,
  color: 'var(--text)',
  margin: 0,
}

const newBtn: React.CSSProperties = {
  padding: '0.6rem 1.4rem',
  background: 'var(--rose)',
  color: '#fff',
  borderRadius: 6,
  textDecoration: 'none',
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  fontSize: '0.95rem',
  letterSpacing: '0.01em',
  boxShadow: '0 2px 6px rgba(142,59,78,0.25)',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.875rem',
}

const th: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderBottom: '2px solid rgba(142,59,78,0.12)',
  textAlign: 'left',
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--muted)',
  whiteSpace: 'nowrap',
}

const td: React.CSSProperties = {
  padding: '0.75rem 1rem',
  verticalAlign: 'middle',
  borderBottom: '1px solid rgba(142,59,78,0.06)',
}

const tdCenter: React.CSSProperties = { ...td, textAlign: 'center' }

const pillStyle = (published: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.2rem 0.6rem',
  borderRadius: 99,
  fontSize: '0.75rem',
  fontWeight: 600,
  border: published ? '1px solid rgba(34,139,34,0.28)' : '1px solid rgba(150,150,150,0.28)',
  background: published ? 'rgba(34,139,34,0.07)' : 'rgba(150,150,150,0.07)',
  color: published ? '#1a7a1a' : 'var(--muted)',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
})

const dot = (published: boolean): React.CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: published ? '#22a022' : 'var(--muted)',
  flexShrink: 0,
})

const actionPill: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.2rem 0.6rem',
  borderRadius: 4,
  background: 'rgba(142,59,78,0.07)',
  color: 'var(--rose)',
  textDecoration: 'none',
  fontSize: '0.78rem',
  fontWeight: 500,
  border: '1px solid transparent',
}
