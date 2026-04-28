'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, CheckCircle2, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

const RESEND_COOLDOWN_S = 30
const OTP_LENGTH = 6

type Stage = 'email' | 'code' | 'password' | 'done'

export function SignupForm() {
  const router = useRouter()

  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  useEffect(() => {
    if (stage === 'code') codeRef.current?.focus()
  }, [stage])

  // ── Stage 1: send OTP code ──
  async function sendCodeInternal(addr: string) {
    const supabase = createClient()
    return supabase.auth.signInWithOtp({
      email: addr,
      options: { shouldCreateUser: true },
    })
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setNote(null)
    if (!email.endsWith('@virginia.edu')) {
      setErr('Only @virginia.edu email addresses are allowed.')
      return
    }
    setBusy(true)
    const { error } = await sendCodeInternal(email)
    setBusy(false)
    if (error) { setErr(error.message); return }
    setStage('code')
    setCooldown(RESEND_COOLDOWN_S)
  }

  async function handleResendCode() {
    if (cooldown > 0 || busy) return
    setBusy(true); setNote(null); setErr(null)
    const { error } = await sendCodeInternal(email)
    setBusy(false)
    if (error) { setNote('Could not resend — please try again in a moment.'); return }
    setNote('New code sent. Check your inbox.')
    setCooldown(RESEND_COOLDOWN_S)
  }

  // ── Stage 2: verify OTP ──
  async function verifyCode(token: string) {
    if (token.length !== OTP_LENGTH || busy) return
    setBusy(true); setErr(null)
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    setBusy(false)
    if (error) {
      setErr(
        error.message.includes('expired') || error.message.includes('Token has expired')
          ? 'Code expired. Request a new one.'
          : 'Incorrect code. Check your email and try again.'
      )
      setCode('')
      codeRef.current?.focus()
      return
    }
    setStage('password')
  }

  function handleCodeChange(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, OTP_LENGTH)
    setCode(digits)
    setErr(null)
    if (digits.length === OTP_LENGTH) verifyCode(digits)
  }

  // ── Stage 3: set initial password ──
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setErr("Passwords don't match."); return }

    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) { setErr(error.message); return }
    setStage('done')
    setTimeout(() => { router.push('/profile?welcome=1'); router.refresh() }, 1500)
  }

  return (
    <>
      {/* ── Stage: enter email ── */}
      {stage === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-4">
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
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send Verification Code'}
          </button>
          <p className="text-center text-xs text-gray-400">
            We&apos;ll send a 6-digit code. You&apos;ll set your password after verifying.
          </p>
        </form>
      )}

      {/* ── Stage: enter code ── */}
      {stage === 'code' && (
        <div className="space-y-5">
          <div className="text-center space-y-3">
            <CheckCircle2 className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
            <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Enter your code</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We sent a 6-digit code to<br /><strong className="text-gray-700">{email}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-semibold text-center" style={{ color: '#232D4B' }}>
              6-digit code
            </label>
            <input
              ref={codeRef} id="code" type="text" inputMode="numeric"
              autoComplete="one-time-code" value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') verifyCode(code) }}
              placeholder="000000" maxLength={OTP_LENGTH} disabled={busy}
              className="w-full h-14 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-gray-200 outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all disabled:opacity-60"
            />
            {busy && (
              <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" /> Verifying…
              </p>
            )}
            {err && <p className="text-xs text-center text-red-600">{err}</p>}
          </div>

          <button type="button" onClick={() => verifyCode(code)} disabled={code.length !== OTP_LENGTH || busy}
            className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#232D4B' }}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {busy ? 'Verifying…' : 'Verify Code'}
          </button>

          {note && <p className="text-xs text-center font-medium" style={{ color: '#E57200' }}>{note}</p>}

          <div className="flex flex-col items-center gap-3 pt-1">
            <button type="button" onClick={handleResendCode} disabled={cooldown > 0 || busy}
              className="text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              style={{ color: '#E57200' }}>
              {busy && cooldown === 0 ? 'Resending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>
            <button type="button"
              onClick={() => { setStage('email'); setCode(''); setErr(null); setNote(null); setCooldown(0) }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-3 w-3" /> Use a different email
            </button>
          </div>

          <p className="text-[11px] text-center text-gray-400">Code expires in 1 hour · Check spam if needed</p>
        </div>
      )}

      {/* ── Stage: set password ── */}
      {stage === 'password' && (
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Set your password</h2>
            <p className="text-xs text-gray-500 mt-1">Choose a password of at least 8 characters</p>
          </div>
          {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}

          <div className="space-y-1.5">
            <label htmlFor="new_pw" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input id="new_pw" type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters" minLength={8} required autoComplete="new-password"
                className="w-full pl-9 pr-10 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all" />
              <button type="button" onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm_pw" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input id="confirm_pw" type={showPw ? 'text' : 'password'} value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password" minLength={8} required autoComplete="new-password"
                className="w-full pl-9 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all" />
            </div>
          </div>

          <button type="submit" disabled={busy}
            className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#E57200' }}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : 'Create Account'}
          </button>
        </form>
      )}

      {/* ── Stage: done ── */}
      {stage === 'done' && (
        <div className="text-center space-y-4 py-2">
          <CheckCircle2 className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
          <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Welcome to UVMkt!</h2>
          <p className="text-sm text-gray-500">Redirecting you to your profile…</p>
        </div>
      )}
    </>
  )
}
