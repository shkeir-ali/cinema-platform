import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ReviewForm from '../../_components/ReviewForm'
import { updateReview } from '../../actions'

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const review = await db.review.findUnique({ where: { id: parseInt(id) } })
  if (!review) notFound()

  return (
    <div>
      <h1 style={heading}>
        Edit Review
        <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '1.05rem', marginLeft: '0.75rem' }}>
          {review.title}
        </span>
      </h1>
      <div style={{ background: 'var(--surface)', borderRadius: 8, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(142,59,78,0.08)', overflow: 'hidden' }}>
        <ReviewForm action={updateReview} review={review} />
      </div>
    </div>
  )
}

const heading: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '1.75rem',
  fontWeight: 600,
  color: 'var(--text)',
  margin: '0 0 1.5rem',
}
