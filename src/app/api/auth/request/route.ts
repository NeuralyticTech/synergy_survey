import { NextResponse } from 'next/server'
import {
  BRANDS,
  allDomainsFor,
  companyForEmail,
  isCompanyId,
} from '@/lib/brand'
import { normaliseEmail } from '@/lib/crypto'
import { sendResultsVerification, sendSurveyVerification } from '@/lib/email'
import { isResultsViewer } from '@/lib/session'
import { isRateLimited, issueVerification } from '@/lib/verification'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@,]+\.[^\s@,]+$/

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return bad('Malformed request.')
  }

  const { email: rawEmail, company: rawCompany, purpose: rawPurpose } =
    (body ?? {}) as Record<string, unknown>

  if (typeof rawEmail !== 'string' || !EMAIL_PATTERN.test(rawEmail.trim())) {
    return bad('Please enter a valid email address.')
  }

  const email = normaliseEmail(rawEmail)
  const purpose = rawPurpose === 'results' ? 'results' : 'survey'

  if (purpose === 'results') {
    // Don't confirm or deny who is on the allowlist — an unlisted address gets
    // the same response, minus the email.
    if (!isResultsViewer(email)) return ok()
    if (await isRateLimited(email)) return tooMany()

    const issued = await issueVerification(email, null, 'results')
    try {
      await sendResultsVerification({ email, ...issued })
    } catch (error) {
      return mailFailure(error)
    }
    return ok()
  }

  const detected = companyForEmail(email)
  if (!detected) {
    return bad(
      'That address is not a Portal Technology or Synergy Managed Services email. Please use your work address.',
    )
  }


  if (await isRateLimited(email)) return tooMany()

  const issued = await issueVerification(email, detected, 'survey')
  try {
    await sendSurveyVerification({ email, company: detected, ...issued })
  } catch (error) {
    return mailFailure(error)
  }

  return ok()
}

function ok() {
  return NextResponse.json({ ok: true })
}

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function tooMany() {
  return NextResponse.json(
    {
      error:
        'We have already sent you several emails in the last hour. Please check your inbox and spam folder, then try again later.',
    },
    { status: 429 },
  )
}

function mailFailure(error: unknown) {
  console.error('Verification email failed to send', error)
  return NextResponse.json(
    {
      error:
        'We could not send the email just now. Please try again in a moment, or let IT know if it keeps happening.',
    },
    { status: 502 },
  )
}
