import { TeamCard } from './TeamCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Team } from '@/types'

export function TeamGrid({ teams, emptyMessage = 'No teams found.' }: { teams: Team[]; emptyMessage?: string }) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-4">🤝</div>
        <p className="text-lg font-medium text-gray-600">{emptyMessage}</p>
        <p className="text-sm mt-1">Be the first to post a team opportunity.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  )
}

export function TeamGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
