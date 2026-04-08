'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { CATEGORIES } from '@/lib/constants'
import { X } from 'lucide-react'

export function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const category = searchParams.get('category') ?? ''
  const subcategory = searchParams.get('subcategory') ?? ''
  const minPrice = searchParams.get('min_price') ?? ''
  const maxPrice = searchParams.get('max_price') ?? ''
  const sort = searchParams.get('sort') ?? 'newest'

  const activeCat = CATEGORIES.find((c) => c.slug === category)

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    if (key === 'category') params.delete('subcategory')
    params.delete('page')
    startTransition(() => router.push(`/listings?${params.toString()}`))
  }

  function clearAll() {
    const q = searchParams.get('q')
    startTransition(() => router.push(q ? `/listings?q=${q}` : '/listings'))
  }

  const hasFilters = category || subcategory || minPrice || maxPrice || sort !== 'newest'

  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-2"
  const selectClass = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#232D4B] focus:ring-1 focus:ring-[#232D4B] transition-all"
  const inputClass = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#232D4B] focus:ring-1 focus:ring-[#232D4B] transition-all"

  return (
    <aside className="bg-white rounded-xl border border-gray-100 p-4 space-y-5 w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm" style={{ color: '#232D4B' }}>Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs flex items-center gap-1 hover:text-red-600 transition-colors"
            style={{ color: '#E57200' }}
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className={labelClass} style={{ color: '#232D4B' }}>Sort By</label>
        <select className={selectClass} value={sort} onChange={(e) => update('sort', e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass} style={{ color: '#232D4B' }}>Category</label>
        <select
          className={selectClass}
          value={category}
          onChange={(e) => update('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Subcategory */}
      {activeCat && (
        <div>
          <label className={labelClass} style={{ color: '#232D4B' }}>Subcategory</label>
          <select
            className={selectClass}
            value={subcategory}
            onChange={(e) => update('subcategory', e.target.value)}
          >
            <option value="">All</option>
            {activeCat.subcategories.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      )}

      {/* Price range */}
      <div>
        <label className={labelClass} style={{ color: '#232D4B' }}>Price Range</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min $"
            className={inputClass}
            defaultValue={minPrice}
            onBlur={(e) => update('min_price', e.target.value)}
          />
          <span className="text-gray-400 shrink-0">—</span>
          <input
            type="number"
            placeholder="Max $"
            className={inputClass}
            defaultValue={maxPrice}
            onBlur={(e) => update('max_price', e.target.value)}
          />
        </div>
      </div>

      {/* Category quick links */}
      <div className="border-t border-gray-100 pt-4">
        <label className={labelClass} style={{ color: '#232D4B' }}>Quick Browse</label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => update('category', category === cat.slug ? '' : cat.slug)}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                category === cat.slug
                  ? 'font-semibold text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={category === cat.slug ? { backgroundColor: '#232D4B' } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
