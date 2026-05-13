'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isAllowedUvaEmail, ALLOWED_EMAIL_HINT } from '@/lib/email-domain'
import { Mail, Loader2, MailCheck, ArrowLeft } from 'lucide-react'

const RESEND_COOLDOWN_S = 30

type Stage = 'email' | 'sent' | 'exists'

export function SignupForm() {
  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  // Send a one-time sign-in link. New users get auto-created (shouldCreateUser).
  // The callback lands on /auth/set-password where they choose a password.
  async function sendLink(addr: string) {
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/set-password?mode=signup')}`
    return supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
    })
  }

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setNote(null)
    if (!isAllowedUvaEmail(email)) {
      setErr(`Only ${ALLOWED_EMAIL_HINT} addresses are allowed.`)
      return
    }
    setBusy(true)
    // Pre-flight: tell the user upfront if an account already exists so they
    // don't get confused by a "sign-in link" arriving from a "sign-up" form.
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const { exists } = (await res.json()) as { exists: boolean }
      if (exists) {
        setBusy(false)
        setStage('exists')
        return
      }
    } catch {
      // Soft-fail: if the check itself errors, fall through to signInWithOtp
      // and let Supabase's own behavior take over. Better than blocking signup.
    }

    const { error } = await sendLink(email)
    setBusy(false)
    if (error) { setErr(error.message); return }
    setStage('sent')
    setCooldown(RESEND_COOLDOWN_S)
  }

  async function handleResend() {
    if (cooldown > 0 || busy) return
    setBusy(true); setNote(null); setErr(null)
    const { error } = await sendLink(email)
    setBusy(false)
    if (error) { setNote('Could not resend — please try again in a moment.'); return }
    setNote('New link sent. Check your inbox.')
    setCooldown(RESEND_COOLDOWN_S)
  }

  return (
    <>
      {/* ── Stage: enter email ── */}
      {stage === 'email' && (
        <form onSubmit={handleSendLink} className="space-y-4">
          {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>UVA Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="computing@virginia.edu" required autoComplete="email"
                className="w-full pl-9 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
              />
            </div>
          </div>
          <button type="submit" disabled={busy}
            className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#E57200' }}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send Sign-Up Link'}
          </button>
          <p className="text-center text-xs text-gray-400">
            We&apos;ll email you a one-time link. You&apos;ll set your password after clicking it.
          </p>
        </form>
      )}

      {/* ── Stage: account already exists ── */}
      {stage === 'exists' && (
        <div className="space-y-5">
          <div className="text-center space-y-3">
            <Mail className="h-14 w-14 mx-auto" style={{ color: '#232D4B' }} />
            <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Account already exists</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              <strong className="text-gray-700">{email}</strong> is already registered.<br />
              Sign in with your password instead.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ backgroundColor: '#232D4B' }}>
            Go to Sign In
          </Link>

          <div className="flex flex-col items-center gap-2 pt-1">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium hover:underline"
              style={{ color: '#E57200' }}>
              Forgot your password?
            </Link>
            <button type="button"
              onClick={() => { setStage('email'); setErr(null); setNote(null); setCooldown(0) }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-3 w-3" /> Use a different email
            </button>
          </div>
        </div>
      )}

      {/* ── Stage: link sent ── */}
      {stage === 'sent' && (
        <div className="space-y-5">
          <div className="text-center space-y-3">
            <MailCheck className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
            <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Check your inbox</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We sent a one-time sign-up link to<br />
              <strong className="text-gray-700">{email}</strong>
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Click the link on this device to finish creating your account.
            </p>
          </div>

          {note && <p className="text-xs text-center font-medium" style={{ color: '#E57200' }}>{note}</p>}

          <div className="flex flex-col items-center gap-3 pt-1">
            <button type="button" onClick={handleResend} disabled={cooldown > 0 || busy}
              className="text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              style={{ color: '#E57200' }}>
              {busy && cooldown === 0 ? 'Resending…' : cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend link'}
            </button>
            <button type="button"
              onClick={() => { setStage('email'); setErr(null); setNote(null); setCooldown(0) }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-3 w-3" /> Use a different email
            </button>
          </div>

          <p className="text-[11px] text-center text-gray-400">Link expires in 1 hour · Check spam if needed</p>
        </div>
      )}
    </>
  )
}
