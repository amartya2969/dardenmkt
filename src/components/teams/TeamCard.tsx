import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import { TEAM_TYPE_MAP } from '@/lib/constants'
import type { Team } from '@/types'
import { Users, Clock, Calendar, ChevronRight } from 'lucide-react'

export function TeamCard({ team }: { team: Team }) {
  const typeInfo = TEAM_TYPE_MAP[team.type]
  const deadline = team.deadline ? new Date(team.deadline) : null
  const isUrgent = deadline && (deadline.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000

  return (
    <Link href={`/teams/${team.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Top color bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: typeInfo?.color ?? '#232D4B' }} />

        <div className="p-5 flex flex-col gap-3 flex-1">
          {/* Type badge + spots */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: typeInfo?.bg ?? '#F8F7F4', color: typeInfo?.color ?? '#232D4B' }}
            >
              <span>{typeInfo?.emoji}</span>
              {typeInfo?.label ?? team.type}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
              <Users className="h-3.5 w-3.5" />
              {team.spots_available} spot{team.spots_available !== 1 ? 's' : ''} open
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#232D4B] transition-colors" style={{ color: '#1a1a1a' }}>
            {team.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed flex-1">
            {team.description}
          </p>

          {/* Skills */}
          {team.skills_needed.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {team.skills_needed.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-0.5 rounded-full border font-medium"
                  style={{ borderColor: '#e2e0db', color: '#232D4B', backgroundColor: '#F8F7F4' }}
                >
                  {skill}
                </span>
              ))}
              {team.skills_needed.length > 4 && (
                <span className="text-xs px-2 py-0.5 rounded-full border font-medium text-gray-400" style={{ borderColor: '#e2e0db' }}>
                  +{team.skills_needed.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {deadline ? (
                <span className={`flex items-center gap-1 font-medium ${isUrgent ? 'text-red-500' : ''}`}>
                  <Calendar className="h-3 w-3" />
                  {isUrgent ? 'Urgent · ' : ''}
                  {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(team.created_at)}
                </span>
              )}
            </div>
            <span
              className="flex items-center gap-0.5 text-xs font-semibold group-hover:gap-1 transition-all"
              style={{ color: '#E57200' }}
            >
              Apply <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
