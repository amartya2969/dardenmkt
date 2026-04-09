'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyEmailButton({ email, label = 'Copy Email' }: { email: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
      style={{ backgroundColor: copied ? '#16A34A' : '#232D4B', color: '#fff' }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied!' : label}
    </button>
  )
}
