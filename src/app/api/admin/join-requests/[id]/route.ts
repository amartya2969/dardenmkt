import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

// PATCH /api/admin/join-requests/<id>
// Body: { action: 'approve' | 'reject' }
//
// On approve:
//   1. Creates a real auth user with email_confirm=true and a freshly
//      generated 12-char password.
//   2. Marks the join_request as approved.
//   3. Returns the temp password ONCE in the response so the admin can
//      hand it to the user (out-of-band, since UVA ITS may filter mail).
//
// On reject: just flips status to 'rejected'.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user || !isAdminEmail(auth.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid request id' }, { status: 400 })
  }

  let body: { action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const adminHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  } as const

  // Fetch the request row so we have email + current status.
  const lookupRes = await fetch(
    `${url}/rest/v1/join_requests?id=eq.${encodeURIComponent(id)}&select=*`,
    { headers: adminHeaders, cache: 'no-store' }
  )
  const rows = (await lookupRes.json()) as Array<{
    id: string; email: string; name: string; status: string
  }>
  const req = rows[0]
  if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  if (req.status !== 'pending') {
    return NextResponse.json(
      { error: `Request is already ${req.status}.` },
      { status: 409 }
    )
  }

  if (body.action === 'reject') {
    await fetch(
      `${url}/rest/v1/join_requests?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: auth.user.id,
        }),
      }
    )
    return NextResponse.json({ status: 'rejected' })
  }

  if (body.action !== 'approve') {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
  }

  // 12-byte base64 → ~16 readable chars; ample entropy for a temp password
  // the admin shares out-of-band and the user replaces on first sign-in.
  const tempPassword = randomBytes(12).toString('base64url').slice(0, 14)

  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      email: req.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: req.name, source: 'admin_approval' },
    }),
  })

  if (!createRes.ok) {
    const errText = await createRes.text()
    console.error('[approve] createUser failed:', createRes.status, errText)
    // Surface a hint if the user already exists in auth.
    if (errText.includes('already been registered') || createRes.status === 422) {
      return NextResponse.json(
        { error: 'This email already has an auth account. Mark the request approved manually if needed.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Could not create user.' }, { status: 500 })
  }

  await fetch(
    `${url}/rest/v1/join_requests?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: auth.user.id,
      }),
    }
  )

  return NextResponse.json({
    status: 'approved',
    email: req.email,
    name: req.name,
    tempPassword,
  })
}
