import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ListingGrid } from '@/components/listings/ListingGrid'
import type { Listing } from '@/types'
import { Bookmark } from 'lucide-react'

export const metadata = { title: 'Saved Listings' }

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data } = await supabase
    .from('saved_listings')
    .select('listing:listings(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const listings = ((data ?? [])
    .map((d) => (d as unknown as { listing: Listing | null }).listing)
    .filter((l): l is Listing => l !== null))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="flex items-center gap-2 mb-6">
        <Bookmark className="h-6 w-6" style={{ color: '#E57200' }} />
        <h1 className="text-2xl font-bold" style={{ color: '#232D4B' }}>Saved Listings</h1>
        {listings.length > 0 && (
          <span className="ml-1 text-sm text-gray-400">({listings.length})</span>
        )}
      </div>
      <ListingGrid
        listings={listings}
        emptyMessage="No saved listings yet."
      />
    </div>
  )
}
