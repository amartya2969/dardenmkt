'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

function SetPasswordInner() {
  const router = useRouter()
  const params = useSearchParams()
  // ?mode=signup vs ?mode=reset — purely cosmetic; both call updateUser({ password })
  const mode = params.get('mode') === 'reset' ? 'reset' : 'signup'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [checking, setChecking] = useState(true)

  // Guard: this page requires a real session (established by /auth/callback).
  // If someone lands here directly, send them to login.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace('/auth/login?error=session_expired')
        return
      }
      setChecking(false)
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setDone(true)
    setTimeout(() => {
      // First-time signup → take them to profile so they can add their name.
      // Password reset → bounce home; they're already logged in.
      router.push(mode === 'signup' ? '/profile?welcome=1' : '/')
      router.refresh()
    }, 1500)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 mx-auto" style={{ color: '#E57200' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#232D4B' }}>
            {mode === 'signup' ? "You're all set!" : 'Password updated'}
          </h2>
          <p className="text-gray-500 text-sm">
            {mode === 'signup' ? 'Welcome to UVMkt — redirecting you to your profile…' : 'Redirecting…'}
          </p>
        </div>
      </div>
    )
  }

  const heading = mode === 'signup' ? 'Set your password' : 'Choose a new password'
  const subheading =
    mode === 'signup'
      ? 'Your email is verified. Create a password to sign in from now on.'
      : "We've verified you. Pick a new password to finish resetting your account."
  const ctaLabel = mode === 'signup' ? 'Create Account' : 'Update Password'

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-2xl font-extrabold mb-1">
            <span style={{ color: '#232D4B' }}>UV</span>
            <span style={{ color: '#E57200' }}>Mkt</span>
          </div>
          <h1 className="text-2xl font-bold mt-4" style={{ color: '#232D4B' }}>{heading}</h1>
          <p className="text-sm text-gray-500 mt-1">{subheading}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
                {mode === 'signup' ? 'Password' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="w-full pl-9 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: mode === 'signup' ? '#E57200' : '#232D4B' }}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : ctaLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    }>
      <SetPasswordInner />
    </Suspense>
  )
}
