import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Enforce @virginia.edu domain
  if (user && !user.email?.endsWith('@virginia.edu')) {
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
