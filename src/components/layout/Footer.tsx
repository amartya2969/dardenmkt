import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100" style={{ backgroundColor: '#232D4B' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl font-bold">
              <span className="text-white">Darden</span>
              <span style={{ color: '#E57200' }}>Mkt</span>
            </div>
            <p className="mt-2 text-sm text-blue-200 leading-relaxed">
              The UVA &amp; Darden student marketplace. Free, verified, and built for Hoos.
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

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-400">
          <p>&copy; {new Date().getFullYear()} DardenMkt. All rights reserved.</p>
          <p>Not affiliated with the University of Virginia or Darden School of Business.</p>
        </div>
      </div>
    </footer>
  )
}
