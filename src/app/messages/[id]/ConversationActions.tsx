'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Ban, Flag, Trash2, Loader2 } from 'lucide-react'

interface Props {
  conversationId: string
  isResponder: boolean
  status: string
}

export function ConversationActions({ conversationId, isResponder, status }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  async function act(action: string) {
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Action failed'); setLoading(null); return }
      if (action === 'delete') {
        router.push('/messages')
      } else {
        router.refresh()
      }
    } catch {
      setError('Network error')
      setLoading(null)
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-500 px-1">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {isResponder && status === 'pending' && (
          <button
            onClick={() => act('accept')}
            disabled={loading !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#232D4B' }}
          >
            {loading === 'accept' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            Accept
          </button>
        )}
        {status !== 'blocked' && (
          <button
            onClick={() => act('block')}
            disabled={loading !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading === 'block' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
            Block
          </button>
        )}
        {status !== 'reported' && (
          <button
            onClick={() => act('report')}
            disabled={loading !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {loading === 'report' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-3.5 w-3.5" />}
            Report
          </button>
        )}
        <button
          onClick={() => act('delete')}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50 ml-auto"
        >
          {loading === 'delete' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          Delete
        </button>
      </div>
    </div>
  )
}
