import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ConversationActions } from './ConversationActions'
import type { Conversation, Message } from '@/types'

export const dynamic = 'force-dynamic'

function adminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function statusLabel(status: string) {
  if (status === 'pending') return { text: 'Pending', cls: 'bg-amber-100 text-amber-700' }
  if (status === 'accepted') return { text: 'Active', cls: 'bg-green-100 text-green-700' }
  if (status === 'reported') return { text: 'Reported', cls: 'bg-red-100 text-red-600' }
  return { text: status, cls: 'bg-gray-100 text-gray-600' }
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = adminClient()

  const { data: conv } = await admin
    .from('conversations')
    .select(`
      *,
      listing:listings(id, title, images),
      initiator:profiles!conversations_initiator_id_fkey(full_name, email),
      responder:profiles!conversations_responder_id_fkey(full_name, email)
    `)
    .eq('id', id)
    .single()

  if (!conv) notFound()

  const isParticipant = conv.initiator_id === user.id || conv.responder_id === user.id
  if (!isParticipant) notFound()

  const { data: msgs } = await admin
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const conversation = conv as Conversation
  const messages = (msgs ?? []) as Message[]

  const isResponder = conv.responder_id === user.id
  const other = isResponder
    ? (conv.initiator as { full_name: string | null; email: string })
    : (conv.responder as { full_name: string | null; email: string })
  const otherName = other?.full_name ?? other?.email?.split('@')[0] ?? 'Unknown'

  const badge = statusLabel(conv.status)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="mb-4">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to messages
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: '#232D4B' }}
              >
                {(otherName[0] ?? '?').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{otherName}</p>
                {conversation.listing && (
                  <Link
                    href={`/listings/${conversation.listing.id}`}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
                  >
                    <ShoppingBag className="h-3 w-3" />
                    {conversation.listing.title}
                  </Link>
                )}
              </div>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
              {badge.text}
            </span>
          </div>

          {/* Responder sees accept/block/report when pending */}
          {conv.status !== 'blocked' && (
            <ConversationActions
              conversationId={id}
              isResponder={isResponder}
              status={conv.status}
            />
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
        <ChatWindow
          conversation={conversation}
          currentUserId={user.id}
          initialMessages={messages}
        />
      </div>
    </div>
  )
}
