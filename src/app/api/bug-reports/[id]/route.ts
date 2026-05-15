import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

// PATCH — admin-only status / notes update.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body = await request.json() as { status?: string; notes?: string }
  const VALID = ['new', 'investigating', 'fixed', 'wontfix', 'duplicate']
  if (body.status && !VALID.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const patch: Record<string, unknown> = {
    reviewed_at: new Date().toISOString(),
    reviewed_by: user.id,
  }
  if (body.status) patch.status = body.status
  if (typeof body.notes === 'string') patch.notes = body.notes

  const res = await fetch(
    `${url}/rest/v1/bug_reports?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    }
  )
  if (!res.ok) {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
