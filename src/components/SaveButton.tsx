'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'

export function SaveButton({ listingId }: { listingId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch(`/api/saved?listingId=${listingId}`)
      .then((r) => (r.ok ? r.json() : { saved: false }))
      .then((d) => { setSaved(d.saved); setChecked(true) })
      .catch(() => setChecked(true))
  }, [listingId])

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      if (res.ok) {
        const d = await res.json()
        setSaved(d.saved)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!checked) return null

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-all disabled:opacity-60"
      title={saved ? 'Remove from saved' : 'Save listing'}
    >
      <Heart
        className="h-4 w-4 transition-colors"
        style={{
          color: saved ? '#E57200' : '#9ca3af',
          fill: saved ? '#E57200' : 'none',
          strokeWidth: saved ? 0 : 2,
        }}
      />
    </button>
  )
}
