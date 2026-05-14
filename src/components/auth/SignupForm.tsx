'use client'

import { useState } from 'react'
import Link from 'next/link'
import { isAllowedUvaEmail, ALLOWED_EMAIL_HINT } from '@/lib/email-domain'
import { LinkedInButton } from './LinkedInButton'
import { Mail, User as UserIcon, Lock, Eye, EyeOff, Loader2, MailCheck, ArrowLeft, Clock, AlertCircle } from 'lucide-react'

/**
 * Short-term workaround: UVA ITS is filtering inbound auth mail, so we can't
 * rely on Supabase / Resend magic links right now. Instead, users submit a
 * join request that an admin reviews at /admin/join-requests. On approval,
 * the admin creates the account and shares a temp password out-of-band.
 *
 * This form replaces the previous magic-link signup. Sign-in is unchanged
 * (still password-based via LoginForm).
 */

type Stage = 'form' | 'submitted' | 'pending' | 'rejected' | 'account_exists'

export function SignupForm() {
  const [stage, setStage] = useState<Stage>('form')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!isAllowedUvaEmail(email)) {
      setErr(`Only ${ALLOWED_EMAIL_HINT} addresses are allowed.`)
      return
    }
    if (name.trim().length < 2) {
      setErr('Please enter your full name.')
      return
    }
    if (password.length < 8) {
      setErr('Password must be at least 8 characters.')
      return
    }
    // bcrypt (used by Supabase) silently truncates beyond 72 bytes — reject
    // here so the failure is loud, before the server even sees it.
    if (new TextEncoder().encode(password).length > 72) {
      setErr('Password is too long (max 72 bytes — about 72 characters).')
      return
    }
    if (password !== confirm) {
      setErr("Passwords don't match.")
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/auth/request-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          reason: reason.trim(),
          password,
        }),
      })
      const data = (await res.json()) as {
        status?: 'submitted' | 'request_exists' | 'account_exists'
        requestStatus?: 'pending' | 'approved' | 'rejected'
        error?: string
      }
      if (!res.ok) {
        setErr(data.error ?? 'Could not submit your request. Please try again.')
        return
      }
      if (data.status === 'account_exists') { setStage('account_exists'); return }
      if (data.status === 'request_exists') {
        setStage(data.requestStatus === 'rejected' ? 'rejected' : 'pending')
        return
      }
      setStage('submitted')
    } catch {
      setErr('Network error — please try again.')
    } finally {
      setBusy(false)
    }
  }

  // ─── Form ───
  if (stage === 'form') return (
    <div className="space-y-4">
      <LinkedInButton />
      <p className="text-center text-[11px] text-gray-400">
        Fastest way in — works for everyone, no UVA email needed.
      </p>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-gray-400 pt-2">
        <div className="flex-1 h-px bg-gray-200" />
        Or request UVA access
        <div className="flex-1 h-px bg-gray-200" />
      </div>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
        Direct UVA email sign-up is temporarily slow while we resolve a UVA ITS mail-filter
        issue. Submit a request below — we&apos;ll approve and you can sign in with the
        password you choose.
      </div>

      {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>Full Name</label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Alex Carter" required autoComplete="name"
            className="w-full pl-9 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
          />
        </div>
      </div>

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

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
          Why are you joining? <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={reason} onChange={(e) => setReason(e.target.value)}
          rows={3} maxLength={500}
          placeholder="MBA student, looking for housing for the fall semester…"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>Choose a Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters" minLength={8} maxLength={72} required autoComplete="new-password"
            className="w-full pl-9 pr-10 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
          />
          <button type="button" onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[11px] text-gray-400">
          You&apos;ll use this to sign in once your request is approved.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type={showPw ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password" minLength={8} maxLength={72} required autoComplete="new-password"
            className="w-full pl-9 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
          />
        </div>
      </div>

      <button type="submit" disabled={busy}
        className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#E57200' }}>
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Request Access'}
      </button>

      <p className="text-center text-xs text-gray-400">
        Already approved? <Link href="/auth/login" className="font-medium hover:underline" style={{ color: '#232D4B' }}>Sign in</Link>
      </p>
    </form>
    </div>
  )

  // ─── Success / status screens ───
  return (
    <div className="space-y-5">
      <div className="text-center space-y-3">
        {stage === 'submitted' && (
          <>
            <MailCheck className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
            <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Request received</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We&apos;ll review your request for<br />
              <strong className="text-gray-700">{email}</strong>.<br />
              Once approved, sign in at <Link href="/auth/login" className="font-medium hover:underline" style={{ color: '#E57200' }}>/auth/login</Link> with
              the password you just chose.
            </p>
          </>
        )}

        {stage === 'pending' && (
          <>
            <Clock className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
            <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Request already pending</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We already have a pending request for<br />
              <strong className="text-gray-700">{email}</strong>.<br />
              Hang tight — we&apos;ll be in touch.
            </p>
          </>
        )}

        {stage === 'rejected' && (
          <>
            <AlertCircle className="h-14 w-14 mx-auto text-red-500" />
            <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Previous request was declined</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              A prior request for <strong className="text-gray-700">{email}</strong> was declined.
              If you believe this is a mistake, please contact the admin directly.
            </p>
          </>
        )}

        {stage === 'account_exists' && (
          <>
            <Mail className="h-14 w-14 mx-auto" style={{ color: '#232D4B' }} />
            <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>You already have an account</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              <strong className="text-gray-700">{email}</strong> is already registered.<br />
              Sign in with your password.
            </p>
          </>
        )}
      </div>

      {stage === 'account_exists' && (
        <Link
          href="/auth/login"
          className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: '#232D4B' }}>
          Go to Sign In
        </Link>
      )}

      <div className="flex justify-center">
        <button type="button"
          onClick={() => { setStage('form'); setErr(null) }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-3 w-3" /> Use a different email
        </button>
      </div>
    </div>
  )
}
