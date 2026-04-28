'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Plus, Users, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS: { href: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; special?: true; trackUnread?: true }[] = [
  { href: '/',             icon: Home,          label: 'Home'     },
  { href: '/listings',     icon: LayoutGrid,    label: 'Browse'   },
  { href: '/listings/new', icon: Plus,          label: 'Post',    special: true },
  { href: '/teams',        icon: Users,         label: 'Teams'    },
  { href: '/messages',     icon: MessageCircle, label: 'Messages', trackUnread: true },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!signedIn) { setUnread(0); return }
    let cancelled = false
    const fetchUnread = () => {
      fetch('/api/messages/unread', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setUnread(d.count ?? 0) })
        .catch(() => {})
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 15_000)
    const onVisible = () => { if (document.visibilityState === 'visible') fetchUnread() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [signedIn, pathname])

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-gray-200 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-end justify-around h-16 px-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label, special, trackUnread }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname === href || pathname.startsWith(href + '/')
          const showBadge = trackUnread && unread > 0

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
                <div className="relative">
                  <Icon
                    className="h-5 w-5 transition-colors"
                    style={{ color: isActive ? '#232D4B' : '#9ca3af' }}
                  />
                  {showBadge && (
                    <span
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white"
                      aria-label={`${unread} unread messages`}
                    >
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>
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
