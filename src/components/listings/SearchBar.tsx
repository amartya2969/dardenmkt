'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { Search, X } from 'lucide-react'

export function SearchBar({ dark = false }: { dark?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const currentQ = searchParams.get('q') ?? ''

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = inputRef.current?.value.trim() ?? ''
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set('q', q)
    else params.delete('q')
    params.delete('page')
    startTransition(() => router.push(`/listings?${params.toString()}`))
  }

  function clearSearch() {
    if (inputRef.current) inputRef.current.value = ''
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-lg">
      <div className="relative flex-1">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${dark ? 'text-gray-400' : 'text-muted-foreground'}`} />
        <input
          ref={inputRef}
          defaultValue={currentQ}
          placeholder="Search listings…"
          className={`w-full pl-9 pr-8 h-11 rounded-lg border text-sm outline-none transition-all ${
            dark
              ? 'bg-white/10 border-white/20 text-white placeholder:text-blue-300 focus:bg-white/15 focus:border-white/40'
              : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#232D4B] focus:ring-1 focus:ring-[#232D4B]'
          }`}
        />
        {currentQ && (
          <button
            type="button"
            onClick={clearSearch}
            className={`absolute right-2 top-1/2 -translate-y-1/2 ${dark ? 'text-blue-300 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-5 h-11 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60 shrink-0"
        style={{ backgroundColor: '#E57200' }}
      >
        Search
      </button>
    </form>
  )
}
