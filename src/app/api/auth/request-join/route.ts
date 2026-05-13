import { NextResponse } from 'next/server'
import { isAllowedUvaEmail } from '@/lib/email-domain'

// Public endpoint — anyone can submit a request. No rate-limiting yet;
// the unique constraint on email prevents duplicate spam from one address.
export async function POST(request: Request) {
  let body: { email?: string; name?: string; reason?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase() ?? ''
  const name = body.name?.trim() ?? ''
  const reason = body.reason?.trim() ?? ''
  const password = body.password ?? ''

  if (!email || !isAllowedUvaEmail(email)) {
    return NextResponse.json(
      { error: 'A valid @virginia.edu or @darden.virginia.edu email is required.' },
      { status: 400 }
    )
  }
  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }
  if (password.length > 72) {
    // bcrypt has a 72-byte limit — reject before hitting Supabase
    return NextResponse.json({ error: 'Password is too long (max 72 chars).' }, { status: 400 })
  }
  if (reason.length > 500) {
    return NextResponse.json({ error: 'Reason is too long (max 500 chars).' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error('[request-join] missing SUPABASE env vars')
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
  }

  // 1) If the email is already a registered auth user → tell them to sign in.
  try {
    const userRes = await fetch(
      `${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        cache: 'no-store',
      }
    )
    if (userRes.ok) {
      const data = (await userRes.json()) as { users?: Array<{ email?: string }> }
      const exists = (data.users ?? []).some((u) => u.email?.toLowerCase() === email)
      if (exists) {
        return NextResponse.json(
          { status: 'account_exists', message: 'You already have an account — please sign in.' },
          { status: 200 }
        )
      }
    }
  } catch (err) {
    console.error('[request-join] user lookup failed:', err)
    // Soft-fail; continue to the request insert.
  }

  // 2) Try to insert a new join request. The unique(email) constraint makes
  // this safe under concurrent submissions — duplicates surface as 23505.
  const insertRes = await fetch(`${url}/rest/v1/join_requests`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ email, name, reason: reason || null, pending_password: password }),
  })

  if (insertRes.status === 201) {
    return NextResponse.json(
      { status: 'submitted', message: 'Request received. We&apos;ll be in touch by email.' },
      { status: 200 }
    )
  }

  // Postgres duplicate-key error → request already exists.
  if (insertRes.status === 409) {
    // Look up current status so we can give the user a meaningful update.
    try {
      const existRes = await fetch(
        `${url}/rest/v1/join_requests?email=eq.${encodeURIComponent(email)}&select=status`,
        {
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
          cache: 'no-store',
        }
      )
      const rows = (await existRes.json()) as Array<{ status?: string }>
      const status = rows[0]?.status ?? 'pending'
      return NextResponse.json(
        {
          status: 'request_exists',
          requestStatus: status,
          message:
            status === 'pending'
              ? 'A request for this email is already pending review.'
              : status === 'approved'
                ? 'This email was already approved — check your inbox for sign-in details.'
                : 'A previous request for this email was rejected. Contact the admin if you believe this is wrong.',
        },
        { status: 200 }
      )
    } catch {
      return NextResponse.json(
        { status: 'request_exists', message: 'A request for this email already exists.' },
        { status: 200 }
      )
    }
  }

  const errText = await insertRes.text()
  console.error('[request-join] insert failed:', insertRes.status, errText)
  return NextResponse.json({ error: 'Could not submit request. Please try again.' }, { status: 500 })
}
