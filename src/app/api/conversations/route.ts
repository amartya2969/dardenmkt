import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function adminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — list conversations for the current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conversations: data })
}

// POST — start a conversation + send first message
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listingId, message } = await request.json()
  if (!listingId || !message?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Get listing to find responder
  const { data: listing } = await supabase
    .from('listings')
    .select('id, user_id, status')
    .eq('id', listingId)
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (listing.user_id === user.id) return NextResponse.json({ error: 'Cannot message your own listing' }, { status: 400 })
  if (listing.status !== 'active') return NextResponse.json({ error: 'Listing is no longer active' }, { status: 400 })

  const admin = adminClient()

  // Check for existing conversation
  const { data: existing } = await admin
    .from('conversations')
    .select('id, status')
    .eq('listing_id', listingId)
    .eq('initiator_id', user.id)
    .maybeSingle()

  if (existing) {
    if (existing.status === 'blocked') {
      return NextResponse.json({ error: 'This conversation is no longer available.' }, { status: 403 })
    }
    return NextResponse.json({ conversationId: existing.id })
  }

  // Create conversation
  const { data: conv, error: convErr } = await admin
    .from('conversations')
    .insert({
      listing_id: listingId,
      initiator_id: user.id,
      responder_id: listing.user_id,
      status: 'pending',
    })
    .select('id')
    .single()

  if (convErr || !conv) return NextResponse.json({ error: convErr?.message ?? 'Failed to create conversation' }, { status: 500 })

  // Insert first message
  await admin.from('messages').insert({
    conversation_id: conv.id,
    sender_id: user.id,
    content: message.trim(),
  })

  return NextResponse.json({ conversationId: conv.id }, { status: 201 })
}
