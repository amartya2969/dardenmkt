import { describe, it, expect } from 'vitest'
import { computeInitials } from './initials'

describe('computeInitials', () => {
  // ── Multi-word names ──
  it('returns first + last initial for a two-word name', () => {
    expect(computeInitials('Alex Carter', null)).toBe('AC')
  })

  it('uppercases lowercase input', () => {
    expect(computeInitials('alex carter', null)).toBe('AC')
  })

  it('takes the LAST word for 3+ word names (skips middle names)', () => {
    expect(computeInitials('Alex Bobby Carter', null)).toBe('AC')
  })

  it('handles multiple spaces between words', () => {
    expect(computeInitials('Alex   Carter', null)).toBe('AC')
  })

  it('takes the first letter of the *whole* hyphenated last word ("MS" not "MJ")', () => {
    // Industry-standard avatar behaviour (Slack, Gmail, Discord): hyphenated
    // last names are treated as a single word.
    expect(computeInitials('Mary Smith-Jones', null)).toBe('MS')
  })

  // ── Single-word names ──
  it('takes the first 2 letters for a single-word name (visual balance with 2-word avatars)', () => {
    expect(computeInitials('Alex', null)).toBe('AL')
  })

  it('returns the only available letter for a 1-letter name', () => {
    expect(computeInitials('X', null)).toBe('X')
  })

  // ── Emoji / non-letter handling ──
  it('skips a leading emoji and falls through to the next letter', () => {
    expect(computeInitials('🎓 Studious', null)).toBe('S')
  })

  it('skips a trailing emoji on the last word', () => {
    expect(computeInitials('Alex 🎓', null)).toBe('A')
  })

  it('skips numbers/symbols when computing initials', () => {
    expect(computeInitials('1Alex 2Carter', null)).toBe('AC')
  })

  // ── Email fallback ──
  it('falls back to email first-letter when name is null', () => {
    expect(computeInitials(null, 'abc1@virginia.edu')).toBe('A')
  })

  it('falls back to email first-letter when name is an empty string', () => {
    expect(computeInitials('', 'mst3k@virginia.edu')).toBe('M')
  })

  it('falls back to email first-letter when name is whitespace only', () => {
    expect(computeInitials('   ', 'kc4@virginia.edu')).toBe('K')
  })

  it('falls back to email first-letter when name is pure-symbol', () => {
    expect(computeInitials('🎓🚀', 'abc1@virginia.edu')).toBe('A')
  })

  // ── Last resort ──
  it('returns "?" when both name and email are null', () => {
    expect(computeInitials(null, null)).toBe('?')
  })

  it('returns "?" when name has no letters AND email is null', () => {
    expect(computeInitials('🎓 🚀', null)).toBe('?')
  })

  // ── Locale awareness (free benefit of \p{L}) ──
  it('handles accented Latin letters', () => {
    expect(computeInitials('Émilie Dupré', null)).toBe('ÉD')
  })

  it('handles non-Latin scripts (Cyrillic)', () => {
    expect(computeInitials('Анна Иванова', null)).toBe('АИ')
  })
})
