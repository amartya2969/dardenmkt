'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/'), 2000)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 mx-auto" style={{ color: '#E57200' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Password updated!</h2>
          <p className="text-gray-500 text-sm">Redirecting you to UVMkt…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-2xl font-extrabold">
            <span style={{ color: '#232D4B' }}>UV</span><span style={{ color: '#E57200' }}>Mkt</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Reset your password</h1>
            <p className="text-sm text-gray-500 mt-1">Choose a new password for your account.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-9 pr-10 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#232D4B' }}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
