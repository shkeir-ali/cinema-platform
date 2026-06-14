'use client'

import { useState } from 'react'
import { generatePreviewToken } from '../actions'

type Props = {
  id: number
  token: string | null
  variant?: 'table' | 'form'
}

export default function PreviewLink({ id, token, variant = 'table' }: Props) {
  const [currentToken, setCurrentToken] = useState(token)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    let t = currentToken
    if (!t) {
      t = await generatePreviewToken(id)
      setCurrentToken(t)
    }
    setLoading(false)
    window.open(`/preview/${t}`, '_blank', 'noreferrer')
  }

  if (variant === 'form') {
    return (
      <button type="button" onClick={handleClick} disabled={loading} style={formBtnStyle}>
        {loading ? 'Opening…' : 'Preview ↗'}
      </button>
    )
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} style={tableLink}>
      {loading ? '…' : 'Preview ↗'}
    </button>
  )
}

const tableLink: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--muted)',
  fontSize: '0.82rem',
  cursor: 'pointer',
  padding: 0,
  fontFamily: 'inherit',
  textDecoration: 'underline',
  textDecorationStyle: 'dotted',
}

const formBtnStyle: React.CSSProperties = {
  padding: '0.4rem 1rem',
  background: 'none',
  border: '1px solid rgba(142,59,78,0.3)',
  borderRadius: 4,
  color: 'var(--rose)',
  fontSize: '0.85rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
