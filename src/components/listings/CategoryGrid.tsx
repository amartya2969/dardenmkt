import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/utils'
import { Home, Tag, Car, Users, Search, CalendarDays } from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  Home, Tag, Car, Users, Search, CalendarDays,
}

const CATEGORY_STYLES: Record<string, { bg: string; icon: string; border: string; hover: string }> = {
  housing:      { bg: '#EEF2FF', icon: '#4F46E5', border: '#C7D2FE', hover: '#E0E7FF' },
  'for-sale':   { bg: '#F0FDF4', icon: '#16A34A', border: '#BBF7D0', hover: '#DCFCE7' },
  rideshare:    { bg: '#FFFBEB', icon: '#D97706', border: '#FDE68A', hover: '#FEF3C7' },
  community:    { bg: '#FFF1F2', icon: '#E11D48', border: '#FECDD3', hover: '#FFE4E6' },
  events:       { bg: '#F0FDFA', icon: '#0D9488', border: '#99F6E4', hover: '#CCFBF1' },
  'lost-found': { bg: '#F0F9FF', icon: '#0284C7', border: '#BAE6FD', hover: '#E0F2FE' },
}

export async function CategoryGrid() {
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('listings')
    .select('category, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const countMap: Record<string, number> = {}
  const latestMap: Record<string, string> = {}
  for (const row of rows ?? []) {
    countMap[row.category] = (countMap[row.category] ?? 0) + 1
    if (!latestMap[row.category]) latestMap[row.category] = row.created_at
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
      {CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon] ?? Tag
        const style = CATEGORY_STYLES[cat.slug] ?? { bg: '#F8F7F4', icon: '#232D4B', border: '#e2e0db', hover: '#eeede9' }
        const count = countMap[cat.slug] ?? 0
        const latest = latestMap[cat.slug]
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2.5 p-3 sm:p-4 rounded-2xl border bg-white transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-lg"
            style={{ borderColor: style.border }}
          >
            <div
              className="p-2.5 sm:p-3 rounded-xl transition-all duration-200 group-hover:scale-110"
              style={{ backgroundColor: style.bg }}
            >
              <Icon className="h-5 w-5 sm:h-5 sm:w-5" style={{ color: style.icon }} />
            </div>
            <div className="text-center w-full">
              <div className="text-[10px] sm:text-[11px] font-bold leading-tight" style={{ color: '#232D4B' }}>
                {cat.label}
              </div>
              <div className="text-[9px] sm:text-[10px] mt-0.5 font-medium" style={{ color: count > 0 ? style.icon : '#9ca3af' }}>
                {count > 0 ? `${count} active` : '—'}
              </div>
              {latest && (
                <div className="text-[9px] mt-0.5 text-gray-400 font-medium truncate">
                  Latest: {formatRelativeTime(latest)}
                </div>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
