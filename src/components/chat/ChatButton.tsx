'use client'

import { useState } from 'react'
import { MessageCircle, Send, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ChatButton({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, message }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to send.'); setLoading(false); return }
      router.push(`/messages/${data.conversationId}`)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: '#232D4B' }}
      >
        <MessageCircle className="h-4 w-4" />
        Message Seller
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={`Hi, I'm interested in "${listingTitle}"…`}
          rows={4}
          maxLength={2000}
          autoFocus
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#232D4B]/20 focus:border-[#232D4B]"
        />
        <button type="button" onClick={() => { setOpen(false); setError('') }}
          className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button type="submit" disabled={loading || !message.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#E57200' }}>
        {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</> : <><Send className="h-3.5 w-3.5" /> Send Message</>}
      </button>
    </form>
  )
}
