'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Plus, LogOut, LayoutList, ChevronDown, Settings, Bookmark, MessageCircle } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', onScroll) }
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initial = (user?.email?.[0] ?? '?').toUpperCase()

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md transition-all duration-200 ${
        scrolled ? 'shadow-sm border-b border-gray-200/80' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <span className="font-extrabold text-xl tracking-tight" style={{ color: '#232D4B' }}>Darden</span>
            <span className="font-extrabold text-xl tracking-tight" style={{ color: '#E57200' }}>Mkt</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  Browse <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/listings" className="font-semibold">All Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/teams" className="font-semibold">🤝 Team Matching</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {CATEGORIES.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link href={`/category/${cat.slug}`}>{cat.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2.5 ml-auto">
            {user ? (
              <>
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:flex gap-1.5 text-white font-semibold rounded-full px-4 shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: '#E57200', border: 'none' }}
                >
                  <Link href="/listings/new">
                    <Plus className="h-4 w-4" /> Post Listing
                  </Link>
                </Button>

                {/* Airbnb-style avatar pill */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 rounded-full border border-gray-200 hover:shadow-md transition-all bg-white group">
                      <Menu className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: '#232D4B' }}
                      >
                        {initial}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <div className="px-3 py-2.5 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-800 truncate">{user.email?.split('@')[0]}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <DropdownMenuItem asChild>
                        <Link href="/my-listings" className="gap-2.5 flex items-center text-sm">
                          <LayoutList className="h-4 w-4 text-gray-400" /> My Listings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/messages" className="gap-2.5 flex items-center text-sm">
                          <MessageCircle className="h-4 w-4 text-gray-400" /> Messages
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/saved" className="gap-2.5 flex items-center text-sm">
                          <Bookmark className="h-4 w-4 text-gray-400" /> Saved Listings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="gap-2.5 flex items-center text-sm">
                          <Settings className="h-4 w-4 text-gray-400" /> Edit Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="sm:hidden">
                        <Link href="/listings/new" className="gap-2.5 flex items-center text-sm">
                          <Plus className="h-4 w-4 text-gray-400" /> Post Listing
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    <div className="border-t border-gray-50 py-1">
                      <DropdownMenuItem onClick={signOut} className="gap-2.5 text-red-500 flex items-center text-sm">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="text-white font-semibold rounded-full px-5"
                  style={{ backgroundColor: '#232D4B', border: 'none' }}
                >
                  <Link href="/auth/login">Get Started</Link>
                </Button>
              </>
            )}

            {/* Mobile hamburger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="h-16 flex items-center px-5 border-b border-gray-100">
                  <span className="font-extrabold text-xl" style={{ color: '#232D4B' }}>
                    Darden<span style={{ color: '#E57200' }}>Mkt</span>
                  </span>
                </div>
                <div className="py-3 px-3 space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 pb-1 pt-2">Marketplace</p>
                  <Link href="/listings" onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    All Listings
                  </Link>
                  <Link href="/teams" onClick={() => setOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Team Matching
                  </Link>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-3 pb-1 pt-3">Categories</p>
                  {CATEGORIES.map((cat) => (
                    <Link key={cat.slug} href={`/category/${cat.slug}`} onClick={() => setOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
