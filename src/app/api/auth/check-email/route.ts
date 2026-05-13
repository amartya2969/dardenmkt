import { NextResponse } from 'next/server'

// Calls Supabase's admin REST API to look up a user by email.
// Service role key must be kept server-side — never expose to the browser.
export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string }
    if (!email || typeof email !== 'string' || !email.endsWith('@virginia.edu')) {
      // Don't even bother hitting Supabase for invalid input.
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      console.error('[check-email] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      // Fail open — better to let signup proceed than block users on a config error.
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    // Admin REST endpoint supports ?email= filter and returns { users: [...] }
    const res = await fetch(
      `${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        // Don't cache — registration state changes constantly.
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      console.error('[check-email] admin API returned', res.status)
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    const data = (await res.json()) as { users?: Array<{ email?: string }> }
    // Some Supabase versions still return all users when no email filter exists
    // server-side, so verify the match explicitly.
    const exists = (data.users ?? []).some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )
    return NextResponse.json({ exists }, { status: 200 })
  } catch (err) {
    console.error('[check-email] unexpected error:', err)
    return NextResponse.json({ exists: false }, { status: 200 })
  }
}
