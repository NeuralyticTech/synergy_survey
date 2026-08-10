import 'server-only'
import { sql } from './db'
import type { CompanyId } from './brand'
import { decryptJson, emailFingerprint, encrypt, encryptJson, decrypt } from './crypto'
import type { Answers } from './survey'

export interface StoredSubmission {
  id: string
  company: CompanyId
  email: string
  name: string
  answers: Answers
  submittedAt: Date
  updatedAt: Date
  revision: number
}

interface Row {
  id: string
  company: CompanyId
  email_enc: string
  payload_enc: string
  submitted_at: string
  updated_at: string
  revision: number
}

/**
 * One row per person: re-submitting replaces the previous answers and bumps the
 * revision, so the dashboard never shows the same person twice.
 */
export async function saveSubmission(opts: {
  email: string
  company: CompanyId
  answers: Answers
}): Promise<{ isUpdate: boolean }> {
  const rows = (await sql()`
    insert into submissions (email_hash, email_enc, company, payload_enc)
    values (
      ${emailFingerprint(opts.email)},
      ${encrypt(opts.email)},
      ${opts.company},
      ${encryptJson(opts.answers)}
    )
    on conflict (email_hash) do update
      set payload_enc = excluded.payload_enc,
          company     = excluded.company,
          email_enc   = excluded.email_enc,
          updated_at  = now(),
          revision    = submissions.revision + 1
    returning revision
  `) as Array<{ revision: number }>

  return { isUpdate: (rows[0]?.revision ?? 1) > 1 }
}

export async function hasSubmitted(email: string): Promise<boolean> {
  const rows = (await sql()`
    select 1 from submissions where email_hash = ${emailFingerprint(email)} limit 1
  `) as unknown[]
  return rows.length > 0
}

/** Answers are only ever decrypted here, inside a results-authorised request. */
export async function listSubmissions(): Promise<StoredSubmission[]> {
  const rows = (await sql()`
    select id, company, email_enc, payload_enc, submitted_at, updated_at, revision
    from submissions
    order by updated_at desc
  `) as unknown as Row[]

  return rows.map((row) => {
    const answers = decryptJson<Answers>(row.payload_enc)
    return {
      id: row.id,
      company: row.company,
      email: decrypt(row.email_enc),
      name: answers.full_name?.trim() || '(name not given)',
      answers,
      submittedAt: new Date(row.submitted_at),
      updatedAt: new Date(row.updated_at),
      revision: row.revision,
    }
  })
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const rows = (await sql()`
    delete from submissions where id = ${id} returning id
  `) as Array<{ id: string }>

  return rows.length > 0
}

