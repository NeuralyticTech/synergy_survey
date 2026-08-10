import 'server-only'
import { sql } from './db'
import type { CompanyId } from './brand'
import {
  emailFingerprint,
  encrypt,
  normaliseEmail,
  randomCode,
  randomToken,
  tokenFingerprint,
} from './crypto'

export type Purpose = 'survey' | 'results'

/** Long enough that a link sitting in an inbox over a break still works. */
const TOKEN_TTL_DAYS = 7
/** Requests per address per hour, to stop the mailer being used as a hammer. */
const MAX_REQUESTS_PER_HOUR = 6
/** See consumeToken: tolerates link scanners fetching the URL first. */
const SCAN_GRACE_MINUTES = 15

export interface IssuedVerification {
  token: string
  code: string
  expiresAt: Date
}

export async function isRateLimited(email: string): Promise<boolean> {
  const rows = (await sql()`
    select count(*)::int as count
    from verification_tokens
    where email_hash = ${emailFingerprint(email)}
      and created_at > now() - interval '1 hour'
  `) as Array<{ count: number }>
  return (rows[0]?.count ?? 0) >= MAX_REQUESTS_PER_HOUR
}

export async function issueVerification(
  email: string,
  company: CompanyId | null,
  purpose: Purpose,
): Promise<IssuedVerification> {
  const normalised = normaliseEmail(email)
  const token = randomToken()
  const code = randomCode()
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)

  // Any earlier unused request for this address becomes void, so a forwarded
  // old email can't be used to get in.
  await sql()`
    update verification_tokens
    set consumed_at = now()
    where email_hash = ${emailFingerprint(normalised)}
      and purpose = ${purpose}
      and consumed_at is null
  `

  await sql()`
    insert into verification_tokens
      (email_hash, email_enc, company, purpose, token_hash, code_hash, expires_at)
    values (
      ${emailFingerprint(normalised)},
      ${encrypt(normalised)},
      ${company},
      ${purpose},
      ${tokenFingerprint(token)},
      ${tokenFingerprint(`${normalised}:${code}`)},
      ${expiresAt.toISOString()}
    )
  `

  return { token, code, expiresAt }
}

interface TokenRow {
  id: string
  company: CompanyId | null
  purpose: Purpose
}

/**
 * Consume by link. Returns null for anything not currently valid — expired,
 * already used, or simply unknown.
 *
 * The `consumed_at` check allows a short grace window rather than being strictly
 * single-use. Corporate mail security (Microsoft Defender Safe Links and
 * similar) fetches links to scan them, which would otherwise burn the token
 * before the recipient ever clicks it. The window is minutes, and the token
 * still expires outright after TOKEN_TTL_DAYS.
 */
export async function consumeToken(
  token: string,
): Promise<{ email: string; company: CompanyId | null; purpose: Purpose } | null> {
  const rows = (await sql()`
    update verification_tokens
    set consumed_at = coalesce(consumed_at, now())
    where token_hash = ${tokenFingerprint(token)}
      and expires_at > now()
      and (
        consumed_at is null
        or consumed_at > now() - (${SCAN_GRACE_MINUTES} || ' minutes')::interval
      )
    returning id, company, purpose, email_enc
  `) as unknown as Array<TokenRow & { email_enc: string }>

  const row = rows[0]
  if (!row) return null
  const { decrypt } = await import('./crypto')
  return { email: decrypt(row.email_enc), company: row.company, purpose: row.purpose }
}

/** Consume by typed code. The address is supplied, so we match on both. */
export async function consumeCode(
  email: string,
  code: string,
): Promise<{ email: string; company: CompanyId | null; purpose: Purpose } | null> {
  const normalised = normaliseEmail(email)
  const rows = (await sql()`
    update verification_tokens
    set consumed_at = now()
    where email_hash = ${emailFingerprint(normalised)}
      and code_hash = ${tokenFingerprint(`${normalised}:${code.trim()}`)}
      and consumed_at is null
      and expires_at > now()
    returning id, company, purpose
  `) as unknown as TokenRow[]

  const row = rows[0]
  if (!row) return null
  return { email: normalised, company: row.company, purpose: row.purpose }
}

/** Housekeeping: nothing useful lives in a spent or stale token row. */
export async function purgeStaleTokens() {
  await sql()`
    delete from verification_tokens
    where expires_at < now() - interval '30 days'
       or (consumed_at is not null and consumed_at < now() - interval '30 days')
  `
}
