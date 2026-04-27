'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SITE_URL } from '@/lib/constants'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'

export function SignupForm() {
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
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback?next=/auth/set-password`,
        shouldCreateUser: true,
      },
    })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle2 className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
        <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Check your inbox</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          We sent a verification link to<br /><strong className="text-gray-700">{email}</strong>
        </p>
        <p className="text-xs text-gray-400">
          Click the link to verify your email and set your password.<br />
          Expires in 1 hour · Check spam if needed.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>UVA Email Address</label>
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
        style={{ backgroundColor: '#E57200' }}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send Verification Link'}
      </button>
      <p className="text-center text-xs text-gray-400">
        You&apos;ll set your password after clicking the link in your email.
      </p>
    </form>
  )
}
