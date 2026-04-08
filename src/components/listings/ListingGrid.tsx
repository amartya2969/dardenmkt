import { ListingCard } from './ListingCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Listing } from '@/types'

interface ListingGridProps {
  listings: Listing[]
  emptyMessage?: string
}

export function ListingGrid({ listings, emptyMessage = 'No listings found.' }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">{emptyMessage}</p>
        <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[4/3] rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
