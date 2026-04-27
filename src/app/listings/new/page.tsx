import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ListingForm } from '@/components/listings/ListingForm'
import type { ListingFormValues } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export const metadata = { title: 'Post a Listing' }

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  async function createListing(values: ListingFormValues) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const rawMeta = values.metadata
    const cleanMeta = rawMeta
      ? Object.fromEntries(Object.entries(rawMeta).filter(([, v]) => !!v))
      : null

    const { data, error } = await supabase.from('listings').insert({
      user_id: user.id,
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
    }).select('id').single()

    if (error) throw new Error(error.message)
    revalidatePath('/listings')
    revalidatePath('/')
    redirect(`/listings/${data.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Post a Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in the details below. Your listing will be visible to all UVA students.
        </p>
      </div>
      <ListingForm mode="create" onSubmit={createListing} />
    </div>
  )
}
