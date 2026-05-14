'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

// Inline LinkedIn glyph — the installed lucide-react is too old to ship one.
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 11.001-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

// Shared LinkedIn OAuth button used on both /auth/login and /auth/signup.
// Uses the OpenID Connect flow (linkedin_oidc) — the legacy `linkedin`
// provider is deprecated. Redirects through Supabase → /auth/callback,
// which exchanges the OAuth code for a session cookie.
export function LinkedInButton({ next = '/' }: { next?: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleClick() {
    setBusy(true); setErr(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        // openid+profile+email are LinkedIn's default OIDC scopes; explicit
        // for clarity. No scope needs LinkedIn Partner approval.
        scopes: 'openid profile email',
      },
    })
    if (error) {
      setErr(error.message)
      setBusy(false)
    }
    // On success the browser is redirected to LinkedIn — no further action.
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#0A66C2' /* LinkedIn brand blue */ }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkedInIcon className="h-4 w-4" />}
        Continue with LinkedIn
      </button>
      {err && <p className="text-xs text-center text-red-600 mt-2">{err}</p>}
    </>
  )
}
