'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PreviewRefresher() {
  const router = useRouter()

  useEffect(() => {
    const ch = new BroadcastChannel('cinema-preview')
    ch.onmessage = () => router.refresh()
    return () => ch.close()
  }, [router])

  return null
}
