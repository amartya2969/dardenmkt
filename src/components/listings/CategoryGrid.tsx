import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'
import { Home, Tag, Briefcase, Car, Wrench, Users, Search } from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Tag, Briefcase, Car, Wrench, Users, Search,
}

const CATEGORY_STYLES: Record<string, { bg: string; icon: string; border: string }> = {
  housing:   { bg: '#EEF2FF', icon: '#4F46E5', border: '#C7D2FE' },
  'for-sale': { bg: '#F0FDF4', icon: '#16A34A', border: '#BBF7D0' },
  jobs:       { bg: '#FFF7ED', icon: '#EA580C', border: '#FED7AA' },
  rideshare:  { bg: '#FFFBEB', icon: '#D97706', border: '#FDE68A' },
  services:   { bg: '#FDF4FF', icon: '#9333EA', border: '#E9D5FF' },
  community:  { bg: '#FFF1F2', icon: '#E11D48', border: '#FECDD3' },
  'lost-found': { bg: '#F0F9FF', icon: '#0284C7', border: '#BAE6FD' },
}

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon] ?? Tag
        const style = CATEGORY_STYLES[cat.slug] ?? { bg: '#F8F7F4', icon: '#232D4B', border: '#e2e0db' }
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2.5 p-4 rounded-xl border bg-white hover:shadow-md transition-all group hover:-translate-y-0.5"
            style={{ borderColor: style.border }}
          >
            <div
              className="p-3 rounded-xl group-hover:scale-110 transition-transform"
              style={{ backgroundColor: style.bg }}
            >
              <Icon className="h-5 w-5" style={{ color: style.icon }} />
            </div>
            <span className="text-xs font-semibold text-center leading-tight" style={{ color: '#232D4B' }}>
              {cat.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
