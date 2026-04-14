import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { CATEGORY_MAP } from '@/lib/constants'
import { MapPin, Clock, ArrowLeft, Pencil, Lock } from 'lucide-react'
import type { Listing } from '@/types'
import type { Metadata } from 'next'
import { DeleteListingButton } from './DeleteListingButton'
import { ContactForm } from '@/components/ContactForm'
import { ImageSlideshow } from '@/components/listings/ImageSlideshow'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('listings').select('title, description, images').eq('id', id).single()
  if (!data) return { title: 'Listing Not Found' }
  return {
    title: data.title,
    description: data.description.slice(0, 160),
    openGraph: data.images?.[0] ? { images: [{ url: data.images[0] }] } : undefined,
  }
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: listing }, { data: { user } }] = await Promise.all([
    supabase.from('listings').select('*, profiles!listings_user_id_fkey(full_name, email)').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!listing) notFound()

  const l = listing as Listing & { profiles: { full_name: string | null; email: string } }
  const isOwner = user?.id === l.user_id
  const cat = CATEGORY_MAP[l.category]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/listings" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Description */}
        <div className="lg:col-span-2 space-y-5">
          {l.images && l.images.length > 0 ? (
            <ImageSlideshow images={l.images} title={l.title} />
          ) : (
            <div className="aspect-[4/3] rounded-2xl flex items-center justify-center text-7xl shadow-sm"
              style={{ background: 'linear-gradient(135deg, #f8f7f4 0%, #eee 100%)' }}>
              {l.category === 'housing' ? '🏠' : l.category === 'for-sale' ? '🏷️' : l.category === 'jobs' ? '💼' : l.category === 'rideshare' ? '🚗' : l.category === 'services' ? '🔧' : l.category === 'events' ? '🎟️' : l.category === 'community' ? '👥' : '🔍'}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-2">
            <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{l.description}</p>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Colour top bar */}
            <div className="h-1.5" style={{ backgroundColor: cat ? undefined : '#232D4B', background: 'linear-gradient(90deg, #232D4B 0%, #E57200 100%)' }} />

            <div className="p-5 space-y-4">
              {/* Badges + title */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {cat && <Badge className={`${cat.color} border-0 text-xs`}>{cat.label}</Badge>}
                  {l.subcategory && <Badge variant="outline" className="text-xs">{l.subcategory}</Badge>}
                </div>
                <h1 className="text-xl font-bold leading-tight" style={{ color: '#232D4B' }}>{l.title}</h1>
              </div>

              {/* Price */}
              <div className="text-3xl font-extrabold" style={{ color: '#232D4B' }}>
                {l.price !== null
                  ? formatPrice(l.price, l.price_label)
                  : l.price_label
                    ? <span className="text-2xl">{l.price_label}</span>
                    : <span className="text-lg font-semibold text-gray-400">Contact for price</span>}
              </div>

              <div className="h-px bg-gray-100" />

              {/* Meta */}
              <div className="space-y-2 text-sm text-gray-500">
                {l.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                    {l.location}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                  Posted {formatRelativeTime(l.created_at)}
                </div>
                {l.profiles?.full_name && (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 shrink-0 text-gray-400 text-xs">👤</span>
                    {l.profiles.full_name}
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100" />

              {/* CTA — gated behind sign-in, hidden for owner */}
              {!user ? (
                <div className="space-y-2">
                  <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
                    <Lock className="h-4 w-4 shrink-0 text-gray-400" />
                    Sign in to see contact details
                  </div>
                  <Button asChild className="w-full font-semibold" style={{ backgroundColor: '#E57200', border: 'none', color: '#fff' }}>
                    <Link href="/auth/login">Sign In to Contact</Link>
                  </Button>
                </div>
              ) : !isOwner ? (
                <ContactForm listingId={l.id} listingTitle={l.title} />
              ) : (
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700 text-center">
                  This is your listing
                </div>
              )}

              {/* Owner actions */}
              {isOwner && (
                <div className="flex gap-2 pt-1">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/listings/${l.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Link>
                  </Button>
                  <DeleteListingButton id={l.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
