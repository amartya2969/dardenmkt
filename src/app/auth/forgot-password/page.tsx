'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, MailCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const RESEND_COOLDOWN_S = 30

type Stage = 'email' | 'sent'

export default function ForgotPasswordPage() {
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

  async function sendLink(addr: string) {
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/set-password?mode=reset')}`
    return supabase.auth.resetPasswordForEmail(addr, { redirectTo })
  }

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setNote(null)
    if (!email.endsWith('@virginia.edu')) {
      setErr('Only @virginia.edu email addresses are allowed.')
      return
    }
    setBusy(true)
    try {
      await sendLink(email)
    } catch {
      setErr('Could not send reset link. Check your connection and try again.')
      setBusy(false)
      return
    }
    // Always advance — don't reveal whether the email is registered
    setStage('sent')
    setCooldown(RESEND_COOLDOWN_S)
    setBusy(false)
  }

  async function handleResend() {
    if (cooldown > 0 || busy) return
    setBusy(true); setNote(null); setErr(null)
    const { error } = await sendLink(email)
    setBusy(false)
    if (error) {
      setNote('Could not resend — please try again in a moment.')
      return
    }
    setNote('New link sent. Check your inbox.')
    setCooldown(RESEND_COOLDOWN_S)
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
                <p className="text-sm text-gray-500 mt-1">We&apos;ll email you a one-time link to reset it.</p>
              </div>
              <form onSubmit={handleSendLink} className="space-y-4">
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
                  {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send Reset Link'}
                </button>
                <div className="text-center">
                  <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                  </Link>
                </div>
              </form>
            </>
          )}

          {/* ── Stage: link sent ── */}
          {stage === 'sent' && (
            <div className="space-y-5">
              <div className="text-center space-y-3">
                <MailCheck className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
                <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Check your inbox</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  If an account exists for<br />
                  <strong className="text-gray-700">{email}</strong>,<br />
                  we sent a one-time reset link.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Click the link on this device to choose a new password.
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

        </div>
      </div>
    </div>
  )
}
