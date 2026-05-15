'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

// Microsoft OAuth via Supabase's `azure` provider (Azure AD / Entra ID v2.0).
// Works for both personal @outlook.com accounts AND work/school accounts
// like @virginia.edu / @darden.virginia.edu, since UVA's mailbox provider
// is Microsoft 365. That makes this the cleanest path for UVA users:
// they auth through UVA's own login page, no email delivery required.
export function MicrosoftButton({ next = '/' }: { next?: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleClick() {
    setBusy(true); setErr(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        // `openid profile email` are the minimum scopes for an OIDC sign-in.
        // `offline_access` keeps the session refreshable.
        scopes: 'openid profile email offline_access',
      },
    })
    if (error) {
      setErr(error.message)
      setBusy(false)
    }
    // On success the browser is redirected to Microsoft — no further action.
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="w-full h-11 rounded-xl font-semibold text-sm border border-gray-300 bg-white text-gray-800 flex items-center justify-center gap-2 transition-all hover:bg-gray-50 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MicrosoftIcon className="h-4 w-4" />}
        Continue with Microsoft
      </button>
      {err && <p className="text-xs text-center text-red-600 mt-2">{err}</p>}
    </>
  )
}

// Official Microsoft 4-square logo — the installed lucide-react is too old
// to ship one. Colours match Microsoft's brand guidelines.
function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 23 23" className={className} aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  )
}
