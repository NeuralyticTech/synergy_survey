import { NextResponse } from 'next/server'
import { companyForEmail } from '@/lib/brand'
import { normaliseEmail } from '@/lib/crypto'
import {
  isResultsViewer,
  startResultsSession,
  startSurveySession,
} from '@/lib/session'
import { consumeCode } from '@/lib/verification'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })
  }

  const { email: rawEmail, code: rawCode } = (body ?? {}) as Record<string, unknown>
  if (typeof rawEmail !== 'string' || typeof rawCode !== 'string') {
    return NextResponse.json({ error: 'Missing email or code.' }, { status: 400 })
  }

  const code = rawCode.replace(/\D/g, '')
  if (code.length !== 6) {
    return NextResponse.json(
      { error: 'The code is 6 digits — please check and try again.' },
      { status: 400 },
    )
  }

  const consumed = await consumeCode(normaliseEmail(rawEmail), code)
  if (!consumed) {
    return NextResponse.json(
      {
        error:
          'That code is not valid, has already been used, or has expired. Request a new email and try again.',
      },
      { status: 400 },
    )
  }

  if (consumed.purpose === 'results') {
    if (!isResultsViewer(consumed.email)) {
      return NextResponse.json({ error: 'Not authorised.' }, { status: 403 })
    }
    await startResultsSession(consumed.email)
    return NextResponse.json({ ok: true, redirectTo: '/results' })
  }

  // Re-derive the company from the address rather than trusting the stored
  // value, so a domain reassignment can't strand someone in the wrong brand.
  const company = companyForEmail(consumed.email) ?? consumed.company
  if (!company) {
    return NextResponse.json(
      { error: 'That address is no longer recognised as a staff address.' },
      { status: 403 },
    )
  }

  await startSurveySession(consumed.email, company)
  return NextResponse.json({ ok: true, redirectTo: '/survey' })
}
