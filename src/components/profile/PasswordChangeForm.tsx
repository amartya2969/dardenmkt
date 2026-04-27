'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export function PasswordChangeForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)

    if (password.length < 8) {
      setMsg({ kind: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    if (password !== confirm) {
      setMsg({ kind: 'error', text: "Passwords don't match." })
      return
    }

    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)

    if (error) {
      setMsg({ kind: 'error', text: error.message })
      return
    }
    setPassword('')
    setConfirm('')
    setMsg({ kind: 'success', text: 'Password updated successfully.' })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {msg && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            msg.kind === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="new_password" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
          New Password
        </label>
        <div className="relative">
          <input
            id="new_password"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
            autoComplete="new-password"
            className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-1 focus:ring-[#232D4B] transition-all"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm_password" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
          Confirm New Password
        </label>
        <input
          id="confirm_password"
          type={show ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter new password"
          minLength={8}
          required
          autoComplete="new-password"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-1 focus:ring-[#232D4B] transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ backgroundColor: '#232D4B' }}
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {busy ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  )
}
