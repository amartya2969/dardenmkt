import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/constants'
import { Home, Tag, Briefcase, Car, Wrench, Users, Search, CalendarDays } from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Tag, Briefcase, Car, Wrench, Users, Search, CalendarDays,
}

const CATEGORY_STYLES: Record<string, { bg: string; icon: string; border: string }> = {
  housing:    { bg: '#EEF2FF', icon: '#4F46E5', border: '#C7D2FE' },
  'for-sale': { bg: '#F0FDF4', icon: '#16A34A', border: '#BBF7D0' },
  jobs:       { bg: '#FFF7ED', icon: '#EA580C', border: '#FED7AA' },
  rideshare:  { bg: '#FFFBEB', icon: '#D97706', border: '#FDE68A' },
  services:   { bg: '#FDF4FF', icon: '#9333EA', border: '#E9D5FF' },
  community:  { bg: '#FFF1F2', icon: '#E11D48', border: '#FECDD3' },
  events:     { bg: '#F0FDFA', icon: '#0D9488', border: '#99F6E4' },
  'lost-found': { bg: '#F0F9FF', icon: '#0284C7', border: '#BAE6FD' },
}

export async function CategoryGrid() {
  const supabase = await createClient()
  const { data: counts } = await supabase
    .from('listings')
    .select('category')
    .eq('status', 'active')

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    countMap[row.category] = (countMap[row.category] ?? 0) + 1
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon] ?? Tag
        const style = CATEGORY_STYLES[cat.slug] ?? { bg: '#F8F7F4', icon: '#232D4B', border: '#e2e0db' }
        const count = countMap[cat.slug] ?? 0
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border bg-white hover:shadow-md transition-all group hover:-translate-y-0.5 duration-200"
            style={{ borderColor: style.border }}
          >
            <div
              className="p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-200"
              style={{ backgroundColor: style.bg }}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: style.icon }} />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight" style={{ color: '#232D4B' }}>
              {cat.label}
            </span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium -mt-1">
              {count > 0 ? `${count} listing${count === 1 ? '' : 's'}` : 'Be first!'}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
