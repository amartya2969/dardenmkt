'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const schema = z.object({
  email: z.string().email('Invalid email').endsWith('@virginia.edu', 'Must be a @virginia.edu email'),
  password: z.string().min(1, 'Password is required'),
})
type Values = z.infer<typeof schema>

export function LoginForm({ errorParam }: { errorParam?: string }) {
  const [showPw, setShowPw] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: Values) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password })
    if (error) {
      setError('password', { message: 'Incorrect email or password.' })
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorParam === 'domain' && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          Only @virginia.edu email addresses are allowed.
        </div>
      )}
      {errorParam === 'auth' && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          Sign-in link expired or invalid. Please try again.
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>UVA Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            {...register('email')}
            type="email"
            placeholder="computing@virginia.edu"
            autoComplete="email"
            className="w-full pl-9 pr-4 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
          />
        </div>
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>Password</label>
          <Link href="/auth/forgot-password" className="text-xs font-medium hover:underline" style={{ color: '#E57200' }}>
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            {...register('password')}
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full pl-9 pr-10 h-11 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
          />
          <button type="button" onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: '#232D4B' }}>
        {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign In'}
      </button>

      <p className="text-center text-sm text-gray-500 pt-2">
        New to UVMkt?{' '}
        <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: '#E57200' }}>
          Create account
        </Link>
      </p>
    </form>
  )
}
