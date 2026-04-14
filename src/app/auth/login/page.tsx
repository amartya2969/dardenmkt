import { LoginForm } from '@/components/auth/LoginForm'
import { ShieldCheck } from 'lucide-react'

export const metadata = { title: 'Sign In' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F8F7F4' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ backgroundColor: '#232D4B' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 70%, #E57200 0%, transparent 60%)'
        }} />
        <div className="relative">
          <div className="flex items-center gap-1 text-2xl font-bold">
            <span className="text-white">Darden</span>
            <span style={{ color: '#E57200' }}>Mkt</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">UVA Student Marketplace</p>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Everything you need,<br />
              <span style={{ color: '#E57200' }}>built for Hoos.</span>
            </h2>
            <p className="text-blue-200 mt-3 text-sm leading-relaxed">
              Housing sublets, furniture, MBA networking, rideshares to DC — all in one place, exclusively for @virginia.edu.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Verified students only', desc: 'Every user has a @virginia.edu email' },
              { title: 'Free to use', desc: 'Post and browse with no fees ever' },
              { title: 'All UVA categories', desc: 'Housing, jobs, rideshares, and more' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full" style={{ backgroundColor: '#E57200' }}>
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

        <p className="relative text-blue-400 text-xs">
          Not affiliated with the University of Virginia or Darden School of Business.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="text-2xl font-bold">
              <span style={{ color: '#232D4B' }}>Darden</span>
              <span style={{ color: '#E57200' }}>Mkt</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">UVA Student Marketplace</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Sign in</h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter your UVA email — we'll send you a magic link.
              </p>
            </div>

            <LoginForm errorParam={params.error} />

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: '#232D4B' }} />
              Restricted to @virginia.edu email addresses only
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
