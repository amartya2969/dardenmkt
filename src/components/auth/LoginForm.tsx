'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '@/lib/validations'
import { createClient } from '@/lib/supabase/client'
import { SITE_URL } from '@/lib/constants'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'

export function LoginForm({ errorParam }: { errorParam?: string }) {
  const [sent, setSent] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
    })
    if (error) {
      setError('email', { message: error.message })
      return
    }
    setSentTo(values.email)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-14 w-14" style={{ color: '#E57200' }} />
        </div>
        <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Check your inbox</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          We sent a magic link to<br />
          <strong className="text-gray-700">{sentTo}</strong>
        </p>
        <p className="text-xs text-gray-400">
          Link expires in 1 hour · Check your spam folder if needed
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorParam === 'domain' && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          Only @virginia.edu email addresses are allowed.
        </div>
      )}
      {errorParam === 'auth' && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          Sign-in link expired or invalid. Please try again.
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
          UVA Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="email"
            type="email"
            placeholder="computing@virginia.edu"
            className="w-full pl-9 pr-4 h-11 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 transition-all"
            style={{ ['--tw-ring-color' as string]: '#232D4B' }}
            onFocus={(e) => e.target.style.borderColor = '#232D4B'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ backgroundColor: '#232D4B' }}
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
        ) : (
          'Send Magic Link'
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        No password needed — we'll email you a secure sign-in link.
      </p>
    </form>
  )
}
