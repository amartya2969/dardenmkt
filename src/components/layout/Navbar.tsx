'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Plus, User2, LogOut, LayoutList, ChevronDown, Settings } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full" style={{ backgroundColor: '#232D4B' }}>
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-white font-bold text-xl tracking-tight">Darden</span>
              <span className="font-bold text-xl tracking-tight" style={{ color: '#E57200' }}>Mkt</span>
            </div>
            <span className="hidden sm:block text-xs text-blue-200 border-l border-blue-400 pl-2 ml-1">
              UVA Student Marketplace
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-blue-100 hover:text-white hover:bg-white/10 transition-colors">
                  Browse <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/listings" className="font-medium">All Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {CATEGORIES.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link href={`/category/${cat.slug}`}>{cat.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              href="/teams"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{ color: '#E57200' }}
            >
              🤝 Team Match
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:flex gap-1.5 text-white border-white/30 hover:bg-white/10"
                  style={{ backgroundColor: '#E57200', borderColor: 'transparent' }}
                >
                  <Link href="/listings/new">
                    <Plus className="h-4 w-4" /> Post Listing
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-blue-100 hover:text-white hover:bg-white/10 transition-colors">
                      <User2 className="h-4 w-4" />
                      <span className="hidden sm:inline max-w-[100px] truncate">
                        {user.email?.split('@')[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/my-listings" className="gap-2 flex items-center">
                        <LayoutList className="h-4 w-4" /> My Listings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="gap-2 flex items-center">
                        <Settings className="h-4 w-4" /> Edit Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="sm:hidden">
                      <Link href="/listings/new" className="gap-2 flex items-center">
                        <Plus className="h-4 w-4" /> Post Listing
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="gap-2 text-red-600 flex items-center">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                asChild
                size="sm"
                className="text-white"
                style={{ backgroundColor: '#E57200', border: 'none' }}
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile hamburger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 rounded-md text-blue-100 hover:text-white hover:bg-white/10 transition-colors">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div style={{ backgroundColor: '#232D4B' }} className="h-16 flex items-center px-4">
                  <span className="text-white font-bold text-lg">Darden<span style={{ color: '#E57200' }}>Mkt</span></span>
                </div>
                <div className="py-4 space-y-1 px-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 pb-1">
                    Browse
                  </p>
                  <Link
                    href="/listings"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium"
                  >
                    All Listings
                  </Link>
                  <Link
                    href="/teams"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium"
                    style={{ color: '#E57200' }}
                  >
                    🤝 Team Matching
                  </Link>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Category strip */}
      <div className="border-t border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  pathname === `/category/${cat.slug}`
                    ? 'text-white border-b-2 border-[#E57200]'
                    : 'text-blue-200 hover:text-white hover:border-b-2 hover:border-white/40 border-b-2 border-transparent'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
