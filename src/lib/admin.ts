/**
 * Tiny admin authentication helper.
 *
 * Admin status is gated by an env var (ADMIN_EMAILS, comma-separated) rather
 * than a DB column or role. Keeps the bar low for a single-admin app while
 * still being safe — every privileged API route imports isAdminEmail and
 * checks the *current* session's email server-side.
 */

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminEmails().includes(email.toLowerCase())
}
