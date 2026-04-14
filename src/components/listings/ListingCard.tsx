import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import { CATEGORY_MAP } from '@/lib/constants'
import type { Listing } from '@/types'
import { MapPin, Clock } from 'lucide-react'
import { SaveButton } from '@/components/SaveButton'

const CATEGORY_COLORS: Record<string, string> = {
  housing:      '#4F46E5',
  'for-sale':   '#16A34A',
  jobs:         '#EA580C',
  rideshare:    '#D97706',
  services:     '#9333EA',
  community:    '#E11D48',
  events:       '#0D9488',
  'lost-found': '#0284C7',
}

const CATEGORY_BG: Record<string, string> = {
  housing:      '#EEF2FF',
  'for-sale':   '#F0FDF4',
  jobs:         '#FFF7ED',
  rideshare:    '#FFFBEB',
  services:     '#FDF4FF',
  community:    '#FFF1F2',
  events:       '#F0FDFA',
  'lost-found': '#F0F9FF',
}

const EMOJI: Record<string, string> = {
  housing: '🏠', 'for-sale': '🏷️', jobs: '💼',
  rideshare: '🚗', services: '🔧', community: '👥', events: '🎟️', 'lost-found': '🔍',
}

export function ListingCard({ listing }: { listing: Listing }) {
  const cat = CATEGORY_MAP[listing.category]
  const hasImage = listing.images && listing.images.length > 0
  const color = CATEGORY_COLORS[listing.category] ?? '#232D4B'
  const bg = CATEGORY_BG[listing.category] ?? '#F8F7F4'
  const isNew = Date.now() - new Date(listing.created_at).getTime() < 24 * 60 * 60 * 1000

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 hover:border-gray-200 transition-all duration-200 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: bg }}>
          {hasImage ? (
            <>
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-5xl select-none">
              {EMOJI[listing.category] ?? '📌'}
            </div>
          )}

          <SaveButton listingId={listing.id} />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex gap-1 flex-wrap">
            {cat && (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm"
                style={{ backgroundColor: `${bg}e8`, color }}
              >
                {listing.category === 'lost-found' && listing.subcategory
                  ? listing.subcategory
                  : cat.label}
              </span>
            )}
            {isNew && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white backdrop-blur-sm" style={{ backgroundColor: '#E57200' }}>
                New
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 flex flex-col gap-2 flex-1">
          <h3 className="font-semibold text-[13px] leading-snug line-clamp-2 text-gray-800 group-hover:text-[#232D4B] transition-colors">
            {listing.title}
          </h3>

          <div className="mt-auto">
            <div className="font-extrabold text-base leading-none" style={{ color: '#232D4B' }}>
              {listing.price !== null
                ? formatPrice(listing.price, listing.price_label)
                : listing.price_label
                  ? <span className="font-bold text-sm">{listing.price_label}</span>
                  : <span className="text-gray-400 font-normal text-xs">Contact for price</span>
              }
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-2 border-t border-gray-50">
            {listing.location && (
              <span className="flex items-center gap-0.5 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {listing.location}
              </span>
            )}
            <span className="flex items-center gap-0.5 ml-auto shrink-0">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(listing.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
