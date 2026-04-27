import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ListingForm } from '@/components/listings/ListingForm'
import type { ListingFormValues } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import type { Listing } from '@/types'

export const metadata = { title: 'Edit Listing' }

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: listing } = await supabase.from('listings').select('*').eq('id', id).single()
  if (!listing) notFound()
  if (listing.user_id !== user.id) redirect(`/listings/${id}`)

  async function updateListing(values: ListingFormValues) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const rawMeta = values.metadata
    const cleanMeta = rawMeta
      ? Object.fromEntries(Object.entries(rawMeta).filter(([, v]) => !!v))
      : null

    const { error } = await supabase.from('listings').update({
      title: values.title,
      description: values.description,
      category: values.category,
      subcategory: values.subcategory || null,
      price: values.price ? parseFloat(values.price) : null,
      price_label: values.price_label || null,
      contact_email: values.contact_email,
      location: values.location || null,
      images: values.images,
      metadata: cleanMeta && Object.keys(cleanMeta).length > 0 ? cleanMeta : null,
    }).eq('id', id).eq('user_id', user.id)

    if (error) throw new Error(error.message)
    revalidatePath(`/listings/${id}`)
    revalidatePath('/listings')
    redirect(`/listings/${id}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Listing</h1>
      </div>
      <ListingForm mode="edit" defaultValues={listing as Listing} onSubmit={updateListing} />
    </div>
  )
}
