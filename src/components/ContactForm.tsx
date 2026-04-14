'use client'

import { useState } from 'react'
import { MessageSquare, Send, CheckCircle, X } from 'lucide-react'

interface ContactFormProps {
  listingId: string
  listingTitle: string
}

export function ContactForm({ listingId, listingTitle }: ContactFormProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, message }),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-800 text-sm">Message sent!</p>
          <p className="text-green-700 text-xs mt-0.5">The seller will be notified by email.</p>
        </div>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: '#232D4B' }}
      >
        <MessageSquare className="h-4 w-4" />
        Message Seller
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Hi, I'm interested in "${listingTitle}"…`}
          rows={4}
          maxLength={2000}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:border-[#232D4B]"
          style={{ '--tw-ring-color': 'rgba(35,45,75,0.2)' } as React.CSSProperties}
          autoFocus
        />
        <button
          type="button"
          onClick={() => { setOpen(false); setStatus('idle') }}
          className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-500">Failed to send. Please try again.</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending' || !message.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#E57200' }}
      >
        <Send className="h-3.5 w-3.5" />
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
