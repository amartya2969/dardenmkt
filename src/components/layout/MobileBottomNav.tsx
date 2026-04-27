'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Plus, Users, Bookmark } from 'lucide-react'

const NAV_ITEMS: { href: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; special?: true }[] = [
  { href: '/',             icon: Home,       label: 'Home'   },
  { href: '/listings',     icon: LayoutGrid, label: 'Browse' },
  { href: '/listings/new', icon: Plus,       label: 'Post',  special: true },
  { href: '/teams',        icon: Users,      label: 'Teams'  },
  { href: '/saved',        icon: Bookmark,   label: 'Saved'  },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-gray-200 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-end justify-around h-16 px-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label, special }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 gap-0.5 pt-2"
            >
              {special ? (
                <div
                  className="flex items-center justify-center w-12 h-9 rounded-2xl text-white shadow-md -mt-3"
                  style={{ backgroundColor: '#E57200' }}
                >
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <Icon
                  className="h-5 w-5 transition-colors"
                  style={{ color: isActive ? '#232D4B' : '#9ca3af' }}
                />
              )}
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: special ? '#9ca3af' : isActive ? '#232D4B' : '#9ca3af' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
