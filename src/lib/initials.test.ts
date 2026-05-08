import { describe, it, expect } from 'vitest'
import { computeInitials } from './initials'

describe('computeInitials', () => {
  // ── Cases I'm confident about — locking in current behaviour ──
  it('returns first + last initial for a two-word name', () => {
    expect(computeInitials('Alex Carter', null)).toBe('AC')
  })

  it('returns first letter only for a single-word name', () => {
    expect(computeInitials('Alex', null)).toBe('A')
  })

  it('uppercases lowercase input', () => {
    expect(computeInitials('alex carter', null)).toBe('AC')
  })

  it('falls back to email first-letter when name is null', () => {
    expect(computeInitials(null, 'abc1@virginia.edu')).toBe('A')
  })

  it('falls back to email first-letter when name is an empty string', () => {
    expect(computeInitials('', 'mst3k@virginia.edu')).toBe('M')
  })

  it('falls back to email first-letter when name is whitespace only', () => {
    expect(computeInitials('   ', 'kc4@virginia.edu')).toBe('K')
  })

  it('returns "?" when both name and email are null', () => {
    expect(computeInitials(null, null)).toBe('?')
  })

  it('takes the LAST word for 3+ word names (skips middle names)', () => {
    expect(computeInitials('Alex Bobby Carter', null)).toBe('AC')
  })

  it('handles multiple spaces between words', () => {
    expect(computeInitials('Alex   Carter', null)).toBe('AC')
  })

  // ── TODO for the user — see prompt below ──
  //
  // The following cases have multiple "right" answers depending on UX choices.
  // Pick the behaviour you want and write the assertion. If a case needs the
  // implementation to change, update src/lib/initials.ts to match your choice.
  //
  // 1. Hyphenated last name — "Mary Smith-Jones" should give us:
  //      a) "MS" (first letter of first word + first letter of last word)
  //      b) "MJ" (first letter of first word + first letter of last *segment*)
  //    Pick one and write the test. Currently returns "MS" (option a).

  it.todo('decides how to handle hyphenated last names ("Mary Smith-Jones")')

  // 2. Single emoji name — "🎓 Studious" — should we still show emoji?
  //    Currently returns "🎓" because [0] grabs the codepoint.
  //    a) "🎓" — fun, brand-y
  //    b) "S" — strip non-letters and use the letter portion
  //    Pick one. Option b would require regex sanitisation in initials.ts.

  it.todo('decides how to handle leading emoji or non-letter characters')

  // 3. Single very long name — "Alexander" — should we cap at 1 letter or
  //    take the first 2 letters of the single word ("AL")? Currently returns "A".

  it.todo('decides whether single-word names should be 1 letter or 2')
})
