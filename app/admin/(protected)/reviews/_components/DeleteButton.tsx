'use client'

import { deleteReview } from '../actions'

export default function DeleteButton({ id, title }: { id: number; title: string }) {
  return (
    <form
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) e.preventDefault()
      }}
      action={deleteReview.bind(null, id)}
      style={{ display: 'inline' }}
    >
      <button type="submit" style={{
        display: 'inline-block',
        padding: '0.2rem 0.6rem',
        borderRadius: 4,
        background: 'rgba(150,150,150,0.07)',
        color: 'var(--muted)',
        fontSize: '0.78rem',
        fontWeight: 500,
        border: '1px solid transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}>
        Delete
      </button>
    </form>
  )
}
