import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next 16 renames the middleware file convention to proxy. The exported
// function must be named `proxy` (or default export).
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - image files (svg/png/jpg/etc) and the OG image route
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
