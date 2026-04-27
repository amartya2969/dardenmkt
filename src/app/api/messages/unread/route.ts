import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ count: 0 })

  const { data, error } = await supabase.rpc('get_unread_message_count', { p_user_id: user.id })
  if (error) return NextResponse.json({ count: 0, error: error.message }, { status: 200 })

  return NextResponse.json({ count: typeof data === 'number' ? data : 0 })
}
