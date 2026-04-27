export type ListingStatus = 'active' | 'sold' | 'expired' | 'removed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  school: string | null
  year: string | null
  phone: string | null
  bio: string | null
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  price: number | null
  price_label: string | null
  category: string
  subcategory: string | null
  images: string[]
  contact_email: string
  location: string | null
  metadata: Record<string, string> | null
  status: ListingStatus
  is_featured: boolean
  created_at: string
  updated_at: string
  expires_at: string | null
  profiles?: Pick<Profile, 'full_name' | 'email'>
}

export interface Category {
  slug: string
  label: string
  icon: string
  subcategories: string[]
  color: string
}

export type TeamType = 'case_competition' | 'startup' | 'project' | 'study_group' | 'research' | 'other'
export type TeamStatus = 'active' | 'filled' | 'closed'

export interface Team {
  id: string
  user_id: string
  title: string
  description: string
  type: TeamType
  skills_needed: string[]
  spots_available: number
  deadline: string | null
  contact_email: string
  status: TeamStatus
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'full_name' | 'email'>
}

export type ConversationStatus = 'pending' | 'accepted' | 'blocked' | 'reported'

export interface Conversation {
  id: string
  listing_id: string
  initiator_id: string
  responder_id: string
  status: ConversationStatus
  created_at: string
  expires_at: string
  listing?: { id: string; title: string; images: string[] }
  initiator?: { full_name: string | null; email: string }
  responder?: { full_name: string | null; email: string }
  messages?: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export interface ListingFilters {
  q?: string
  category?: string
  subcategory?: string
  min_price?: string
  max_price?: string
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
}
