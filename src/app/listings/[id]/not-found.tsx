import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ListingNotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
      <h1 className="text-3xl font-bold">Listing Not Found</h1>
      <p className="text-muted-foreground">
        This listing may have been removed or expired.
      </p>
      <Button asChild>
        <Link href="/listings">Browse All Listings</Link>
      </Button>
    </div>
  )
}
