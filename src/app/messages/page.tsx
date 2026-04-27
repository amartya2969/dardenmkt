import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Conversation } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

export const metadata = { title: 'Messages' }

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('conversations')
    .select(`
      *,
      listing:listings(id, title, images),
      initiator:profiles!conversations_initiator_id_fkey(full_name, email),
      responder:profiles!conversations_responder_id_fkey(full_name, email),
      messages(id, content, sender_id, created_at)
    `)
    .or(`initiator_id.eq.${user.id},responder_id.eq.${user.id}`)
    .neq('status', 'blocked')
    .order('created_at', { ascending: false })

  const conversations = (data ?? []) as Conversation[]

  function otherParty(c: Conversation) {
    const isInitiator = c.initiator_id === user!.id
    const other = isInitiator ? c.responder : c.initiator
    return other?.full_name ?? other?.email?.split('@')[0] ?? 'Unknown'
  }

  function lastMessage(c: Conversation) {
    if (!c.messages || c.messages.length === 0) return null
    return [...c.messages].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
  }

  const pending = conversations.filter((c) => c.status === 'pending')
  const active  = conversations.filter((c) => c.status === 'accepted')
  const other   = conversations.filter((c) => c.status === 'reported')

  function ConvRow({ c }: { c: Conversation }) {
    const last = lastMessage(c)
    const isResponder = c.responder_id === user!.id
    return (
      <Link
        href={`/messages/${c.id}`}
        className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors rounded-xl"
      >
        {/* Avatar */}
        <div
          className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ backgroundColor: '#232D4B' }}
        >
          {(otherParty(c)[0] ?? '?').toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{otherParty(c)}</p>
            {last && (
              <span className="text-[11px] text-gray-400 shrink-0">
                {formatRelativeTime(last.created_at)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {c.listing?.title ?? 'Listing deleted'}
          </p>
          {last && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{last.content}</p>
          )}
        </div>

        {/* Status pill */}
        {c.status === 'pending' && isResponder && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
            New
          </span>
        )}
        {c.status === 'reported' && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0">
            Reported
          </span>
        )}
      </Link>
    )
  }

  const isEmpty = conversations.length === 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight mb-6" style={{ color: '#232D4B' }}>
        Messages
      </h1>

      {isEmpty ? (
        <div className="text-center py-20 space-y-3">
          <MessageCircle className="h-10 w-10 mx-auto text-gray-200" />
          <p className="text-gray-400 text-sm">No conversations yet.</p>
          <Link href="/listings" className="text-sm font-semibold" style={{ color: '#E57200' }}>
            Browse listings →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
                Pending
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {pending.map((c) => <ConvRow key={c.id} c={c} />)}
              </div>
            </section>
          )}
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
                Active
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {active.map((c) => <ConvRow key={c.id} c={c} />)}
              </div>
            </section>
          )}
          {other.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
                Reported
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                {other.map((c) => <ConvRow key={c.id} c={c} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
