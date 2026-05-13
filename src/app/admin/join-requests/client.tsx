'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, X, Loader2, Copy } from 'lucide-react'

type Request = {
  id: string
  email: string
  name: string
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
}

type Approval = { email: string; name: string; tempPassword: string }

export function JoinRequestsAdmin() {
  const [requests, setRequests] = useState<Request[]>([])
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [approval, setApproval] = useState<Approval | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/join-requests?status=${filter}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      setRequests(data.requests ?? [])
    } catch {
      setError('Could not load requests.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  async function act(id: string, action: 'approve' | 'reject') {
    if (action === 'reject' && !window.confirm('Reject this request?')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/join-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error ?? 'Failed.'); return }
      if (action === 'approve' && data.tempPassword) {
        setApproval({ email: data.email, name: data.name, tempPassword: data.tempPassword })
      }
      await load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Approval reveal — admin must copy this somewhere before dismissing */}
      {approval && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-bold text-amber-900">User created — share these credentials</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Send these to <strong>{approval.name}</strong> via UVA email or Slack. The temp password
                won&apos;t be shown again — copy it now.
              </p>
            </div>
            <button onClick={() => setApproval(null)}
              className="text-amber-700 hover:text-amber-900 text-sm font-medium">
              Dismiss
            </button>
          </div>
          <div className="space-y-2 text-sm font-mono">
            <CredRow label="Email" value={approval.email} />
            <CredRow label="Temp password" value={approval.tempPassword} />
            <CredRow label="Sign in at" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/login`} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <FilterChip active={filter === 'pending'} onClick={() => setFilter('pending')}>Pending</FilterChip>
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
        <div className="ml-auto">
          <button onClick={load} className="text-xs text-gray-500 hover:text-gray-700">Refresh</button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-500">No requests in this view.</p>
        </div>
      )}

      {!loading && !error && requests.map((r) => (
        <div key={r.id} className="rounded-2xl bg-white border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold" style={{ color: '#232D4B' }}>{r.name}</p>
              <p className="text-sm text-gray-500 truncate">{r.email}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Submitted {new Date(r.created_at).toLocaleString()} ·{' '}
                <StatusPill status={r.status} />
              </p>
            </div>
            {r.status === 'pending' && (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => act(r.id, 'reject')} disabled={busyId === r.id}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
                <button onClick={() => act(r.id, 'approve')} disabled={busyId === r.id}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#E57200' }}>
                  {busyId === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Approve
                </button>
              </div>
            )}
          </div>
          {r.reason && (
            <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap border-l-2 border-gray-100 pl-3">
              {r.reason}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`h-8 px-3 rounded-full text-xs font-semibold transition-all ${
        active ? 'bg-[#232D4B] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}>
      {children}
    </button>
  )
}

function StatusPill({ status }: { status: Request['status'] }) {
  const cls =
    status === 'approved' ? 'text-green-700' :
    status === 'rejected' ? 'text-red-600' :
    'text-amber-600'
  return <span className={`font-medium ${cls}`}>{status}</span>
}

function CredRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-amber-900/70 w-32 shrink-0">{label}</span>
      <code className="flex-1 px-2 py-1 rounded bg-white border border-amber-200 text-amber-900 text-sm truncate">{value}</code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        }}
        className="text-amber-700 hover:text-amber-900 text-xs font-medium inline-flex items-center gap-1">
        <Copy className="h-3 w-3" /> {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
