import { ShieldCheck } from 'lucide-react'
import { SignupForm } from '@/components/auth/SignupForm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create Account' }

export default function SignupPage() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ backgroundColor: '#232D4B' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #E57200 0%, transparent 60%)' }} />
        <div className="relative">
          <div className="text-2xl font-extrabold">
            <span className="text-white">Darden</span>
            <span style={{ color: '#E57200' }}>Mkt</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">UVA Student Marketplace</p>
        </div>
        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Join your Hoo community.<br />
              <span style={{ color: '#E57200' }}>Everything you need.</span>
            </h2>
            <p className="text-blue-200 mt-3 text-sm leading-relaxed">
              Verify your @virginia.edu email once, set a password, and you&apos;re in.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { title: 'One-time verification', desc: 'Confirm your UVA email via magic link — just once' },
              { title: 'Password login after that', desc: 'Sign in with email + password every time' },
              { title: 'Free forever', desc: 'No fees to post or browse' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full shrink-0" style={{ backgroundColor: '#E57200' }}>
                  <ShieldCheck className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-blue-300 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-blue-400 text-xs">Not affiliated with the University of Virginia or Darden School of Business.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center">
            <div className="text-2xl font-extrabold">
              <span style={{ color: '#232D4B' }}>Darden</span>
              <span style={{ color: '#E57200' }}>Mkt</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">UVA Student Marketplace</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Create your account</h1>
              <p className="text-sm text-gray-500 mt-1">We&apos;ll send a verification link to your UVA email.</p>
            </div>
            <SignupForm />
            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: '#E57200' }}>Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
