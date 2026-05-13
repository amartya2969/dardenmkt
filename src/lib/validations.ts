import { z } from 'zod'
import { CATEGORIES, LOCATIONS } from './constants'
import { isAllowedUvaEmail, ALLOWED_EMAIL_HINT } from './email-domain'

const categorySlugs = CATEGORIES.map((c) => c.slug) as [string, ...string[]]

// Re-usable Zod email validator that accepts both @virginia.edu and
// @darden.virginia.edu. .endsWith() can't express OR, so use .refine().
const uvaEmail = z
  .string()
  .email('Invalid email')
  .refine(isAllowedUvaEmail, { message: `Must be a ${ALLOWED_EMAIL_HINT} email` })

export const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  category: z.enum(categorySlugs, { error: 'Please select a category' }),
  subcategory: z.string().optional(),
  price: z.string().optional(),
  price_label: z.string().optional(),
  contact_email: uvaEmail,
  location: z.string().optional(),
  images: z.array(z.string()).max(5, 'Maximum 5 images'),
  metadata: z.object({
    // Housing
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    furnished: z.string().optional(),
    available_from: z.string().optional(),
    // For Sale
    condition: z.string().optional(),
    // Rideshare
    departure_date: z.string().optional(),
    from_location: z.string().optional(),
    to_location: z.string().optional(),
    seats_available: z.string().optional(),
    // Events
    event_date: z.string().optional(),
    event_time: z.string().optional(),
    venue: z.string().optional(),
    // Lost & Found
    date_lost: z.string().optional(),
    item_last_seen: z.string().optional(),
  }).optional(),
})

export type ListingFormValues = z.infer<typeof listingSchema>

export const teamSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(3000),
  type: z.enum(['case_competition', 'startup', 'project', 'study_group', 'research', 'other'], { error: 'Please select a type' }),
  skills_needed: z.array(z.string()).max(10).optional(),
  spots_available: z.number().min(1).max(20),
  deadline: z.string().optional(),
  contact_email: uvaEmail,
})

export type TeamFormValues = z.infer<typeof teamSchema>

export const loginSchema = z.object({
  email: uvaEmail,
})

export type LoginFormValues = z.infer<typeof loginSchema>
