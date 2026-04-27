'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SITE_URL } from '@/lib/constants'
import { Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.endsWith('@virginia.edu')) {
      setError('Only @virginia.edu email addresses are allowed.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/auth/callback?next=/auth/reset-password`,
    })
    // Always show success to avoid email enumeration
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-2xl font-extrabold mb-1">
            <span style={{ color: '#232D4B' }}>Darden</span>
            <span style={{ color: '#E57200' }}>Mkt</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center space-y-4 py-2">
              <CheckCircle2 className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
              <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Check your inbox</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                If an account exists for <strong className="text-gray-700">{email}</strong>,
                you&apos;ll receive a password reset link shortly.
              </p>
              <p className="text-xs text-gray-400">Link expires in 1 hour · Check spam if needed</p>
              <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: '#E57200' }}>
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Forgot password?</h1>
                <p className="text-sm text-gray-500 mt-1">Enter your UVA email and we&apos;ll send a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
                )}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>UVA Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="computing@virginia.edu"
                      required
                      className="w-full pl-9 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: '#232D4B' }}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send Reset Link'}
                </button>
                <div className="text-center">
                  <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
