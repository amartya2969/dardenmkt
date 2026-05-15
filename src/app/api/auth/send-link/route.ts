import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { isAllowedUvaEmail } from '@/lib/email-domain'

/**
 * Server-side magic-link / recovery-link sender.
 *
 * Why this exists (vs. supabase.auth.signInWithOtp / resetPasswordForEmail):
 * Microsoft Defender's Safe Links pre-fetches every URL in an email. The
 * client-side PKCE flow points users at supabase.co/auth/v1/verify, which
 * burns its single-use token on the FIRST GET — so by the time the human
 * clicks, the token is gone and they see "Email link is invalid or has
 * expired."
 *
 * Fix: call admin.generateLink to get a `token_hash`, host the verification
 * URL on our own domain (/auth/verify), and require an explicit click
 * (POST-like action via JS) before calling verifyOtp. Safe Links' GET
 * preview doesn't trigger the verify, so the token survives to the human.
 */

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL ?? 'UVMkt <noreply@uvdardenmkt.com>'
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.uvdardenmkt.com'

type Mode = 'signup' | 'recovery'

export async function POST(request: Request) {
  let body: { email?: string; mode?: Mode }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase() ?? ''
  const mode: Mode = body.mode === 'signup' ? 'signup' : 'recovery'

  if (!email || !isAllowedUvaEmail(email)) {
    return NextResponse.json(
      { error: 'A valid @virginia.edu or @darden.virginia.edu email is required.' },
      { status: 400 }
    )
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error('[send-link] missing SUPABASE env vars')
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
  }
  if (!resend) {
    console.error('[send-link] RESEND_API_KEY not set')
    return NextResponse.json({ error: 'Email service unavailable.' }, { status: 500 })
  }

  // type=invite creates the user (without password) and is the right flow when
  // we plan to collect the password on /auth/set-password after they click.
  // type=recovery is for existing users who forgot their password.
  const linkType: 'invite' | 'recovery' = mode === 'signup' ? 'invite' : 'recovery'

  const genRes = await fetch(`${url}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: linkType, email }),
  })

  if (!genRes.ok) {
    const errText = await genRes.text()
    console.error('[send-link] generate_link failed:', genRes.status, errText)

    // Friendly errors for the common cases.
    if (mode === 'signup' && errText.includes('already been registered')) {
      return NextResponse.json(
        { error: 'account_exists', message: 'Account already exists — please sign in.' },
        { status: 200 }
      )
    }
    if (mode === 'recovery' && (genRes.status === 422 || errText.includes('not found'))) {
      // Don't leak existence — pretend success.
      return NextResponse.json({ ok: true, sentNoOp: true }, { status: 200 })
    }
    return NextResponse.json({ error: 'Could not generate link.' }, { status: 500 })
  }

  const data = (await genRes.json()) as {
    properties?: { hashed_token?: string }; hashed_token?: string
  }
  const tokenHash = data.properties?.hashed_token ?? data.hashed_token
  if (!tokenHash) {
    console.error('[send-link] no hashed_token in response:', data)
    return NextResponse.json({ error: 'No token returned.' }, { status: 500 })
  }

  // The interstitial page reads these and only burns the token on user click.
  const next =
    mode === 'signup' ? '/auth/set-password?mode=signup' : '/auth/set-password?mode=reset'
  const verifyUrl =
    `${SITE}/auth/verify` +
    `?token_hash=${encodeURIComponent(tokenHash)}` +
    `&type=${linkType}` +
    `&next=${encodeURIComponent(next)}`

  const subject =
    mode === 'signup' ? 'Confirm your UVMkt account' : 'Reset your UVMkt password'
  const heading = mode === 'signup' ? 'Welcome to UVMkt' : 'Reset your password'
  const intro =
    mode === 'signup'
      ? 'Click the button below to confirm your email and finish creating your UVMkt account.'
      : 'Click the button below to choose a new password for your UVMkt account.'
  const cta = mode === 'signup' ? 'Confirm Email' : 'Reset Password'

  // Plain-text alternative helps Defender's heuristics (HTML-only mail is
  // mildly penalised). Keep both in sync.
  const text = [
    heading,
    '',
    intro,
    '',
    `${cta}: ${verifyUrl}`,
    '',
    'This link expires in 1 hour. If you didn\'t request this, you can ignore the email.',
    '',
    '— UVMkt',
  ].join('\n')

  const html = `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:24px">
      <div style="background:#232D4B;padding:20px 24px;border-radius:12px 12px 0 0">
        <span style="color:#fff;font-weight:800;font-size:20px">UV<span style="color:#E57200">Mkt</span></span>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;color:#374151">
        <h2 style="margin:0 0 12px;color:#232D4B">${heading}</h2>
        <p style="margin:0 0 20px;line-height:1.5">${intro}</p>
        <p style="margin:0 0 24px">
          <a href="${verifyUrl}"
             style="display:inline-block;background:#E57200;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            ${cta}
          </a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280">
          Or copy this link into your browser:
        </p>
        <p style="margin:0 0 20px;font-size:12px;color:#9ca3af;word-break:break-all">${verifyUrl}</p>
        <p style="margin:0;font-size:12px;color:#9ca3af">
          This link expires in 1 hour. If you didn't request this, you can ignore the email.
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">
          <a href="${SITE}" style="color:#9ca3af">UVMkt</a> · UVA student marketplace
        </p>
      </div>
    </div>`

  try {
    await resend.emails.send({ from: FROM, to: email, subject, html, text })
  } catch (err) {
    console.error('[send-link] resend failed:', err)
    return NextResponse.json({ error: 'Could not send email.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
