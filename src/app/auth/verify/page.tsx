'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'

/**
 * Interstitial verification page.
 *
 * The email link points HERE — not directly at supabase.co/auth/v1/verify.
 * The token_hash sits in the URL but verifyOtp is only fired when the user
 * clicks the button. Microsoft Defender's Safe Links pre-scans by issuing a
 * GET; this page's GET handler renders the button without calling verifyOtp,
 * so the prefetch is harmless and the token survives until the real human
 * clicks Continue.
 */
function VerifyInner() {
  const router = useRouter()
  const params = useSearchParams()
  const tokenHash = params.get('token_hash')
  const type = params.get('type') as
    | 'invite' | 'magiclink' | 'recovery' | 'signup' | 'email_change' | null
  const next = params.get('next') ?? '/'

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleContinue() {
    if (!tokenHash || !type) {
      setErr('This link is malformed. Request a new one.')
      return
    }
    setBusy(true); setErr(null)
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      setBusy(false)
      // Friendlier copy than Supabase's raw message.
      if (error.message.includes('expired') || error.message.includes('not found')) {
        setErr('This link has expired or already been used. Request a fresh one.')
      } else {
        setErr(error.message)
      }
      return
    }
    // Use replace so the back button doesn't return to this consumed link.
    const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
    router.replace(safeNext)
    router.refresh()
  }

  // Hard-broken link (missing params entirely)
  if (!tokenHash || !type) {
    return (
      <Shell>
        <div className="text-center space-y-3">
          <AlertCircle className="h-14 w-14 mx-auto text-red-500" />
          <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Invalid link</h2>
          <p className="text-sm text-gray-500">
            This link is missing required information. Please request a new email.
          </p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-5">
        <div className="text-center space-y-3">
          <ShieldCheck className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
          <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>
            {type === 'recovery' ? 'Reset your password' : 'Confirm your email'}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Click <strong>Continue</strong> to {type === 'recovery'
              ? 'verify it\'s you and set a new password.'
              : 'verify your email and finish setting up your account.'}
          </p>
        </div>

        {err && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>
        )}

        <button
          type="button" onClick={handleContinue} disabled={busy}
          className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#E57200' }}
        >
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</> : 'Continue'}
        </button>

        <p className="text-[11px] text-center text-gray-400">
          We do this extra step to protect your account from email-scanning bots that pre-click links.
        </p>
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-2xl font-extrabold">
            <span style={{ color: '#232D4B' }}>UV</span>
            <span style={{ color: '#E57200' }}>Mkt</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <Shell>
        <div className="flex justify-center items-center">
          <Mail className="h-6 w-6 text-gray-300" />
        </div>
      </Shell>
    }>
      <VerifyInner />
    </Suspense>
  )
}
