/**
 * Derive a 1–2 letter avatar fallback from a display name, falling back to the
 * first letter of an email when no name is set.
 *
 * Behaviour (locked in by initials.test.ts):
 *   "Alex Carter"        → "AC"   first + last word's first letter
 *   "Alex"               → "AL"   single-word names take the first 2 letters
 *   "alex carter"        → "AC"   uppercases
 *   "Mary Smith-Jones"   → "MS"   takes first letter of the *whole* last word
 *   "Alex Bobby Carter"  → "AC"   middle words ignored
 *   "🎓 Studious"        → "S"    leading emoji/symbols are skipped per word
 *   ""    + "abc1@…"     → "A"    falls through to email
 *   null  + null         → "?"    last-resort placeholder
 *
 * Uses `\p{L}` (Unicode letter category) so the function is locale-agnostic
 * — works for accented Latin, Cyrillic, Greek, CJK, etc.
 */

// First letter character anywhere in the word (skips emoji, digits, punctuation).
function firstLetter(word: string): string {
  return word.match(/\p{L}/u)?.[0]?.toUpperCase() ?? ''
}

export function computeInitials(
  name: string | null | undefined,
  emailFallback: string | null | undefined,
): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/)

    if (parts.length >= 2) {
      // Multi-word: first letter of first word + first letter of last word.
      const result = firstLetter(parts[0]) + firstLetter(parts[parts.length - 1])
      if (result) return result
      // Pure-symbol names ("🎓 🚀") fall through to the email fallback below.
    } else {
      // Single word: take the first two LETTER characters for visual balance
      // with two-word avatars. Skips any leading symbols/emoji.
      const letters = parts[0].match(/\p{L}/gu) ?? []
      const result = letters.slice(0, 2).join('').toUpperCase()
      if (result) return result
    }
  }
  return (emailFallback?.[0] ?? '?').toUpperCase()
}
