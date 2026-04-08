import { z } from 'zod'
import { CATEGORIES, LOCATIONS } from './constants'

const categorySlugs = CATEGORIES.map((c) => c.slug) as [string, ...string[]]

export const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  category: z.enum(categorySlugs, { error: 'Please select a category' }),
  subcategory: z.string().optional(),
  price: z.string().optional(),
  price_label: z.string().optional(),
  contact_email: z.string().email('Invalid email').endsWith('@virginia.edu', 'Must be a @virginia.edu email'),
  location: z.string().optional(),
  images: z.array(z.string()).max(5, 'Maximum 5 images'),
})

export type ListingFormValues = z.infer<typeof listingSchema>

export const teamSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(3000),
  type: z.enum(['case_competition', 'startup', 'project', 'study_group', 'research', 'other'], { error: 'Please select a type' }),
  skills_needed: z.array(z.string()).max(10).optional(),
  spots_available: z.number().min(1).max(20),
  deadline: z.string().optional(),
  contact_email: z.string().email('Invalid email').endsWith('@virginia.edu', 'Must be a @virginia.edu email'),
})

export type TeamFormValues = z.infer<typeof teamSchema>

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .endsWith('@virginia.edu', 'Must be a @virginia.edu email address'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
