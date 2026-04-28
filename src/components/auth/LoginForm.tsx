'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const schema = z.object({
  email: z.string().email('Invalid email').endsWith('@virginia.edu', 'Must be a @virginia.edu email'),
  password: z.string().min(1, 'Password is required'),
})
type Values = z.infer<typeof schema>

const RESEND_COOLDOWN_S = 30
const OTP_LENGTH = 6

export function LoginForm({ errorParam }: { errorParam?: string }) {
  const [showPw, setShowPw] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendNote, setResendNote] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const otpInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, getValues } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  // Autofocus OTP input on screen change
  useEffect(() => {
    if (otpSent) otpInputRef.current?.focus()
  }, [otpSent])

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

  async function sendOtpInternal(email: string) {
    const supabase = createClient()
    // shouldCreateUser:false → only existing users get a code (sign-in only)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    return error
  }

  async function sendOtp() {
    const email = getValues('email')
    if (!email.endsWith('@virginia.edu')) {
      setError('email', { message: 'Must be a @virginia.edu email' })
      return
    }
    setSendingOtp(true)
    await sendOtpInternal(email)
    setOtpEmail(email)
    setOtpSent(true)
    setCooldown(RESEND_COOLDOWN_S)
    setSendingOtp(false)
  }

  async function resendOtp() {
    if (cooldown > 0 || resending) return
    setResending(true)
    setResendNote(null)
    const error = await sendOtpInternal(otpEmail)
    setResending(false)
    if (error) {
      setResendNote('Could not resend — please try again in a moment.')
      return
    }
    setResendNote('New code sent. Check your inbox.')
    setCooldown(RESEND_COOLDOWN_S)
  }

  async function verifyCode(code: string) {
    if (code.length !== OTP_LENGTH || verifying) return
    setVerifying(true)
    setVerifyError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email: otpEmail,
      token: code,
      type: 'email',
    })
    setVerifying(false)
    if (error) {
      setVerifyError(error.message.includes('expired') || error.message.includes('Token has expired')
        ? 'Code expired. Request a new one.'
        : 'Incorrect code. Check your email and try again.')
      setOtp('')
      otpInputRef.current?.focus()
      return
    }
    router.push('/')
    router.refresh()
  }

  function handleOtpChange(v: string) {
    const digitsOnly = v.replace(/\D/g, '').slice(0, OTP_LENGTH)
    setOtp(digitsOnly)
    setVerifyError(null)
    if (digitsOnly.length === OTP_LENGTH) {
      // Auto-submit when 6 digits typed
      verifyCode(digitsOnly)
    }
  }

  // ── OTP entry screen ──
  if (otpSent) {
    return (
      <div className="space-y-5">
        <div className="text-center space-y-3">
          <CheckCircle2 className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
          <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Enter your code</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            We sent a 6-digit code to<br /><strong className="text-gray-700">{otpEmail}</strong>
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="otp" className="block text-sm font-semibold text-center" style={{ color: '#232D4B' }}>
            6-digit code
          </label>
          <input
            ref={otpInputRef}
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') verifyCode(otp) }}
            placeholder="000000"
            disabled={verifying}
            maxLength={OTP_LENGTH}
            className="w-full h-14 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-gray-200 outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all disabled:opacity-60"
          />
          {verifying && (
            <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Verifying…
            </p>
          )}
          {verifyError && (
            <p className="text-xs text-center text-red-600">{verifyError}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => verifyCode(otp)}
          disabled={otp.length !== OTP_LENGTH || verifying}
          className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#232D4B' }}
        >
          {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {verifying ? 'Verifying…' : 'Verify & Sign In'}
        </button>

        {resendNote && (
          <p className="text-xs text-center font-medium" style={{ color: '#E57200' }}>{resendNote}</p>
        )}

        <div className="flex flex-col items-center gap-3 pt-1">
          <button
            type="button"
            onClick={resendOtp}
            disabled={cooldown > 0 || resending}
            className="text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
            style={{ color: '#E57200' }}
          >
            {resending ? 'Resending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>

          <button
            type="button"
            onClick={() => {
              setOtpSent(false); setOtpEmail(''); setOtp('')
              setVerifyError(null); setResendNote(null); setCooldown(0)
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-3 w-3" /> Use a different email
          </button>
        </div>

        <p className="text-[11px] text-center text-gray-400">Code expires in 1 hour · Check spam if needed</p>
      </div>
    )
  }

  // ── Sign-in form ──
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

      <button type="button" onClick={sendOtp} disabled={sendingOtp}
        className="w-full h-11 rounded-xl font-medium text-sm text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all disabled:opacity-60">
        {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        Sign in with email code
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
