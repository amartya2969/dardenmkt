import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

const DISCLAIMER_TEXT =
  'UVMkt is an independent platform created by and for students. It is not affiliated with, endorsed by, sponsored by, or otherwise associated with the University of Virginia, the Darden School of Business, the UVA Darden School Foundation, or any of their affiliates. All trademarks, service marks, and registered marks (including "UVA," "Darden," "Cavaliers," "Hoos," and related marks) are the property of their respective owners. Use of @virginia.edu email addresses for verification does not imply any institutional partnership.'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100" style={{ backgroundColor: '#232D4B' }}>
      {/* Full footer — desktop only */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl font-bold">
              <span className="text-white">UV</span>
              <span style={{ color: '#E57200' }}>Mkt</span>
            </div>
            <p className="mt-2 text-sm text-blue-200 leading-relaxed">
              The UVA student marketplace. Free, verified, and built for Hoos.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-400/30 bg-white/5 text-xs text-blue-300">
              @virginia.edu only
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-white mb-3">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 4).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-blue-300 hover:text-white transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-white mb-3">More</h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(4).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-blue-300 hover:text-white transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-white mb-3">Account</h3>
            <ul className="space-y-2">
              <li><Link href="/auth/login" className="text-sm text-blue-300 hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/listings/new" className="text-sm text-blue-300 hover:text-white transition-colors">Post a Listing</Link></li>
              <li><Link href="/my-listings" className="text-sm text-blue-300 hover:text-white transition-colors">My Listings</Link></li>
              <li><Link href="/teams" className="text-sm text-blue-300 hover:text-white transition-colors">Team Matching</Link></li>
              <li><Link href="/teams/new" className="text-sm text-blue-300 hover:text-white transition-colors">Post a Team</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 space-y-3 text-xs text-blue-300/80">
          <p className="leading-relaxed">{DISCLAIMER_TEXT}</p>
          <p className="text-blue-400">&copy; {new Date().getFullYear()} UVMkt. All rights reserved.</p>
        </div>
      </div>

      {/* Compact disclaimer — visible on every screen size, including mobile */}
      <div className="md:border-t md:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-4 pb-20 md:pb-4">
          <p className="text-[11px] leading-relaxed text-blue-300/70 text-center md:text-left md:hidden">
            {DISCLAIMER_TEXT}
          </p>
          <p className="hidden md:block text-[11px] leading-relaxed text-blue-400 text-center">
            UVMkt is an independent student-run platform. Not affiliated with or endorsed by the University of Virginia or the Darden School of Business.
          </p>
        </div>
      </div>
    </footer>
  )
}
