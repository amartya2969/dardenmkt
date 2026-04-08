import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime } from '@/lib/utils'
import { TEAM_TYPE_MAP } from '@/lib/constants'
import { ArrowLeft, Users, Calendar, Mail, Clock, Pencil } from 'lucide-react'
import type { Team } from '@/types'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('teams').select('title, description').eq('id', id).single()
  if (!data) return { title: 'Team Not Found' }
  return { title: data.title, description: data.description.slice(0, 160) }
}

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: team }, { data: { user } }] = await Promise.all([
    supabase.from('teams').select('*, profiles!teams_user_id_fkey(full_name, email)').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!team) notFound()

  const t = team as Team & { profiles: { full_name: string | null; email: string } }
  const typeInfo = TEAM_TYPE_MAP[t.type]
  const isOwner = user?.id === t.user_id
  const deadline = t.deadline ? new Date(t.deadline) : null
  const isUrgent = deadline && (deadline.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link href="/teams" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Team Matching
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="h-2" style={{ backgroundColor: typeInfo?.color ?? '#232D4B' }} />
            <div className="p-6 space-y-3">
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: typeInfo?.bg ?? '#F8F7F4', color: typeInfo?.color ?? '#232D4B' }}
              >
                {typeInfo?.emoji} {typeInfo?.label}
              </span>
              <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>{t.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Posted {formatRelativeTime(t.created_at)}
                </span>
                {t.profiles?.full_name && (
                  <span>by {t.profiles.full_name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-3">About this Opportunity</h2>
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{t.description}</p>
          </div>

          {/* Skills */}
          {t.skills_needed.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-3">Skills & Backgrounds Wanted</h2>
              <div className="flex flex-wrap gap-2">
                {t.skills_needed.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1.5 rounded-full font-medium text-white"
                    style={{ backgroundColor: typeInfo?.color ?? '#232D4B' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400">Details</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#F8F7F4' }}>
                  <Users className="h-4 w-4" style={{ color: '#232D4B' }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Spots Available</p>
                  <p className="text-sm font-bold" style={{ color: '#232D4B' }}>
                    {t.spots_available} {t.spots_available === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>

              {deadline && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: isUrgent ? '#FFF1F2' : '#F8F7F4' }}>
                    <Calendar className="h-4 w-4" style={{ color: isUrgent ? '#E11D48' : '#232D4B' }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Deadline</p>
                    <p className="text-sm font-bold" style={{ color: isUrgent ? '#E11D48' : '#232D4B' }}>
                      {isUrgent && '⚡ '}{deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100">
              <a
                href={`mailto:${t.contact_email}?subject=Interested in: ${encodeURIComponent(t.title)}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: '#E57200' }}
              >
                <Mail className="h-4 w-4" /> Express Interest
              </a>
              <p className="text-xs text-center text-gray-400 mt-2">{t.contact_email}</p>
            </div>

            {isOwner && (
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href={`/teams/${t.id}/edit`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit Posting
                </Link>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-gray-400">
            Only @virginia.edu students can post and respond to opportunities.
          </p>
        </div>
      </div>
    </div>
  )
}
