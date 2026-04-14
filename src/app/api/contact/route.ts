import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, contactEmailHtml } from '@/lib/email'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dardenmkt.vercel.app'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { listingId?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { listingId, message } = body
  if (!listingId || !message?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (message.trim().length > 2000) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, contact_email, user_id')
    .eq('id', listingId)
    .eq('status', 'active')
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (listing.user_id === user.id) {
    return NextResponse.json({ error: 'Cannot contact your own listing' }, { status: 400 })
  }

  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  const senderEmail = senderProfile?.email ?? user.email ?? ''
  const listingUrl = `${SITE}/listings/${listingId}`

  await sendEmail({
    to: listing.contact_email,
    subject: `New message about your listing: ${listing.title}`,
    html: contactEmailHtml({
      listingTitle: listing.title,
      message: message.trim(),
      senderEmail,
      listingUrl,
    }),
  })

  return NextResponse.json({ ok: true })
}
