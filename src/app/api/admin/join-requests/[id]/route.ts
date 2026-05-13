import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

// PATCH /api/admin/join-requests/<id>
// Body: { action: 'approve' | 'reject' }
//
// On approve:
//   1. Reads the password the user supplied at request time
//      (join_requests.pending_password).
//   2. Creates a real auth user with email_confirm=true using that password.
//   3. Marks the join_request as approved AND nulls pending_password in the
//      same PATCH so plain text is wiped from the DB immediately.
//   4. Falls back to a generated temp password for legacy rows that don't
//      have one stored — returned to the admin to share out-of-band.
//
// On reject: flips status to 'rejected' and nulls pending_password.
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
    id: string; email: string; name: string; status: string; pending_password: string | null
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
          // Wipe any stored password — no longer needed.
          pending_password: null,
        }),
      }
    )
    return NextResponse.json({ status: 'rejected' })
  }

  if (body.action !== 'approve') {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
  }

  // Preferred path: use the password the user picked when submitting the
  // request, so they can log in immediately with credentials they already know.
  // Fallback: generate one for legacy rows (created before the password column
  // existed) — admin can copy and share it.
  const useUserPassword = !!req.pending_password
  const passwordToUse =
    req.pending_password ?? randomBytes(12).toString('base64url').slice(0, 14)

  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      email: req.email,
      password: passwordToUse,
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
        // Plain-text password is no longer needed — wipe it.
        pending_password: null,
      }),
    }
  )

  return NextResponse.json({
    status: 'approved',
    email: req.email,
    name: req.name,
    // Only surface a password to the admin when one had to be generated
    // (legacy rows). When the user chose their own, they already know it.
    tempPassword: useUserPassword ? null : passwordToUse,
    userChosePassword: useUserPassword,
  })
}
