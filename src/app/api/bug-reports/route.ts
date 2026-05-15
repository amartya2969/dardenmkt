import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

// POST — submit a new bug report. Anyone can submit (signed-in or not).
// If signed in we attach user_id + email for follow-up. URL + user-agent
// help us reproduce.
export async function POST(request: Request) {
  let body: { title?: string; description?: string; url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const title = body.title?.trim() ?? ''
  const description = body.description?.trim() ?? ''
  const url = body.url?.trim() ?? null

  if (title.length < 3) return NextResponse.json({ error: 'Title is too short.' }, { status: 400 })
  if (title.length > 150) return NextResponse.json({ error: 'Title is too long.' }, { status: 400 })
  if (description.length < 10) return NextResponse.json({ error: 'Please describe the bug in more detail.' }, { status: 400 })
  if (description.length > 5000) return NextResponse.json({ error: 'Description is too long.' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
  }

  const userAgent = request.headers.get('user-agent')

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/bug_reports`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      user_id: user?.id ?? null,
      reporter_email: user?.email ?? null,
      title,
      description,
      url,
      user_agent: userAgent,
    }),
  })

  if (!insertRes.ok) {
    console.error('[bug-reports] insert failed:', insertRes.status, await insertRes.text())
    return NextResponse.json({ error: 'Could not save your report. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// GET — admin only, list reports. Optional ?status=new (defaults to "open"
// which is anything other than fixed/wontfix/duplicate).
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'open'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // "open" is a virtual filter: anything not yet resolved.
  const filter =
    status === 'all'
      ? ''
      : status === 'open'
        ? '&status=in.(new,investigating)'
        : `&status=eq.${encodeURIComponent(status)}`

  const res = await fetch(
    `${supabaseUrl}/rest/v1/bug_reports?select=*${filter}&order=created_at.desc`,
    {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      cache: 'no-store',
    }
  )
  if (!res.ok) {
    return NextResponse.json({ error: 'Could not load reports.' }, { status: 500 })
  }
  return NextResponse.json({ reports: await res.json() })
}
