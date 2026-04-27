'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { listingSchema, type ListingFormValues } from '@/lib/validations'
import { CATEGORIES, LOCATIONS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Controller } from 'react-hook-form'
import { ImageUploader } from './ImageUploader'
import { Loader2 } from 'lucide-react'
import type { Listing } from '@/types'

interface ListingFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<Listing>
  onSubmit: (values: ListingFormValues) => Promise<void>
}

const selectClass = 'w-full text-sm border border-input rounded-md px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-ring transition-all'

function CategoryMetaFields({
  category,
  register,
}: {
  category: string
  register: ReturnType<typeof useForm<ListingFormValues>>['register']
}) {
  const fieldSet = (label: string, children: React.ReactNode) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )

  if (category === 'housing') {
    return (
      <div className="space-y-4 rounded-xl bg-blue-50/60 border border-blue-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#232D4B' }}>Housing Details</p>
        <div className="grid grid-cols-3 gap-4">
          {fieldSet('Bedrooms',
            <select className={selectClass} {...(register as any)('metadata.bedrooms')}>
              <option value="">—</option>
              {['Studio', '1', '2', '3', '4', '5+'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          )}
          {fieldSet('Bathrooms',
            <select className={selectClass} {...(register as any)('metadata.bathrooms')}>
              <option value="">—</option>
              {['1', '1.5', '2', '2.5', '3+'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          )}
          {fieldSet('Furnished',
            <select className={selectClass} {...(register as any)('metadata.furnished')}>
              <option value="">—</option>
              {['Furnished', 'Unfurnished', 'Partially'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          )}
        </div>
        {fieldSet('Available From',
          <Input type="date" {...(register as any)('metadata.available_from')} />
        )}
      </div>
    )
  }

  if (category === 'for-sale') {
    return (
      <div className="space-y-4 rounded-xl bg-green-50/60 border border-green-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#232D4B' }}>Item Details</p>
        {fieldSet('Condition',
          <select className={selectClass} {...(register as any)('metadata.condition')}>
            <option value="">—</option>
            {['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        )}
      </div>
    )
  }

  if (category === 'rideshare') {
    return (
      <div className="space-y-4 rounded-xl bg-yellow-50/60 border border-yellow-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#232D4B' }}>Ride Details</p>
        <div className="grid grid-cols-2 gap-4">
          {fieldSet('Departure Date',
            <Input type="date" {...(register as any)('metadata.departure_date')} />
          )}
          {fieldSet('Seats Available',
            <select className={selectClass} {...(register as any)('metadata.seats_available')}>
              <option value="">—</option>
              {['1', '2', '3', '4', '5+'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {fieldSet('From', <Input placeholder="e.g. Darden School" {...(register as any)('metadata.from_location')} />)}
          {fieldSet('To', <Input placeholder="e.g. IAD Airport" {...(register as any)('metadata.to_location')} />)}
        </div>
      </div>
    )
  }

  if (category === 'events') {
    return (
      <div className="space-y-4 rounded-xl bg-teal-50/60 border border-teal-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#232D4B' }}>Event Details</p>
        <div className="grid grid-cols-2 gap-4">
          {fieldSet('Event Date', <Input type="date" {...(register as any)('metadata.event_date')} />)}
          {fieldSet('Event Time', <Input type="time" {...(register as any)('metadata.event_time')} />)}
        </div>
        {fieldSet('Venue', <Input placeholder="e.g. Flagler Court, Abbott Center" {...(register as any)('metadata.venue')} />)}
      </div>
    )
  }

  if (category === 'lost-found') {
    return (
      <div className="space-y-4 rounded-xl bg-sky-50/60 border border-sky-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#232D4B' }}>Item Details</p>
        <div className="grid grid-cols-2 gap-4">
          {fieldSet('Date Lost / Found', <Input type="date" {...(register as any)('metadata.date_lost')} />)}
          {fieldSet('Last Seen Location', <Input placeholder="e.g. Saunders Hall lobby" {...(register as any)('metadata.item_last_seen')} />)}
        </div>
      </div>
    )
  }

  return null
}

const DESCRIPTION_PROMPTS: Record<string, string> = {
  housing: 'Describe the space — neighbourhood, amenities, transport links, any rules…',
  'for-sale': 'Describe the item — brand, model, age, any defects or accessories included…',
  rideshare: 'Any additional details — pick-up point, luggage space, cost split…',
  events: 'Describe the event — what to expect, dress code, RSVP instructions…',
  community: 'What\'s this about? Share all the relevant details…',
  'lost-found': 'Describe the item in detail — colour, brand, distinguishing marks…',
}

export function ListingForm({ mode, defaultValues, onSubmit }: ListingFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      category: (defaultValues?.category as ListingFormValues['category']) ?? undefined,
      subcategory: defaultValues?.subcategory ?? '',
      price: defaultValues?.price?.toString() ?? '',
      price_label: defaultValues?.price_label ?? '',
      contact_email: defaultValues?.contact_email ?? '',
      location: defaultValues?.location ?? '',
      images: defaultValues?.images ?? [],
      metadata: (defaultValues?.metadata as ListingFormValues['metadata']) ?? {},
    },
  })

  const selectedCategory = watch('category')
  const activeCat = CATEGORIES.find((c) => c.slug === selectedCategory)
  const hidePrice = selectedCategory === 'community' || selectedCategory === 'lost-found'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" placeholder="e.g. 2BR sublet near Darden, May–Aug" {...register('title')} />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>

      {/* Category + Subcategory */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Subcategory</Label>
          <Controller
            name="subcategory"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={!activeCat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {activeCat?.subcategories.map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Category-specific extra fields */}
      {selectedCategory && (
        <CategoryMetaFields category={selectedCategory} register={register} />
      )}

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder={DESCRIPTION_PROMPTS[selectedCategory] ?? 'Describe your listing in detail…'}
          rows={5}
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {/* Price — hidden for community / lost-found */}
      {!hidePrice && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (leave blank if negotiable/free)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input id="price" type="number" min="0" step="0.01" className="pl-6" placeholder="0" {...register('price')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price_label">Price Label</Label>
            <Input
              id="price_label"
              placeholder={selectedCategory === 'housing' ? '/month' : selectedCategory === 'rideshare' ? 'per seat' : 'e.g. OBO, Free'}
              {...register('price_label')}
            />
          </div>
        </div>
      )}

      {/* Contact + Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="contact_email">Contact Email *</Label>
          <Input id="contact_email" type="email" placeholder="abc1@virginia.edu" {...register('contact_email')} />
          {errors.contact_email && <p className="text-sm text-red-600">{errors.contact_email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Images */}
      <div className="space-y-1.5">
        <Label>Photos (optional, up to 5)</Label>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.images && <p className="text-sm text-red-600">{errors.images.message}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === 'create' ? 'Posting…' : 'Saving…'}</>
        ) : (
          mode === 'create' ? 'Post Listing' : 'Save Changes'
        )}
      </Button>
    </form>
  )
}
