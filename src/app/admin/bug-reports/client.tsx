'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'

type Report = {
  id: string
  user_id: string | null
  reporter_email: string | null
  title: string
  description: string
  url: string | null
  user_agent: string | null
  status: 'new' | 'investigating' | 'fixed' | 'wontfix' | 'duplicate'
  notes: string | null
  created_at: string
}

const STATUS_CYCLE: Report['status'][] = ['new', 'investigating', 'fixed', 'wontfix', 'duplicate']

const STATUS_COLORS: Record<Report['status'], string> = {
  new: 'bg-amber-100 text-amber-700',
  investigating: 'bg-blue-100 text-blue-700',
  fixed: 'bg-green-100 text-green-700',
  wontfix: 'bg-gray-100 text-gray-600',
  duplicate: 'bg-gray-100 text-gray-600',
}

export function BugReportsAdmin() {
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState<'open' | 'all' | 'fixed'>('open')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/bug-reports?status=${filter}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setReports(data.reports ?? [])
    } catch {
      setError('Could not load reports.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  // Cycle through statuses on click — lightweight inline state machine.
  async function cycleStatus(r: Report) {
    const idx = STATUS_CYCLE.indexOf(r.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    setBusyId(r.id)
    try {
      const res = await fetch(`/api/bug-reports/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Update failed.')
        return
      }
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FilterChip active={filter === 'open'} onClick={() => setFilter('open')}>Open</FilterChip>
        <FilterChip active={filter === 'fixed'} onClick={() => setFilter('fixed')}>Fixed</FilterChip>
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
        <button onClick={load} className="ml-auto text-xs text-gray-500 hover:text-gray-700">Refresh</button>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-500">No reports in this view.</p>
        </div>
      )}

      {!loading && !error && reports.map((r) => (
        <div key={r.id} className="rounded-2xl bg-white border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold flex-1" style={{ color: '#232D4B' }}>{r.title}</h3>
            <button
              onClick={() => cycleStatus(r)}
              disabled={busyId === r.id}
              title="Click to advance status"
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 capitalize ${STATUS_COLORS[r.status]} disabled:opacity-50 hover:opacity-80 transition-opacity`}
            >
              {busyId === r.id ? '…' : r.status}
            </button>
          </div>

          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{r.description}</p>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap text-[11px] text-gray-400">
            <span>{new Date(r.created_at).toLocaleString()}</span>
            {r.reporter_email && <span>· {r.reporter_email}</span>}
            {r.url && (
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-gray-700">
                <ExternalLink className="h-3 w-3" /> {new URL(r.url).pathname}
              </a>
            )}
            {r.user_agent && <span className="truncate max-w-md">· {r.user_agent}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function FilterChip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button onClick={onClick}
      className={`h-8 px-3 rounded-full text-xs font-semibold transition-all ${
        active ? 'bg-[#232D4B] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}>
      {children}
    </button>
  )
}
