import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingGrid, ListingGridSkeleton } from '@/components/listings/ListingGrid'
import { TeamGrid, TeamGridSkeleton } from '@/components/teams/TeamGrid'
import { CategoryGrid } from '@/components/listings/CategoryGrid'
import { SearchBar } from '@/components/listings/SearchBar'
import { SafetyBanner } from '@/components/layout/SafetyBanner'
import { Suspense } from 'react'
import type { Listing, Team } from '@/types'
import { ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react'

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
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <SectionHeading title="Posted Today" />
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ backgroundColor: '#E57200' }}>
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
    <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: '#232D4B' }}>{title}</h2>
  )
}

export default function HomePage() {
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a2238 0%, #232D4B 50%, #2a3560 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(229,114,0,0.14) 0%, transparent 50%), radial-gradient(ellipse at 80% 10%, rgba(229,114,0,0.07) 0%, transparent 45%)',
        }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-blue-200/90 border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: '#E57200' }} />
            Exclusive to @virginia.edu students
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-[-0.03em] leading-[1.04] mb-6">
            The UVA & Darden<br />
            <span style={{ color: '#E57200' }}>Student Marketplace</span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-200/75 max-w-2xl mx-auto leading-relaxed mb-10">
            Housing, for sale, rideshares, team matching, events — all in one place,<br className="hidden sm:block" /> built exclusively for Hoos.
          </p>

          <div className="max-w-2xl mx-auto mb-8">
            <Suspense>
              <SearchBar dark />
            </Suspense>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/listings/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: '#E57200' }}
            >
              Post a Listing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm text-white/80 hover:text-white border border-white/15 hover:border-white/30 hover:bg-white/8 transition-all"
            >
              Browse All
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-5 flex-wrap">
            {[
              { icon: Users,       label: 'UVA Students Only' },
              { icon: ShieldCheck, label: '100% Verified'     },
              { icon: Zap,         label: 'Always Free'       },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[12px] text-blue-300/60">
                <Icon className="h-3.5 w-3.5" style={{ color: '#E57200' }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Safety banner ── */}
      <SafetyBanner />

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* Categories */}
        <section className="space-y-5">
          <SectionHeading title="Browse by Category" />
          <Suspense fallback={
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          }>
            <CategoryGrid />
          </Suspense>
        </section>

        {/* Posted Today */}
        <Suspense>
          <FreshTodaySection />
        </Suspense>

        {/* Recent Listings */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <SectionHeading title="Recent Listings" />
            <Link
              href="/listings"
              className="text-sm font-semibold flex items-center gap-1 transition-all hover:gap-2"
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
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <div
              className="px-6 py-5 flex items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #232D4B 0%, #2e3d65 100%)' }}
            >
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Find your people</p>
                <h2 className="text-xl font-extrabold text-white tracking-tight">🤝 Team Matching</h2>
                <p className="text-blue-300/70 text-sm mt-0.5">Case competitions · Startups · Projects · Study groups</p>
              </div>
              <Link
                href="/teams"
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-5 bg-gray-50/40">
              <Suspense fallback={<TeamGridSkeleton count={3} />}>
                <RecentTeams />
              </Suspense>
              <div className="mt-5 text-center">
                <Link
                  href="/teams/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white text-sm transition-all hover:opacity-90 shadow-sm"
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
