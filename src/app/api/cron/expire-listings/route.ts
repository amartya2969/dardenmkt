import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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

  // 2. Delete expired conversations (2-day TTL)
  const { count: deletedConvs } = await supabase
    .from('conversations')
    .delete()
    .lt('expires_at', new Date().toISOString())

  return NextResponse.json({ expired: expiredCount ?? 0, deletedConvs: deletedConvs ?? 0 })
}
