import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function adminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — list conversations for the current user. Includes both listing-based
// and team-based conversations.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      listing:listings(id, title, images),
      team:teams(id, title),
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

// POST — start a conversation + send first message.
// Accepts either { listingId } OR { teamId }. The DB enforces exactly-one-of.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listingId, teamId, message } = (await request.json()) as {
    listingId?: string; teamId?: string; message?: string
  }
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }
  if ((listingId && teamId) || (!listingId && !teamId)) {
    return NextResponse.json({ error: 'Provide exactly one of listingId or teamId' }, { status: 400 })
  }

  // Look up the target (listing or team) to find the responder + verify it's
  // active and not owned by the requester.
  let ownerId: string
  let isActive: boolean
  if (listingId) {
    const { data: listing } = await supabase
      .from('listings')
      .select('user_id, status')
      .eq('id', listingId)
      .single()
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    ownerId = listing.user_id
    isActive = listing.status === 'active'
    if (!isActive) return NextResponse.json({ error: 'Listing is no longer active' }, { status: 400 })
  } else {
    const { data: team } = await supabase
      .from('teams')
      .select('user_id, status')
      .eq('id', teamId!)
      .single()
    if (!team) return NextResponse.json({ error: 'Team post not found' }, { status: 404 })
    ownerId = team.user_id
    // teams.status uses 'active'/'filled'/'closed' — anything non-active blocks.
    isActive = team.status === 'active'
    if (!isActive) return NextResponse.json({ error: 'Team post is no longer active' }, { status: 400 })
  }
  if (ownerId === user.id) {
    return NextResponse.json({ error: 'Cannot message your own post' }, { status: 400 })
  }

  const admin = adminClient()

  // Check for existing conversation for THIS user against THIS target.
  let existingQuery = admin
    .from('conversations')
    .select('id, status')
    .eq('initiator_id', user.id)
  existingQuery = listingId
    ? existingQuery.eq('listing_id', listingId)
    : existingQuery.eq('team_id', teamId!)
  const { data: existing } = await existingQuery.maybeSingle()

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
      listing_id: listingId ?? null,
      team_id: teamId ?? null,
      initiator_id: user.id,
      responder_id: ownerId,
      status: 'pending',
    })
    .select('id')
    .single()

  if (convErr || !conv) {
    return NextResponse.json({ error: convErr?.message ?? 'Failed to create conversation' }, { status: 500 })
  }

  // Insert first message
  await admin.from('messages').insert({
    conversation_id: conv.id,
    sender_id: user.id,
    content: message.trim(),
  })

  return NextResponse.json({ conversationId: conv.id }, { status: 201 })
}
