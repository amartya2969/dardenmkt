'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { listingSchema, type ListingFormValues } from '@/lib/validations'
import { CATEGORIES, LOCATIONS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploader } from './ImageUploader'
import { Loader2 } from 'lucide-react'
import type { Listing } from '@/types'

interface ListingFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<Listing>
  onSubmit: (values: ListingFormValues) => Promise<void>
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
    },
  })

  const selectedCategory = watch('category')
  const activeCat = CATEGORIES.find((c) => c.slug === selectedCategory)

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

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe your listing in detail…"
          rows={5}
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {/* Price */}
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
          <Input id="price_label" placeholder="e.g. /month, OBO, Free" {...register('price_label')} />
        </div>
      </div>

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
