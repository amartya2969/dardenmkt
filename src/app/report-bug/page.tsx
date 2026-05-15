'use client'

import { Suspense, useEffect, useState } from 'react'
import { Bug, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ReportBugInner() {
  const params = useSearchParams()
  // Optional ?from=<url> from "Report a bug" link in the footer / error pages.
  // We use this as the default URL field, which the user can override.
  const fromUrl = params.get('from') ?? ''

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState(fromUrl)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // Auto-fill URL with the current page if user navigated here directly.
  useEffect(() => {
    if (!url && typeof window !== 'undefined') {
      setUrl(document.referrer || '')
    }
  }, [url])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      const res = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, url: url || null }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error ?? 'Failed to submit.'); setBusy(false); return }
      setDone(true)
    } catch {
      setErr('Network error. Please try again.')
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center space-y-4 max-w-md">
          <CheckCircle2 className="h-14 w-14 mx-auto" style={{ color: '#E57200' }} />
          <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Thanks for the report!</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            We&apos;ll take a look. If you included your email, we may reach out for clarification.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/" className="text-sm font-semibold hover:underline" style={{ color: '#232D4B' }}>
              ← Back home
            </Link>
            <button onClick={() => { setDone(false); setTitle(''); setDescription(''); setUrl('') }}
              className="text-sm font-semibold hover:underline" style={{ color: '#E57200' }}>
              Report another bug
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 mb-3 inline-block">
          ← Back home
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
              <Bug className="h-5 w-5" style={{ color: '#D97706' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#232D4B' }}>Report a bug</h1>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Something broken or confusing? Tell us about it. The more detail, the faster we can fix.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {err && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{err}</div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
                Short title
              </label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Save listing button doesn't work on mobile"
                minLength={3} maxLength={150} required
                className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
                What happened?
              </label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                rows={6} minLength={10} maxLength={5000} required
                placeholder={`What were you trying to do?
What did you expect to happen?
What happened instead?
Any error messages?`}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold" style={{ color: '#232D4B' }}>
                Page URL <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.uvdardenmkt.com/…"
                className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#232D4B] focus:ring-2 focus:ring-[#232D4B]/10 transition-all"
              />
              <p className="text-[11px] text-gray-400">Where on the site did it happen?</p>
            </div>

            <button type="submit" disabled={busy}
              className="w-full h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#E57200' }}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : 'Send Report'}
            </button>

            <p className="text-[11px] text-center text-gray-400">
              We&apos;ll attach your email and browser info automatically (when signed in)
              so we can follow up.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ReportBugPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>}>
      <ReportBugInner />
    </Suspense>
  )
}
