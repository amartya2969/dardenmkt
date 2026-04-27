'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { SITE_URL } from '@/lib/constants'
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const schema = z.object({
  email: z.string().email('Invalid email').endsWith('@virginia.edu', 'Must be a @virginia.edu email'),
  password: z.string().min(1, 'Password is required'),
})
type Values = z.infer<typeof schema>

const RESEND_COOLDOWN_S = 30

export function LoginForm({ errorParam }: { errorParam?: string }) {
  const [showPw, setShowPw] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [magicEmail, setMagicEmail] = useState('')
  const [sendingMagic, setSendingMagic] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendNote, setResendNote] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, getValues } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  // Tick cooldown down once per second
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

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

  async function sendMagicLinkInternal(email: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${SITE_URL}/auth/callback`, shouldCreateUser: false },
    })
    return error
  }

  async function sendMagicLink() {
    const email = getValues('email')
    if (!email.endsWith('@virginia.edu')) {
      setError('email', { message: 'Must be a @virginia.edu email' })
      return
    }
    setSendingMagic(true)
    await sendMagicLinkInternal(email)
    setMagicEmail(email)
    setMagicSent(true)
    setCooldown(RESEND_COOLDOWN_S)
    setSendingMagic(false)
  }

  async function resendMagicLink() {
    if (cooldown > 0 || resending) return
    setResending(true)
    setResendNote(null)
    const error = await sendMagicLinkInternal(magicEmail)
    setResending(false)
    if (error) {
      setResendNote('Could not resend — please try again in a moment.')
      return
    }
    setResendNote('Sent again. Check your inbox.')
    setCooldown(RESEND_COOLDOWN_S)
  }

  if (magicSent) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle2 className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
        <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Check your inbox</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          We sent a sign-in link to<br /><strong className="text-gray-700">{magicEmail}</strong>
        </p>
        <p className="text-xs text-gray-400">Expires in 1 hour · Check spam if needed</p>

        {resendNote && (
          <p className="text-xs font-medium" style={{ color: '#E57200' }}>{resendNote}</p>
        )}

        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={resendMagicLink}
            disabled={cooldown > 0 || resending}
            className="w-full h-10 rounded-xl font-medium text-sm text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {resending
              ? 'Resending…'
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : 'Resend email'}
          </button>

          <button
            type="button"
            onClick={() => { setMagicSent(false); setMagicEmail(''); setResendNote(null); setCooldown(0) }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-3 w-3" /> Use a different email
          </button>
        </div>
      </div>
    )
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

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or</span></div>
      </div>

      <button type="button" onClick={sendMagicLink} disabled={sendingMagic}
        className="w-full h-11 rounded-xl font-medium text-sm text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all disabled:opacity-60">
        {sendingMagic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        Sign in with email link
      </button>

      <p className="text-center text-sm text-gray-500">
        New to UVMkt?{' '}
        <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: '#E57200' }}>
          Create account
        </Link>
      </p>
    </form>
  )
}
