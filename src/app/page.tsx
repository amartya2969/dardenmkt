import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingGrid, ListingGridSkeleton } from '@/components/listings/ListingGrid'
import { TeamGrid, TeamGridSkeleton } from '@/components/teams/TeamGrid'
import { CategoryGrid } from '@/components/listings/CategoryGrid'
import { SearchBar } from '@/components/listings/SearchBar'
import { Suspense } from 'react'
import type { Listing, Team } from '@/types'
import { ArrowRight, ShieldCheck, Users, Zap } from 'lucide-react'

export const revalidate = 60

async function RecentTeams() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('teams')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3)
  return <TeamGrid teams={(data as Team[]) ?? []} emptyMessage="No team opportunities yet." />
}

async function RecentListings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)

  return <ListingGrid listings={(data as Listing[]) ?? []} emptyMessage="No listings yet — be the first to post!" />
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ backgroundColor: '#232D4B' }} className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #E57200 0%, transparent 50%), radial-gradient(circle at 80% 20%, #E57200 0%, transparent 40%)'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-blue-200 border border-blue-400/30 bg-white/5">
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#E57200' }} />
              Exclusive to @virginia.edu students
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
              The UVA & Darden<br />
              <span style={{ color: '#E57200' }}>Student Marketplace</span>
            </h1>
            <p className="text-lg text-blue-200 max-w-xl mx-auto">
              Buy, sell, find housing, jobs, rideshares, and more — built exclusively for Hoos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
              <Suspense>
                <SearchBar dark />
              </Suspense>
            </div>
            <div className="flex gap-3 justify-center pt-1">
              <Link
                href="/listings/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#E57200' }}
              >
                Post a Listing <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white border border-white/20 hover:bg-white/10 transition-all"
              >
                Browse All
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-sm mx-auto sm:max-w-md">
            {[
              { icon: Users, label: 'UVA Students', value: 'Only' },
              { icon: ShieldCheck, label: 'Verified Emails', value: '100%' },
              { icon: Zap, label: 'Free to Use', value: 'Always' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-blue-300 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Categories */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Browse by Category</h2>
          </div>
          <CategoryGrid />
        </section>

        {/* Team Matching */}
        <section className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: '#232D4B' }}>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  🤝 Team Matching
                </h2>
                <p className="text-blue-200 text-xs mt-0.5">Case competitions · Startups · Projects · Study groups</p>
              </div>
              <Link
                href="/teams"
                className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                style={{ color: '#E57200' }}
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="p-4 bg-gray-50">
              <Suspense fallback={<TeamGridSkeleton count={3} />}>
                <RecentTeams />
              </Suspense>
              <div className="mt-4 text-center">
                <Link
                  href="/teams/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: '#E57200' }}
                >
                  Post a Team Opportunity
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recent listings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: '#232D4B' }}>Recent Listings</h2>
            <Link
              href="/listings"
              className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: '#E57200' }}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Suspense fallback={<ListingGridSkeleton count={8} />}>
            <RecentListings />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
