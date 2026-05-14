import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAllowedUvaEmail } from '@/lib/email-domain'
import { isAdminEmail } from '@/lib/admin'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isProtected = ['/listings/new', '/my-listings', '/listings'].some(
    (p) => url.pathname.startsWith(p) && url.pathname.includes('/edit')
  ) || url.pathname === '/listings/new' || url.pathname === '/my-listings'

  // Enforce allowed UVA email domains (virginia.edu or darden.virginia.edu).
  // Two carve-outs:
  //   1. Admins listed in ADMIN_EMAILS bypass this (Gmail etc.).
  //   2. OAuth users (e.g. LinkedIn) bypass this — they may not have a UVA
  //      email at all, and the assumption is that LinkedIn-verified identity
  //      is enough to grant access to the broader UVMkt network.
  const provider = user?.app_metadata?.provider
  const isOAuthUser = !!provider && provider !== 'email'
  if (user && !isOAuthUser && !isAllowedUvaEmail(user.email) && !isAdminEmail(user.email)) {
    await supabase.auth.signOut()
    url.pathname = '/auth/login'
    url.searchParams.set('error', 'domain')
    return NextResponse.redirect(url)
  }

  if (!user && isProtected) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user && url.pathname === '/auth/login') {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
