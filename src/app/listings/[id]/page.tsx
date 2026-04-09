import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { CATEGORY_MAP } from '@/lib/constants'
import { MapPin, Clock, Mail, ArrowLeft, Pencil } from 'lucide-react'
import type { Listing } from '@/types'
import type { Metadata } from 'next'
import { DeleteListingButton } from './DeleteListingButton'
import { CopyEmailButton } from '@/components/CopyEmailButton'

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link href="/listings" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Image gallery */}
          {l.images && l.images.length > 0 ? (
            <div className="space-y-2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                <Image src={l.images[0]} alt={l.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" priority />
              </div>
              {l.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {l.images.slice(1).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image src={img} alt={`Photo ${i + 2}`} fill className="object-cover" sizes="25vw" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center text-6xl">
              {l.category === 'housing' ? '🏠' : l.category === 'for-sale' ? '🏷️' : l.category === 'jobs' ? '💼' : '📌'}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h2 className="font-semibold">Description</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{l.description}</p>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <div className="border rounded-xl p-5 space-y-4">
            {/* Title + badges */}
            <div className="space-y-2">
              {cat && <Badge className={`${cat.color} border-0 text-xs`}>{cat.label}</Badge>}
              {l.subcategory && <Badge variant="outline" className="text-xs ml-1">{l.subcategory}</Badge>}
              <h1 className="text-xl font-bold leading-tight">{l.title}</h1>
            </div>

            {/* Price */}
            <div className="text-2xl font-bold text-green-700">
              {l.price !== null
                ? formatPrice(l.price, l.price_label)
                : l.price_label ?? 'Contact for price'}
            </div>

            <Separator />

            {/* Meta */}
            <div className="space-y-2 text-sm text-muted-foreground">
              {l.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {l.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                Posted {formatRelativeTime(l.created_at)}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${l.contact_email}`} className="text-blue-700 hover:underline break-all">
                  {l.contact_email}
                </a>
              </div>
            </div>

            <Separator />

            {/* CTA — gated behind sign-in */}
            {user ? (
              <CopyEmailButton email={l.contact_email} label="Copy Seller Email" />
            ) : (
              <Button asChild className="w-full" size="lg" style={{ backgroundColor: '#E57200', border: 'none' }}>
                <Link href={`/auth/login`}>
                  <Mail className="h-4 w-4 mr-2" /> Sign In to Contact
                </Link>
              </Button>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/listings/${l.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Link>
                </Button>
                <DeleteListingButton id={l.id} />
              </div>
            )}
          </div>

          {/* Posted by */}
          {l.profiles?.full_name && (
            <p className="text-xs text-muted-foreground text-center">
              Posted by {l.profiles.full_name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
