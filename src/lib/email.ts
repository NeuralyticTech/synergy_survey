import 'server-only'
import { Resend } from 'resend'
import { BRANDS, type CompanyId, getBrand } from './brand'

function baseUrl(): string {
  const explicit = process.env.APP_URL
  if (explicit) return explicit.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

function client(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set.')
  return new Resend(key)
}

/**
 * With no mail provider configured locally, print the link and code to the
 * server console instead of failing. Production always requires a real key.
 */
function devDeliver(label: string, to: string, link: string, code: string): boolean {
  if (process.env.RESEND_API_KEY || process.env.NODE_ENV === 'production') return false
  console.warn(
    [
      '',
      `[dev] RESEND_API_KEY not set — ${label} not emailed. Use one of these:`,
      `      to:   ${to}`,
      `      link: ${link}`,
      `      code: ${code}`,
      '',
    ].join('\n'),
  )
  return true
}

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? 'Staff Check-in <onboarding@resend.dev>'
}

interface Palette {
  navy: string
  orange: string
}

function shell(palette: Palette, heading: string, body: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(16,24,40,.08);">
    <tr><td style="height:5px;background:${palette.orange};"></td></tr>
    <tr><td style="padding:32px 32px 8px;">
      <h1 style="margin:0 0 16px;font-size:21px;line-height:1.3;color:${palette.navy};">${heading}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:20px 32px 30px;">
      <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
        If you weren't expecting this email you can safely ignore it — no one can access the survey without this link.
      </p>
    </td></tr>
  </table>
</body></html>`
}

function button(url: string, label: string, palette: Palette): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="border-radius:8px;background:${palette.orange};">
      <a href="${url}" style="display:inline-block;padding:13px 26px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">${label}</a>
    </td></tr>
  </table>`
}

function codeBlock(code: string, palette: Palette): string {
  return `<p style="margin:0 0 8px;font-size:14px;color:#475569;">Or enter this code on the sign-in page:</p>
    <p style="margin:0 0 4px;font-size:30px;font-weight:700;letter-spacing:7px;color:${palette.navy};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${code}</p>`
}

export async function sendSurveyVerification(opts: {
  email: string
  company: CompanyId
  token: string
  code: string
  expiresAt: Date
}) {
  const brand = getBrand(opts.company)
  const palette = { navy: brand.colors.navy, orange: brand.colors.orange }
  const link = `${baseUrl()}/verify?token=${encodeURIComponent(opts.token)}`
  const expires = opts.expiresAt.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (devDeliver('survey verification', opts.email, link, opts.code)) return

  const body = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
      Hi — thanks for taking the time to fill in the Staff 360 Survey.
    </p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
      Confirm your email address to open the survey. It takes about 10–15 minutes, and your answers go only to Nigel &amp; Michael.
    </p>
    ${button(link, 'Open my survey', palette)}
    ${codeBlock(opts.code, palette)}
    <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
      This link and code work until ${expires}. If they lapse, just request a new one.
    </p>`

  const { error } = await client().emails.send({
    from: fromAddress(),
    to: opts.email,
    subject: `Confirm your email to open the Staff 360 Survey`,
    html: shell(palette, 'Confirm your email address', body),
    text: [
      `Confirm your email address to open the Staff 360 Survey.`,
      '',
      link,
      '',
      `Or enter this code on the sign-in page: ${opts.code}`,
      `Valid until ${expires}.`,
    ].join('\n'),
  })

  if (error) {
    if (error.message?.includes('testing emails')) {
      console.warn(
        [
          '',
          `[Resend sandbox] Cannot email ${opts.email} — verify domain at resend.com/domains or use code below:`,
          `      to:   ${opts.email}`,
          `      link: ${link}`,
          `      code: ${opts.code}`,
          '',
        ].join('\n'),
      )
      return
    }
    throw new Error(`Resend rejected the message: ${error.message}`)
  }
}

export async function sendResultsVerification(opts: {
  email: string
  token: string
  code: string
  expiresAt: Date
}) {
  // The results dashboard spans both companies; use Synergy's navy as a neutral.
  const palette = {
    navy: BRANDS.synergy.colors.navy,
    orange: BRANDS.synergy.colors.orange,
  }
  const link = `${baseUrl()}/verify?token=${encodeURIComponent(opts.token)}`

  if (devDeliver('results sign-in', opts.email, link, opts.code)) return

  const body = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
      Here's your sign-in link for the staff check-in results dashboard.
    </p>
    ${button(link, 'Open results dashboard', palette)}
    ${codeBlock(opts.code, palette)}
    <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
      Single use. Your session then stays signed in on this device for 7 days.
    </p>`

  const { error } = await client().emails.send({
    from: fromAddress(),
    to: opts.email,
    subject: 'Sign in to the staff check-in results',
    html: shell(palette, 'Sign in to the results dashboard', body),
    text: [
      'Sign in to the staff check-in results dashboard.',
      '',
      link,
      '',
      `Or enter this code: ${opts.code}`,
    ].join('\n'),
  })

  if (error) {
    if (error.message?.includes('testing emails')) {
      console.warn(
        [
          '',
          `[Resend sandbox] Cannot email ${opts.email} — verify domain at resend.com/domains or use code below:`,
          `      to:   ${opts.email}`,
          `      link: ${link}`,
          `      code: ${opts.code}`,
          '',
        ].join('\n'),
      )
      return
    }
    throw new Error(`Resend rejected the message: ${error.message}`)
  }
}

/** Nudge the reader when a response lands, so nothing sits unread. */
export async function sendSubmissionNotice(opts: {
  company: CompanyId
  respondentName: string
  isUpdate: boolean
}) {
  if (process.env.NOTIFY_ON_SUBMIT === 'false') return
  if (!process.env.RESEND_API_KEY) return
  const brand = getBrand(opts.company)
  const palette = { navy: brand.colors.navy, orange: brand.colors.orange }
  const verb = opts.isUpdate ? 'updated their' : 'completed the'

  const body = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
      <strong>${escapeHtml(opts.respondentName)}</strong> has ${verb} Staff 360 Survey (${brand.legalName}).
    </p>
    ${button(`${baseUrl()}/results`, 'View in the dashboard', palette)}`

  try {
    await client().emails.send({
      from: fromAddress(),
      to: [BRANDS.portal.manager.email, BRANDS.synergy.manager.email],
      subject: `New Staff 360 Survey response — ${opts.respondentName} (${brand.legalName})`,
      html: shell(palette, 'A new response has come in', body),
      text: `${opts.respondentName} has ${verb} Staff 360 Survey (${brand.legalName}).\n\n${baseUrl()}/results`,
    })
  } catch {
    // A failed notification must never lose someone's submission.
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
