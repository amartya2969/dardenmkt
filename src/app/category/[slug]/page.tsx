import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ListingGrid, ListingGridSkeleton } from '@/components/listings/ListingGrid'
import { FilterSidebar } from '@/components/listings/FilterSidebar'
import { SearchBar } from '@/components/listings/SearchBar'
import { CATEGORY_MAP } from '@/lib/constants'
import type { Listing } from '@/types'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cat = CATEGORY_MAP[slug]
  if (!cat) return { title: 'Category Not Found' }
  return { title: `${cat.label} Listings` }
}

async function CategoryListings({ slug }: { slug: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .eq('category', slug)
    .order('created_at', { ascending: false })
    .limit(48)

  return (
    <ListingGrid
      listings={(data as Listing[]) ?? []}
      emptyMessage={`No ${CATEGORY_MAP[slug]?.label ?? ''} listings yet.`}
      emptyCategory={slug}
    />
  )
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = CATEGORY_MAP[slug]
  if (!cat) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">{cat.label}</h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-56 shrink-0">
          <Suspense>
            <FilterSidebar />
          </Suspense>
        </div>
        <div className="flex-1 min-w-0">
          <Suspense fallback={<ListingGridSkeleton count={8} />}>
            <CategoryListings slug={slug} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
