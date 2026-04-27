import type { Category } from '@/types'

export const CATEGORIES: Category[] = [
  {
    slug: 'housing',
    label: 'Housing',
    icon: 'Home',
    color: 'bg-blue-100 text-blue-700',
    subcategories: ['Sublet', 'Roommate Wanted', 'Apartment', 'House', 'Short-term', 'Other'],
  },
  {
    slug: 'for-sale',
    label: 'For Sale',
    icon: 'Tag',
    color: 'bg-green-100 text-green-700',
    subcategories: ['Furniture', 'Electronics', 'Books & Supplies', 'Clothing', 'Vehicles', 'Sports & Outdoors', 'Other'],
  },
  {
    slug: 'rideshare',
    label: 'Rideshare',
    icon: 'Car',
    color: 'bg-yellow-100 text-yellow-700',
    subcategories: ['Airport (CHO/IAD/DCA/RIC)', 'DC / Northern VA', 'Richmond', 'NYC', 'Other'],
  },
  {
    slug: 'community',
    label: 'Community',
    icon: 'Users',
    color: 'bg-pink-100 text-pink-700',
    subcategories: ['Events', 'Groups & Clubs', 'Announcements', 'Free Stuff', 'Volunteering', 'Other'],
  },
  {
    slug: 'events',
    label: 'Events',
    icon: 'CalendarDays',
    color: 'bg-teal-100 text-teal-700',
    subcategories: ['Social', 'Networking', 'Academic', 'Sports', 'Career', 'Other'],
  },
  {
    slug: 'lost-found',
    label: 'Lost & Found',
    icon: 'Search',
    color: 'bg-sky-100 text-sky-700',
    subcategories: ['Lost', 'Found'],
  },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c])
)

export const LOCATIONS = [
  'Charlottesville',
  'Near Darden',
  'Near UVA Grounds',
  'Belmont',
  'Downtown Mall',
  'Pantops',
  'Crozet',
  'Remote / Online',
  'Other',
]

export const TEAM_TYPES = [
  { value: 'case_competition', label: 'Case Competition', emoji: '🏆', color: '#7C3AED', bg: '#F5F3FF' },
  { value: 'startup',         label: 'Startup / Venture', emoji: '🚀', color: '#0284C7', bg: '#F0F9FF' },
  { value: 'project',         label: 'Class Project',     emoji: '📚', color: '#16A34A', bg: '#F0FDF4' },
  { value: 'study_group',     label: 'Study Group',       emoji: '📖', color: '#D97706', bg: '#FFFBEB' },
  { value: 'research',        label: 'Research',          emoji: '🔬', color: '#0891B2', bg: '#ECFEFF' },
  { value: 'other',           label: 'Other',             emoji: '💡', color: '#E57200', bg: '#FFF7ED' },
] as const

export const TEAM_TYPE_MAP = Object.fromEntries(TEAM_TYPES.map((t) => [t.value, t]))

export const SKILLS_OPTIONS = [
  'Finance', 'Strategy', 'Marketing', 'Operations', 'Technology',
  'Data Analytics', 'Product Management', 'Consulting', 'Entrepreneurship',
  'Private Equity', 'Investment Banking', 'Healthcare', 'Real Estate',
  'Supply Chain', 'Leadership', 'Design', 'Business Development',
  'Sales', 'International Business', 'Sustainability', 'AI/ML',
]

export const SITE_NAME = 'DardenMkt'
export const SITE_DESCRIPTION = 'The UVA & Darden student marketplace — housing, for sale, rideshares, team matching, and more.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
