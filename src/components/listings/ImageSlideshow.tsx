'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageSlideshowProps {
  images: string[]
  title: string
}

export function ImageSlideshow({ images, title }: ImageSlideshowProps) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
        <Image src={images[0]} alt={title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" priority />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm group">
        <Image
          src={images[current]}
          alt={`${title} — photo ${current + 1}`}
          fill
          className="object-cover transition-opacity duration-200"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority={current === 0}
        />

        {/* Prev */}
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Next */}
        <button
          onClick={() => setCurrent((c) => Math.min(images.length - 1, c + 1))}
          disabled={current === images.length - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:hidden"
          aria-label="Next photo"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Counter pill */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs font-medium tabular-nums">
          {current + 1} / {images.length}
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{ backgroundColor: i === current ? '#E57200' : 'rgba(255,255,255,0.6)' }}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`relative aspect-square rounded-xl overflow-hidden bg-gray-100 transition-all ${
              i === current
                ? 'ring-2 opacity-100'
                : 'opacity-60 hover:opacity-100'
            }`}
            style={i === current ? { '--tw-ring-color': '#E57200', outline: '2px solid #E57200' } as React.CSSProperties : {}}
            aria-label={`View photo ${i + 1}`}
          >
            <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="25vw" />
          </button>
        ))}
      </div>
    </div>
  )
}
