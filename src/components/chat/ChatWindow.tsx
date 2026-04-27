'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2 } from 'lucide-react'
import type { Message, Conversation } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

interface Props {
  conversation: Conversation
  currentUserId: string
  initialMessages: Message[]
}

export function ChatWindow({ conversation, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const isInitiator = conversation.initiator_id === currentUserId
  const canSend = conversation.status === 'accepted' || isInitiator

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
    if (data) setMessages(data as Message[])
  }, [conversation.id, supabase])

  // Poll every 3 seconds for new messages
  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    setError('')
    const content = input.trim()
    setInput('')

    const { error: err } = await supabase.from('messages').insert({
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content,
    })

    if (err) {
      setError('Failed to send. Try again.')
      setInput(content)
    } else {
      // Immediately fetch so sender sees their message without waiting for poll
      await fetchMessages()
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">No messages yet.</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
                style={isMine ? { backgroundColor: '#232D4B' } : undefined}
              >
                <p className="break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                  {formatRelativeTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {canSend ? (
        <form onSubmit={sendMessage} className="border-t border-gray-100 px-4 py-3 flex gap-2 bg-white">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            maxLength={2000}
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#232D4B]/20 focus:border-[#232D4B]"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex items-center justify-center w-9 h-9 rounded-full text-white disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: '#E57200' }}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      ) : (
        <div className="border-t border-gray-100 px-4 py-3 text-center text-sm text-gray-400 bg-gray-50">
          Waiting for the seller to accept this conversation.
        </div>
      )}

      {error && <p className="px-4 pb-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
