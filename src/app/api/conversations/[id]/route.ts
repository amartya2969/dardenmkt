import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function adminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// PATCH — accept | block | report | delete
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await request.json()
  if (!['accept', 'block', 'report', 'delete'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const admin = adminClient()

  const { data: conv } = await admin
    .from('conversations')
    .select('initiator_id, responder_id, status')
    .eq('id', id)
    .single()

  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isParticipant = conv.initiator_id === user.id || conv.responder_id === user.id
  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const isResponder = conv.responder_id === user.id

  if (action === 'delete') {
    await admin.from('conversations').delete().eq('id', id)
    return NextResponse.json({ ok: true })
  }

  if (action === 'accept' && !isResponder) {
    return NextResponse.json({ error: 'Only the listing owner can accept' }, { status: 403 })
  }

  const statusMap = { accept: 'accepted', block: 'blocked', report: 'reported' } as const
  const newStatus = statusMap[action as keyof typeof statusMap]

  await admin.from('conversations').update({ status: newStatus }).eq('id', id)
  return NextResponse.json({ ok: true, status: newStatus })
}
