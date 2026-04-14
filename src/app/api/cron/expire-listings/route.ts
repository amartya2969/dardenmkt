import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, expiryEmailHtml } from '@/lib/email'

export const dynamic = 'force-dynamic'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dardenmkt.vercel.app'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Expire overdue listings
  const { error: expireError, count: expiredCount } = await supabase
    .from('listings')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString())

  if (expireError) {
    return NextResponse.json({ error: expireError.message }, { status: 500 })
  }

  // 2. Send 7-day expiry warning emails
  // Find listings expiring between now+6.5d and now+7.5d (daily cron window)
  const warningFrom = new Date(Date.now() + 6.5 * 24 * 60 * 60 * 1000).toISOString()
  const warningTo   = new Date(Date.now() + 7.5 * 24 * 60 * 60 * 1000).toISOString()

  const { data: expiringSoon } = await supabase
    .from('listings')
    .select('id, title, contact_email')
    .eq('status', 'active')
    .gte('expires_at', warningFrom)
    .lte('expires_at', warningTo)

  let emailsSent = 0
  if (expiringSoon && expiringSoon.length > 0) {
    await Promise.all(
      expiringSoon.map(async (listing) => {
        try {
          await sendEmail({
            to: listing.contact_email,
            subject: `Your listing "${listing.title}" expires in 7 days`,
            html: expiryEmailHtml({
              listingTitle: listing.title,
              listingUrl: `${SITE}/listings/${listing.id}`,
              daysLeft: 7,
            }),
          })
          emailsSent++
        } catch (err) {
          console.error('[cron] expiry email failed for', listing.id, err)
        }
      })
    )
  }

  return NextResponse.json({ expired: expiredCount ?? 0, emailsSent })
}
