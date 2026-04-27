import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ListingGrid, ListingGridSkeleton } from '@/components/listings/ListingGrid'
import { TeamGrid, TeamGridSkeleton } from '@/components/teams/TeamGrid'
import { SearchBar } from '@/components/listings/SearchBar'
import { Suspense } from 'react'
import type { Listing, Team } from '@/types'
import { ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react'

export const revalidate = 60

const SECTION_CONFIGS = [
  {
    slug: 'housing',
    emoji: '🏠',
    title: 'Housing',
    context: 'Find a place to stay',
    tagline: 'Sublets · Roommates · Apartments · Short-term',
    postLabel: 'Post Housing Listing',
  },
  {
    slug: 'for-sale',
    emoji: '🏷️',
    title: 'For Sale',
    context: 'Buy & sell anything',
    tagline: 'Furniture · Electronics · Books & Supplies · Clothing',
    postLabel: 'Sell an Item',
  },
  {
    slug: 'rideshare',
    emoji: '🚗',
    title: 'Rideshare',
    context: 'Share the ride',
    tagline: 'Airport · DC / Northern VA · Richmond · NYC',
    postLabel: 'Post a Ride',
  },
  {
    slug: 'events',
    emoji: '🎟️',
    title: 'Events',
    context: 'What\'s happening',
    tagline: 'Social · Networking · Academic · Career · Sports',
    postLabel: 'Post an Event',
  },
  {
    slug: 'community',
    emoji: '👥',
    title: 'Community',
    context: 'Connect with Hoos',
    tagline: 'Groups & Clubs · Announcements · Free Stuff · Volunteering',
    postLabel: 'Post to Community',
  },
  {
    slug: 'lost-found',
    emoji: '🔍',
    title: 'Lost & Found',
    context: 'Lost something? Found something?',
    tagline: 'Post a lost item or a found item',
    postLabel: 'Post Lost / Found',
  },
] as const

async function CategoryListings({ slug, emptyMessage }: { slug: string; emptyMessage: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .eq('category', slug)
    .order('created_at', { ascending: false })
    .limit(3)
  return <ListingGrid listings={(data as Listing[]) ?? []} emptyMessage={emptyMessage} />
}

function CategorySection({ config }: { config: typeof SECTION_CONFIGS[number] }) {
  return (
    <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
      <div
        className="px-6 py-5 flex items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #232D4B 0%, #2e3d65 100%)' }}
      >
        <div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">{config.context}</p>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{config.emoji} {config.title}</h2>
          <p className="text-blue-300/70 text-sm mt-0.5">{config.tagline}</p>
        </div>
        <Link
          href={`/category/${config.slug}`}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition-all"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="p-5 bg-gray-50/40">
        <Suspense fallback={<ListingGridSkeleton count={3} />}>
          <CategoryListings
            slug={config.slug}
            emptyMessage={`No ${config.title.toLowerCase()} listings yet — be the first to post!`}
          />
        </Suspense>
        <div className="mt-5 text-center">
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white text-sm transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: '#232D4B' }}
          >
            {config.postLabel}
          </Link>
        </div>
      </div>
    </div>
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

      {/* ── Category Sections ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">

        {/* Housing + For Sale */}
        {SECTION_CONFIGS.slice(0, 2).map((config) => (
          <CategorySection key={config.slug} config={config} />
        ))}

        {/* Team Matching */}
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

        {/* Rideshare, Events, Community, Lost & Found */}
        {SECTION_CONFIGS.slice(2).map((config) => (
          <CategorySection key={config.slug} config={config} />
        ))}

      </div>
    </div>
  )
}
