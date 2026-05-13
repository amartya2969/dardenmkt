/**
 * Allowed email domains for UVMkt sign-up / sign-in / contact fields.
 *
 * Accepts:
 *   - @virginia.edu          (university-wide UVA email)
 *   - @darden.virginia.edu   (Darden-specific email, e.g. VatsA27@darden.virginia.edu)
 *
 * Centralised here so every form, server route, and Zod schema agrees on the
 * exact rule. Case-insensitive — UVA's mail system accepts mixed-case
 * usernames but normalises to lowercase, so we compare lowercase too.
 */
export const ALLOWED_EMAIL_SUFFIXES = ['@virginia.edu', '@darden.virginia.edu'] as const

export function isAllowedUvaEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const lower = email.toLowerCase().trim()
  return ALLOWED_EMAIL_SUFFIXES.some((s) => lower.endsWith(s))
}

// Human-readable hint shown alongside form fields and error messages.
export const ALLOWED_EMAIL_HINT = '@virginia.edu or @darden.virginia.edu'
