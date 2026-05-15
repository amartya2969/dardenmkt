'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isAllowedUvaEmail, ALLOWED_EMAIL_HINT } from '@/lib/email-domain'
import { Mail, Loader2, MailCheck, ArrowLeft } from 'lucide-react'

/**
 * Sign-up paths, in priority order:
 *   1. Microsoft OAuth — best for UVA students (no email delivery needed)
 *   2. LinkedIn OAuth   — for anyone outside UVA
 *   3. Magic link to email — for UVA users who prefer email auth. UVA ITS
 *      quarantines (not blocks) these, so users may need to release the
 *      first message from Outlook quarantine; subsequent sends improve
 *      via Defender's reputation learning.
 *
 * The admin-approved join-request flow still exists at /api/auth/request-join
 * and /admin/join-requests as a backup, but isn't surfaced in the UI anymore.
 */

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

  // POSTs to our server-side route which uses admin.generateLink + Resend.
  // Returns null on success, an error string otherwise, or 'exists' if the
  // address already has an account.
  async function sendLink(addr: string): Promise<'ok' | 'exists' | string> {
    const res = await fetch('/api/auth/send-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: addr, mode: 'signup' }),
    })
    const data = (await res.json()) as {
      ok?: boolean; error?: string; message?: string
    }
    if (data.ok) return 'ok'
    if (data.error === 'account_exists') return 'exists'
    return data.message || data.error || 'Could not send link.'
  }

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setNote(null)
    if (!isAllowedUvaEmail(email)) {
      setErr(`Only ${ALLOWED_EMAIL_HINT} addresses are allowed.`)
      return
    }
    setBusy(true)
    const result = await sendLink(email)
    setBusy(false)
    if (result === 'exists') { setStage('exists'); return }
    if (result !== 'ok') { setErr(result); return }
    setStage('sent')
    setCooldown(RESEND_COOLDOWN_S)
  }

  async function handleResend() {
    if (cooldown > 0 || busy) return
    setBusy(true); setNote(null); setErr(null)
    const result = await sendLink(email)
    setBusy(false)
    if (result !== 'ok') { setNote('Could not resend. Please try again in a moment.'); return }
    setNote('New link sent. Check your inbox or quarantine folder.')
    setCooldown(RESEND_COOLDOWN_S)
  }

  // ─── Email stage (default) ───
  if (stage === 'email') return (
    <div className="space-y-3">
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
          <p className="text-[11px] text-gray-400">@virginia.edu or @darden.virginia.edu only</p>
        </div>

        <button type="submit" disabled={busy}
          className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#E57200' }}>
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send Sign-Up Link'}
        </button>

        <p className="text-center text-xs text-gray-400">
          Already have an account? <Link href="/auth/login" className="font-medium hover:underline" style={{ color: '#232D4B' }}>Sign in</Link>
        </p>
      </form>
    </div>
  )

  // ─── Account exists ───
  if (stage === 'exists') return (
    <div className="space-y-5">
      <div className="text-center space-y-3">
        <Mail className="h-14 w-14 mx-auto" style={{ color: '#232D4B' }} />
        <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Account already exists</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          <strong className="text-gray-700">{email}</strong> is already registered.<br />
          Sign in instead.
        </p>
      </div>

      <Link
        href="/auth/login"
        className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
        style={{ backgroundColor: '#232D4B' }}>
        Go to Sign In
      </Link>

      <div className="flex flex-col items-center gap-2 pt-1">
        <Link href="/auth/forgot-password" className="text-sm font-medium hover:underline" style={{ color: '#E57200' }}>
          Forgot your password?
        </Link>
        <button type="button"
          onClick={() => { setStage('email'); setErr(null); setNote(null); setCooldown(0) }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-3 w-3" /> Use a different email
        </button>
      </div>
    </div>
  )

  // ─── Link sent ───
  return (
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

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
        <strong>Not in your inbox?</strong> UVA mail filters sometimes quarantine first-time senders.
        Check your Outlook <strong>Junk Email</strong> folder or your{' '}
        <a
          href="https://security.microsoft.com/quarantine"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium"
        >quarantine portal</a>
        {' '}and release the message. Future sends should hit your inbox after that.
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

      <p className="text-[11px] text-center text-gray-400">Link expires in 1 hour</p>
    </div>
  )
}
