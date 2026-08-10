import { NextResponse } from 'next/server'
import { companyForEmail } from '@/lib/brand'
import {
  isResultsViewer,
  startResultsSession,
  startSurveySession,
} from '@/lib/session'
import { consumeToken } from '@/lib/verification'

export const dynamic = 'force-dynamic'

/**
 * Landing point for the emailed link. This has to be a route handler rather
 * than a page: only route handlers and server actions may set cookies.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return failed(request, 'incomplete')

  const consumed = await consumeToken(token)
  if (!consumed) return failed(request, 'expired')

  if (consumed.purpose === 'results') {
    if (!isResultsViewer(consumed.email)) return failed(request, 'not-authorised')
    await startResultsSession(consumed.email)
    return NextResponse.redirect(new URL('/results', request.url))
  }

  // Re-derive the company from the address rather than trusting the stored
  // value, so a domain reassignment can't strand someone in the wrong brand.
  const company = companyForEmail(consumed.email) ?? consumed.company
  if (!company) return failed(request, 'not-staff')

  await startSurveySession(consumed.email, company)
  return NextResponse.redirect(new URL('/survey', request.url))
}

function failed(request: Request, reason: string) {
  return NextResponse.redirect(new URL(`/verify/failed?reason=${reason}`, request.url))
}
