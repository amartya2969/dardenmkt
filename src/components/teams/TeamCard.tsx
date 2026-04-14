import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import { TEAM_TYPE_MAP } from '@/lib/constants'
import type { Team } from '@/types'
import { Users, Clock, Calendar, ArrowRight } from 'lucide-react'

export function TeamCard({ team }: { team: Team }) {
  const typeInfo = TEAM_TYPE_MAP[team.type]
  const deadline = team.deadline ? new Date(team.deadline) : null
  const isUrgent = deadline && (deadline.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000

  return (
    <Link href={`/teams/${team.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 hover:border-gray-200 transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Gradient top bar */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${typeInfo?.color ?? '#232D4B'} 0%, ${typeInfo?.color ?? '#E57200'}88 100%)` }}
        />

        <div className="p-5 flex flex-col gap-3.5 flex-1">
          {/* Type badge + spots */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: typeInfo?.bg ?? '#F8F7F4', color: typeInfo?.color ?? '#232D4B' }}
            >
              <span>{typeInfo?.emoji}</span>
              {typeInfo?.label ?? team.type}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
              <Users className="h-3 w-3" />
              {team.spots_available} open
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm leading-snug line-clamp-2 text-gray-900 group-hover:text-[#232D4B] transition-colors">
            {team.title}
          </h3>

          {/* Description */}
          <p className="text-[12px] text-gray-500 line-clamp-3 leading-relaxed flex-1">
            {team.description}
          </p>

          {/* Skills */}
          {team.skills_needed.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {team.skills_needed.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: '#F1F0EC', color: '#232D4B' }}
                >
                  {skill}
                </span>
              ))}
              {team.skills_needed.length > 4 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium text-gray-400" style={{ backgroundColor: '#F1F0EC' }}>
                  +{team.skills_needed.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="text-[11px] text-gray-400">
              {deadline ? (
                <span className={`flex items-center gap-1 font-semibold ${isUrgent ? 'text-red-500' : 'text-gray-500'}`}>
                  <Calendar className="h-3 w-3" />
                  {isUrgent ? '⚡ ' : ''}
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
              className="flex items-center gap-0.5 text-[11px] font-bold group-hover:gap-1.5 transition-all"
              style={{ color: '#E57200' }}
            >
              Apply <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
