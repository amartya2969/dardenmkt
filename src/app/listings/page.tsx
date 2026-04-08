import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ListingGrid, ListingGridSkeleton } from '@/components/listings/ListingGrid'
import { FilterSidebar } from '@/components/listings/FilterSidebar'
import { SearchBar } from '@/components/listings/SearchBar'
import type { Listing, ListingFilters } from '@/types'

export const revalidate = 30

async function Listings({ filters }: { filters: ListingFilters }) {
  const supabase = await createClient()
  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')

  if (filters.q) {
    query = query.textSearch('search_vector', filters.q, { type: 'websearch' })
  }
  if (filters.category) query = query.eq('category', filters.category)
  if (filters.subcategory) query = query.eq('subcategory', filters.subcategory)
  if (filters.min_price) query = query.gte('price', filters.min_price)
  if (filters.max_price) query = query.lte('price', filters.max_price)

  switch (filters.sort) {
    case 'oldest':      query = query.order('created_at', { ascending: true }); break
    case 'price_asc':   query = query.order('price', { ascending: true, nullsFirst: false }); break
    case 'price_desc':  query = query.order('price', { ascending: false, nullsFirst: false }); break
    default:            query = query.order('created_at', { ascending: false })
  }

  const { data } = await query.limit(48)
  return <ListingGrid listings={(data as Listing[]) ?? []} />
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const filters: ListingFilters = {
    q: params.q,
    category: params.category,
    subcategory: params.subcategory,
    min_price: params.min_price,
    max_price: params.max_price,
    sort: (params.sort as ListingFilters['sort']) ?? 'newest',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">
          {filters.category
            ? `${filters.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Listings`
            : 'All Listings'}
        </h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-56 shrink-0">
          <Suspense>
            <FilterSidebar />
          </Suspense>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <Suspense key={JSON.stringify(filters)} fallback={<ListingGridSkeleton count={8} />}>
            <Listings filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
