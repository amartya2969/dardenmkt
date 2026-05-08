/**
 * Derive a 1–2 letter avatar fallback from a display name, falling back to the
 * first letter of an email when no name is set.
 *
 * Examples:
 *   "Alex Carter"      → "AC"
 *   "Alex"             → "A"
 *   "alex carter okoh" → "AO"  (first + last word's first letter)
 *   ""  + "abc1@…"     → "A"
 *   null + null        → "?"
 */
export function computeInitials(
  name: string | null | undefined,
  emailFallback: string | null | undefined,
): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }
  return (emailFallback?.[0] ?? '?').toUpperCase()
}
