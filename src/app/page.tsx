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

async function FreshTodaySection() {
  const supabase = await createClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(4)

  if (!data || data.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: '#E57200' }} />
        <h2 className="text-xl font-bold tracking-tight" style={{ color: '#232D4B' }}>Posted Today</h2>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#E57200' }}>
          {data.length} new
        </span>
      </div>
      <ListingGrid listings={data as Listing[]} />
    </section>
  )
}

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

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: '#E57200' }} />
      <h2 className="text-xl font-bold tracking-tight" style={{ color: '#232D4B' }}>{title}</h2>
    </div>
  )
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ backgroundColor: '#232D4B' }} className="relative overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse at 15% 60%, rgba(229,114,0,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(229,114,0,0.08) 0%, transparent 50%)'
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-200 border border-blue-400/30 bg-white/5 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#E57200' }} />
              Exclusive to @virginia.edu students
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              The UVA & Darden<br />
              <span style={{ color: '#E57200' }}>Student Marketplace</span>
            </h1>
            <p className="text-lg text-blue-200/90 max-w-xl mx-auto leading-relaxed">
              Buy, sell, find housing, jobs, events, rideshares and more — built exclusively for Hoos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
              <Suspense>
                <SearchBar dark />
              </Suspense>
            </div>
            <div className="flex gap-3 justify-center pt-1">
              <Link
                href="/listings/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg"
                style={{ backgroundColor: '#E57200' }}
              >
                Post a Listing <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all"
              >
                Browse All
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            {[
              { icon: Users, label: 'UVA Students Only' },
              { icon: ShieldCheck, label: '100% Verified Emails' },
              { icon: Zap, label: 'Always Free' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-100 border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: '#E57200' }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* Categories */}
        <section className="space-y-5">
          <SectionHeading title="Browse by Category" />
          <Suspense fallback={<div className="grid grid-cols-4 lg:grid-cols-8 gap-2.5">{Array.from({length:8}).map((_,i)=><div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse"/>)}</div>}>
            <CategoryGrid />
          </Suspense>
        </section>

        {/* Fresh today */}
        <Suspense>
          <FreshTodaySection />
        </Suspense>

        {/* Recent listings */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <SectionHeading title="Recent Listings" />
            <Link
              href="/listings"
              className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: '#E57200' }}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Suspense fallback={<ListingGridSkeleton count={8} />}>
            <RecentListings />
          </Suspense>
        </section>

        {/* Team Matching */}
        <section>
          <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid rgba(35,45,75,0.12)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: '#232D4B' }}>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">🤝 Team Matching</h2>
                <p className="text-blue-300/80 text-xs mt-0.5">Case competitions · Startups · Projects · Study groups</p>
              </div>
              <Link
                href="/teams"
                className="text-xs font-semibold flex items-center gap-1 hover:gap-1.5 transition-all px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10"
                style={{ color: '#E57200' }}
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-4 bg-gray-50/50">
              <Suspense fallback={<TeamGridSkeleton count={3} />}>
                <RecentTeams />
              </Suspense>
              <div className="mt-4 text-center">
                <Link
                  href="/teams/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: '#232D4B' }}
                >
                  Post a Team Opportunity
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
