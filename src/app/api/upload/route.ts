import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { filename, contentType } = await request.json()
  if (!filename || !contentType) {
    return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(contentType)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const ext = filename.split('.').pop()
  const path = `${user.id}/${Date.now()}.${ext}`

  // Use service role to generate signed upload URL
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await serviceClient.storage
    .from('listing-images')
    .createSignedUploadUrl(path)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const publicUrl = serviceClient.storage
    .from('listing-images')
    .getPublicUrl(path).data.publicUrl

  return NextResponse.json({
    uploadUrl: data.signedUrl,
    publicUrl,
    path,
  })
}
