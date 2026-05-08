import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { formatPrice, formatRelativeTime, truncate, cn } from './utils'

describe('formatPrice', () => {
  it('formats a whole-number USD amount with no label', () => {
    expect(formatPrice(500, null)).toBe('$500')
  })

  it('appends the label after the formatted amount', () => {
    expect(formatPrice(500, '/month')).toBe('$500 /month')
  })

  it('drops decimal places (maximumFractionDigits: 0)', () => {
    expect(formatPrice(499.95, null)).toBe('$500')
  })

  it('returns the label when price is null', () => {
    expect(formatPrice(null, 'Free')).toBe('Free')
  })

  it('returns "Contact for price" when both price and label are null/empty', () => {
    expect(formatPrice(null, null)).toBe('Contact for price')
  })

  it('handles zero as a real price (not null)', () => {
    expect(formatPrice(0, 'OBO')).toBe('$0 OBO')
  })
})

describe('formatRelativeTime', () => {
  // Freeze "now" so the relative diffs are deterministic.
  const NOW = new Date('2026-05-08T12:00:00Z')

  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for sub-minute deltas', () => {
    const t = new Date(NOW.getTime() - 30_000).toISOString() // 30s ago
    expect(formatRelativeTime(t)).toBe('just now')
  })

  it('returns minutes for sub-hour deltas', () => {
    const t = new Date(NOW.getTime() - 5 * 60_000).toISOString()
    expect(formatRelativeTime(t)).toBe('5m ago')
  })

  it('returns hours for sub-day deltas', () => {
    const t = new Date(NOW.getTime() - 3 * 60 * 60_000).toISOString()
    expect(formatRelativeTime(t)).toBe('3h ago')
  })

  it('returns days for sub-week deltas', () => {
    const t = new Date(NOW.getTime() - 4 * 24 * 60 * 60_000).toISOString()
    expect(formatRelativeTime(t)).toBe('4d ago')
  })

  it('falls back to a localised short date past one week', () => {
    const t = new Date(NOW.getTime() - 30 * 24 * 60 * 60_000).toISOString()
    // We don't lock the exact format because locales differ — just assert
    // it's not one of the relative-time strings.
    const result = formatRelativeTime(t)
    expect(result).not.toMatch(/just now|m ago|h ago|d ago/)
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('truncate', () => {
  it('returns the string unchanged if shorter than the limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates and appends an ellipsis if longer', () => {
    expect(truncate('hello world', 5)).toBe('hello…')
  })

  it('treats equal-length strings as not needing truncation', () => {
    expect(truncate('exact', 5)).toBe('exact')
  })
})

describe('cn (class merger)', () => {
  it('merges plain class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c')
  })

  it('lets later Tailwind utilities win conflicts', () => {
    // tailwind-merge collapses competing classes — the last one should win.
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})
