import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { TeamGrid, TeamGridSkeleton } from '@/components/teams/TeamGrid'
import { TEAM_TYPES } from '@/lib/constants'
import type { Team, TeamType } from '@/types'
import { Plus, Users } from 'lucide-react'

export const revalidate = 30

export const metadata = { title: 'Team Matching — Find Your Co-founder' }

async function Teams({ type }: { type?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('teams')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data } = await query.limit(48)
  return (
    <TeamGrid
      teams={(data as Team[]) ?? []}
      emptyMessage="No opportunities yet in this category."
    />
  )
}

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const params = await searchParams
  const activeType = params.type

  return (
    <div>
      {/* Header */}
      <div style={{ backgroundColor: '#232D4B' }} className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-200 text-sm mb-1">
                <Users className="h-4 w-4" />
                Team Matching
              </div>
              <h1 className="text-3xl font-bold text-white">Find Your Team</h1>
              <p className="text-blue-200 mt-1 text-sm">
                Case competitions, startups, class projects, study groups — find your people.
              </p>
            </div>
            <Link
              href="/teams/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90 shrink-0"
              style={{ backgroundColor: '#E57200' }}
            >
              <Plus className="h-4 w-4" /> Post Opportunity
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Type filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Link
            href="/teams"
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              !activeType
                ? 'text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
            style={!activeType ? { backgroundColor: '#232D4B' } : {}}
          >
            All Types
          </Link>
          {TEAM_TYPES.map((t) => (
            <Link
              key={t.value}
              href={`/teams?type=${t.value}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeType === t.value
                  ? 'text-white border-2'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
              style={activeType === t.value ? { backgroundColor: t.color, borderColor: t.color } : {}}
            >
              <span>{t.emoji}</span>
              {t.label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        <Suspense key={activeType} fallback={<TeamGridSkeleton count={6} />}>
          <Teams type={activeType} />
        </Suspense>
      </div>
    </div>
  )
}
