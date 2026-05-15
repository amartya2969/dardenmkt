import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { TEAM_TYPE_MAP } from '@/lib/constants'
import { Plus, Pencil, Eye, Users } from 'lucide-react'
import type { Listing, Team } from '@/types'

export const metadata = { title: 'My Posts' }

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  sold: 'bg-gray-100 text-gray-600',
  filled: 'bg-gray-100 text-gray-600',
  closed: 'bg-gray-100 text-gray-600',
  expired: 'bg-yellow-100 text-yellow-700',
  removed: 'bg-red-100 text-red-700',
}

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Query listings and teams in parallel — they live in separate tables but
  // both belong to the user. Rendered as two sections so users can tell them
  // apart at a glance.
  const [{ data: listings }, { data: teams }] = await Promise.all([
    supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('teams')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const listingItems = (listings as Listing[]) ?? []
  const teamItems = (teams as Team[]) ?? []
  const isEmpty = listingItems.length === 0 && teamItems.length === 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">My Posts</h1>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/teams/new">
              <Users className="h-4 w-4 mr-1" /> New Team Post
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/listings/new">
              <Plus className="h-4 w-4 mr-1" /> New Listing
            </Link>
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-muted-foreground">You haven&apos;t posted anything yet.</p>
          <div className="flex justify-center gap-2">
            <Button asChild>
              <Link href="/listings/new">Post a listing</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/teams/new">Post a team</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {listingItems.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">
                Listings
              </h2>
              <div className="space-y-3">
                {listingItems.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        {listing.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shrink-0">
                            {listing.category === 'housing' ? '🏠' : listing.category === 'for-sale' ? '🏷️' : '📌'}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-medium truncate">{listing.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {listing.price !== null ? formatPrice(listing.price, listing.price_label) : listing.price_label ?? 'No price'}
                                {' · '}
                                {formatRelativeTime(listing.created_at)}
                              </p>
                            </div>
                            <Badge className={`${STATUS_BADGE[listing.status] ?? ''} border-0 capitalize shrink-0 text-xs`}>
                              {listing.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/listings/${listing.id}`}>
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          {listing.status === 'active' && (
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/listings/${listing.id}/edit`}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {teamItems.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">
                Team Matching
              </h2>
              <div className="space-y-3">
                {teamItems.map((team) => {
                  const typeInfo = TEAM_TYPE_MAP[team.type]
                  return (
                    <Card key={team.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl shrink-0"
                            style={{ backgroundColor: typeInfo?.bg ?? '#F8F7F4' }}
                          >
                            {typeInfo?.emoji ?? '👥'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium truncate">{team.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {typeInfo?.label ?? team.type}
                                  {' · '}
                                  {team.spots_available} {team.spots_available === 1 ? 'spot' : 'spots'}
                                  {' · '}
                                  {formatRelativeTime(team.created_at)}
                                </p>
                              </div>
                              <Badge className={`${STATUS_BADGE[team.status] ?? ''} border-0 capitalize shrink-0 text-xs`}>
                                {team.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/teams/${team.id}`}>
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            {team.status === 'active' && (
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/teams/${team.id}/edit`}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
