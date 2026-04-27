import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  // Some flows (recovery, set-password) carry a token_hash + type instead of a code.
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'magiclink' | 'recovery' | 'invite' | 'signup' | 'email_change' | null
  // Surface the underlying Supabase error code in the URL so the user gets a useful message.
  const errCode = searchParams.get('error_code') ?? searchParams.get('error')

  if (errCode) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth&code=${encodeURIComponent(errCode)}`)
  }

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth`)
}
