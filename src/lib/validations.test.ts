import { describe, it, expect } from 'vitest'
import { listingSchema, teamSchema, loginSchema } from './validations'

const baseListing = {
  title: 'A clean studio sublet near Grounds',
  description: 'Five-block walk to UVA, May–August lease.',
  category: 'housing' as const,
  contact_email: 'abc1@virginia.edu',
  images: [],
}

describe('listingSchema', () => {
  it('accepts a minimal valid listing', () => {
    const result = listingSchema.safeParse(baseListing)
    expect(result.success).toBe(true)
  })

  it('rejects a title shorter than 5 chars', () => {
    const result = listingSchema.safeParse({ ...baseListing, title: 'hi' })
    expect(result.success).toBe(false)
  })

  it('rejects a description shorter than 10 chars', () => {
    const result = listingSchema.safeParse({ ...baseListing, description: 'too short' })
    expect(result.success).toBe(false)
  })

  it('rejects non-virginia.edu emails', () => {
    const result = listingSchema.safeParse({ ...baseListing, contact_email: 'me@gmail.com' })
    expect(result.success).toBe(false)
    // The error should specifically call out the @virginia.edu rule.
    const msgs = result.success ? [] : result.error.issues.map(i => i.message).join(' ')
    expect(msgs).toMatch(/virginia\.edu/i)
  })

  it('rejects an unknown category slug (jobs/services were removed)', () => {
    const result = listingSchema.safeParse({ ...baseListing, category: 'jobs' })
    expect(result.success).toBe(false)
  })

  it('rejects more than 5 images', () => {
    const result = listingSchema.safeParse({
      ...baseListing,
      images: ['a', 'b', 'c', 'd', 'e', 'f'],
    })
    expect(result.success).toBe(false)
  })

  it('accepts metadata for housing fields', () => {
    const result = listingSchema.safeParse({
      ...baseListing,
      metadata: {
        bedrooms: '2',
        bathrooms: '1.5',
        furnished: 'Furnished',
        available_from: '2026-06-01',
      },
    })
    expect(result.success).toBe(true)
  })

  it('accepts metadata for rideshare fields', () => {
    const result = listingSchema.safeParse({
      ...baseListing,
      category: 'rideshare',
      metadata: {
        departure_date: '2026-05-15',
        from_location: 'Darden School',
        to_location: 'IAD Airport',
        seats_available: '3',
      },
    })
    expect(result.success).toBe(true)
  })

  it('accepts metadata as an empty object', () => {
    const result = listingSchema.safeParse({ ...baseListing, metadata: {} })
    expect(result.success).toBe(true)
  })
})

describe('teamSchema', () => {
  const baseTeam = {
    title: 'Looking for two case-comp teammates',
    description: 'Industry pick: healthcare. Submission due in 3 weeks.',
    type: 'case_competition' as const,
    spots_available: 2,
    contact_email: 'abc1@virginia.edu',
  }

  it('accepts a minimal valid team post', () => {
    expect(teamSchema.safeParse(baseTeam).success).toBe(true)
  })

  it('rejects 0 or negative spots', () => {
    expect(teamSchema.safeParse({ ...baseTeam, spots_available: 0 }).success).toBe(false)
    expect(teamSchema.safeParse({ ...baseTeam, spots_available: -1 }).success).toBe(false)
  })

  it('rejects more than 20 spots', () => {
    expect(teamSchema.safeParse({ ...baseTeam, spots_available: 21 }).success).toBe(false)
  })

  it('rejects unknown team types', () => {
    expect(teamSchema.safeParse({ ...baseTeam, type: 'hackathon' }).success).toBe(false)
  })

  it('caps skills_needed at 10 entries', () => {
    expect(teamSchema.safeParse({
      ...baseTeam,
      skills_needed: Array.from({ length: 11 }, (_, i) => `s${i}`),
    }).success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('rejects non-virginia.edu emails', () => {
    expect(loginSchema.safeParse({ email: 'me@gmail.com' }).success).toBe(false)
  })

  it('rejects malformed addresses', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })

  it('accepts a valid @virginia.edu email', () => {
    expect(loginSchema.safeParse({ email: 'mst3k@virginia.edu' }).success).toBe(true)
  })
})
