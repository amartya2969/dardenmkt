import Link from 'next/link'
import { ListingCard } from './ListingCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Listing } from '@/types'
import { Plus } from 'lucide-react'

interface ListingGridProps {
  listings: Listing[]
  emptyMessage?: string
  emptyCategory?: string
}

export function ListingGrid({ listings, emptyMessage = 'No listings found.', emptyCategory }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="text-5xl">📭</div>
        <div>
          <p className="text-lg font-semibold" style={{ color: '#232D4B' }}>{emptyMessage}</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to post something here.</p>
        </div>
        <Link
          href={`/listings/new${emptyCategory ? `?category=${emptyCategory}` : ''}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: '#E57200' }}
        >
          <Plus className="h-4 w-4" /> Post a Listing
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/3] rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
