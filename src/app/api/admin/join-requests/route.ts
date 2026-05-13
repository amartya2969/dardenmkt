import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

// GET /api/admin/join-requests?status=pending
// Returns all join requests (default: pending). Admin-only.
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user || !isAdminEmail(auth.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'pending'

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // status=all skips the filter so admins can audit history.
  const filter = status === 'all' ? '' : `&status=eq.${encodeURIComponent(status)}`
  const res = await fetch(
    `${url}/rest/v1/join_requests?select=*${filter}&order=created_at.desc`,
    {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      cache: 'no-store',
    }
  )
  if (!res.ok) {
    console.error('[admin/join-requests] list failed:', res.status, await res.text())
    return NextResponse.json({ error: 'Could not load requests.' }, { status: 500 })
  }
  const rows = await res.json()
  return NextResponse.json({ requests: rows })
}
