import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL ?? 'UVMkt <onboarding@resend.dev>'
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://uvmkt.vercel.app'

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping')
    return
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('[email] send failed:', err)
  }
}

export function contactEmailHtml({
  listingTitle, message, senderEmail, listingUrl,
}: { listingTitle: string; message: string; senderEmail: string; listingUrl: string }) {
  return `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:24px">
      <div style="background:#232D4B;padding:20px 24px;border-radius:12px 12px 0 0">
        <span style="color:#fff;font-weight:800;font-size:20px">UV<span style="color:#E57200">Mkt</span></span>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px">
        <h2 style="margin:0 0 8px;color:#232D4B">New message about your listing</h2>
        <p style="margin:0 0 20px;color:#6b7280;font-size:14px">
          Someone is interested in: <strong>${listingTitle}</strong>
        </p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px">
          <p style="margin:0;color:#374151;white-space:pre-wrap;font-size:14px">${message}</p>
        </div>
        <p style="margin:0 0 16px;font-size:14px;color:#374151">
          Reply directly to: <a href="mailto:${senderEmail}" style="color:#E57200">${senderEmail}</a>
        </p>
        <a href="${listingUrl}" style="display:inline-block;background:#232D4B;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          View Listing
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">
          Sent via <a href="${SITE}" style="color:#9ca3af">UVMkt</a> · @virginia.edu marketplace
        </p>
      </div>
    </div>`
}

export function expiryEmailHtml({
  listingTitle, listingUrl, daysLeft,
}: { listingTitle: string; listingUrl: string; daysLeft: number }) {
  return `
    <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:24px">
      <div style="background:#232D4B;padding:20px 24px;border-radius:12px 12px 0 0">
        <span style="color:#fff;font-weight:800;font-size:20px">UV<span style="color:#E57200">Mkt</span></span>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px">
        <h2 style="margin:0 0 8px;color:#232D4B">⏰ Your listing expires in ${daysLeft} days</h2>
        <p style="margin:0 0 20px;color:#6b7280;font-size:14px">
          <strong>${listingTitle}</strong> will be removed from UVMkt soon.
        </p>
        <a href="${listingUrl}" style="display:inline-block;background:#E57200;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          View &amp; Renew Listing
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">
          <a href="${SITE}" style="color:#9ca3af">UVMkt</a> · @virginia.edu marketplace
        </p>
      </div>
    </div>`
}
