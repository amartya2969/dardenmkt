'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, CheckCircle2, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const RESEND_COOLDOWN_S = 30
const OTP_LENGTH = 6

type Stage = 'email' | 'code' | 'password' | 'done'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
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

  // ── Stage 1: send reset code ──
  async function sendCodeInternal(addr: string) {
    const supabase = createClient()
    return supabase.auth.resetPasswordForEmail(addr)
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setNote(null)
    if (!email.endsWith('@virginia.edu')) {
      setErr('Only @virginia.edu email addresses are allowed.')
      return
    }
    setBusy(true)
    await sendCodeInternal(email)
    // Always advance — don't reveal whether the email is registered
    setStage('code')
    setCooldown(RESEND_COOLDOWN_S)
    setBusy(false)
  }

  async function handleResendCode() {
    if (cooldown > 0 || busy) return
    setBusy(true); setNote(null); setErr(null)
    const { error } = await sendCodeInternal(email)
    setBusy(false)
    if (error) {
      setNote('Could not resend — please try again in a moment.')
      return
    }
    setNote('New code sent. Check your inbox.')
    setCooldown(RESEND_COOLDOWN_S)
  }

  // ── Stage 2: verify OTP code ──
  async function verifyCode(token: string) {
    if (token.length !== OTP_LENGTH || busy) return
    setBusy(true); setErr(null)
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    })
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
    // Recovery session is now active — move to password stage
    setStage('password')
  }

  function handleCodeChange(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, OTP_LENGTH)
    setCode(digits)
    setErr(null)
    if (digits.length === OTP_LENGTH) verifyCode(digits)
  }

  // ── Stage 3: set new password ──
  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (newPassword.length < 8) { setErr('Password must be at least 8 characters.'); return }
    if (newPassword !== confirm) { setErr("Passwords don't match."); return }

    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setBusy(false)
    if (error) { setErr(error.message); return }
    setStage('done')
    setTimeout(() => { router.push('/'); router.refresh() }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-2xl font-extrabold mb-1">
            <span style={{ color: '#232D4B' }}>UV</span>
            <span style={{ color: '#E57200' }}>Mkt</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── Stage: enter email ── */}
          {stage === 'email' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Forgot password?</h1>
                <p className="text-sm text-gray-500 mt-1">We&apos;ll send a 6-digit code to your UVA email.</p>
              </div>
              <form onSubmit={handleSendCode} className="space-y-4">
                {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>UVA Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="computing@virginia.edu"
                      required
                      autoComplete="email"
                      className="w-full pl-9 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
                    />
                  </div>
                </div>
                <button type="submit" disabled={busy}
                  className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#232D4B' }}>
                  {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send Reset Code'}
                </button>
                <div className="text-center">
                  <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                  </Link>
                </div>
              </form>
            </>
          )}

          {/* ── Stage: enter code ── */}
          {stage === 'code' && (
            <div className="space-y-5">
              <div className="text-center space-y-3">
                <CheckCircle2 className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
                <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Enter your code</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  If an account exists for<br /><strong className="text-gray-700">{email}</strong>,<br />
                  we sent a 6-digit code.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="code" className="block text-sm font-semibold text-center" style={{ color: '#232D4B' }}>
                  6-digit code
                </label>
                <input
                  ref={codeRef}
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') verifyCode(code) }}
                  placeholder="000000"
                  maxLength={OTP_LENGTH}
                  disabled={busy}
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

          {/* ── Stage: set new password ── */}
          {stage === 'password' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Set a new password</h1>
                <p className="text-sm text-gray-500 mt-1">Choose a password of at least 8 characters.</p>
              </div>
              <form onSubmit={handleSetPassword} className="space-y-4">
                {err && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>}

                <div className="space-y-1.5">
                  <label htmlFor="new_pw" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input id="new_pw" type={showPw ? 'text' : 'password'} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters" minLength={8} required autoComplete="new-password"
                      className="w-full pl-9 pr-10 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all" />
                    <button type="button" onClick={() => setShowPw(s => !s)}
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
                  style={{ backgroundColor: '#232D4B' }}>
                  {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Update Password'}
                </button>
              </form>
            </>
          )}

          {/* ── Stage: done ── */}
          {stage === 'done' && (
            <div className="text-center space-y-4 py-2">
              <CheckCircle2 className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
              <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Password updated</h2>
              <p className="text-sm text-gray-500">Signing you in…</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
