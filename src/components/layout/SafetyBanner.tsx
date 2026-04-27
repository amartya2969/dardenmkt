'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, X } from 'lucide-react'

const STORAGE_KEY = 'dm.safety-banner-dismissed-v1'

export function SafetyBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== '1')
  }, [])

  if (!visible) return null

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  return (
    <div className="border-b border-amber-200/60" style={{ backgroundColor: '#FFFBEB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-start sm:items-center gap-3">
        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 sm:mt-0" style={{ color: '#B45309' }} />
        <p className="flex-1 text-[13px] leading-snug text-amber-900">
          <span className="font-semibold">Stay safe:</span>{' '}
          Never wire money, share bank info, or pay before seeing the item. Meet in public spots on Grounds — Darden lobby, Shannon Library, or a dining hall. Trust your instincts.
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss safety banner"
          className="shrink-0 p-1 rounded-md text-amber-700 hover:bg-amber-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
