import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { type CompanyId, isCompanyId } from './brand'
import { normaliseEmail } from './crypto'

export const SURVEY_COOKIE = 'sfs_survey'
export const RESULTS_COOKIE = 'sfs_results'

/** Survey access lasts long enough that nobody gets locked out mid-answer. */
const SURVEY_TTL_SECONDS = 60 * 60 * 24 * 30
/** Results access is more sensitive, so it re-verifies weekly. */
const RESULTS_TTL_SECONDS = 60 * 60 * 24 * 7

export interface SurveySession {
  email: string
  company: CompanyId
}

export interface ResultsSession {
  email: string
}

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET
  if (!value || value.length < 32) {
    throw new Error(
      'SESSION_SECRET must be set to at least 32 characters. Run "npm run keygen".',
    )
  }
  return new TextEncoder().encode(value)
}

async function sign(payload: Record<string, unknown>, ttl: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(secret())
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export async function startSurveySession(email: string, company: CompanyId) {
  const token = await sign(
    { email: normaliseEmail(email), company, scope: 'survey' },
    SURVEY_TTL_SECONDS,
  )
  ;(await cookies()).set(SURVEY_COOKIE, token, cookieOptions(SURVEY_TTL_SECONDS))
}

export async function startResultsSession(email: string) {
  const token = await sign(
    { email: normaliseEmail(email), scope: 'results' },
    RESULTS_TTL_SECONDS,
  )
  ;(await cookies()).set(RESULTS_COOKIE, token, cookieOptions(RESULTS_TTL_SECONDS))
}

export async function getSurveySession(): Promise<SurveySession | null> {
  const token = (await cookies()).get(SURVEY_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    if (payload.scope !== 'survey') return null
    if (typeof payload.email !== 'string' || !isCompanyId(payload.company)) return null
    return { email: payload.email, company: payload.company }
  } catch {
    return null
  }
}

export async function getResultsSession(): Promise<ResultsSession | null> {
  const token = (await cookies()).get(RESULTS_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    if (payload.scope !== 'results') return null
    if (typeof payload.email !== 'string') return null
    // Re-check the allowlist on every read: revoking access is then just an
    // env var change, with no stale cookie still granting entry.
    if (!isResultsViewer(payload.email)) return null
    return { email: payload.email }
  } catch {
    return null
  }
}

/** Only these two addresses may ever see the results page. */
export function resultsViewers(): string[] {
  const configured = process.env.RESULTS_ALLOWED_EMAILS
  const list = configured
    ? configured.split(',')
    : ['mbailey@synergymanaged.com.au', 'nigel@portaltechnology.com.au']
  return list.map((email) => normaliseEmail(email)).filter(Boolean)
}

export function isResultsViewer(email: string): boolean {
  return resultsViewers().includes(normaliseEmail(email))
}

export async function clearSessions() {
  const jar = await cookies()
  jar.delete(SURVEY_COOKIE)
  jar.delete(RESULTS_COOKIE)
}
