import 'server-only'
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto'

/**
 * Envelope format for every encrypted column: AES-256-GCM, with the 12-byte IV
 * and 16-byte auth tag prefixed to the ciphertext and the whole thing
 * base64url-encoded. `v1:` lets us rotate the scheme later without guessing.
 */
const VERSION = 'v1'
const IV_BYTES = 12
const TAG_BYTES = 16

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Run "npm run keygen" to generate the secrets, then set them in Vercel.`,
    )
  }
  return value
}

let cachedKey: Buffer | null = null

function encryptionKey(): Buffer {
  if (cachedKey) return cachedKey
  const raw = requireEnv('ENCRYPTION_KEY')
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be 32 bytes of base64 (got ${key.length}). Run "npm run keygen".`,
    )
  }
  cachedKey = key
  return key
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return `${VERSION}:${Buffer.concat([iv, tag, ciphertext]).toString('base64url')}`
}

export function decrypt(envelope: string): string {
  const [version, payload] = envelope.split(':', 2)
  if (version !== VERSION || !payload) {
    throw new Error('Unrecognised ciphertext envelope')
  }
  const bytes = Buffer.from(payload, 'base64url')
  const iv = bytes.subarray(0, IV_BYTES)
  const tag = bytes.subarray(IV_BYTES, IV_BYTES + TAG_BYTES)
  const ciphertext = bytes.subarray(IV_BYTES + TAG_BYTES)
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8')
}

export function encryptJson(value: unknown): string {
  return encrypt(JSON.stringify(value))
}

export function decryptJson<T>(envelope: string): T {
  return JSON.parse(decrypt(envelope)) as T
}

/**
 * Deterministic, keyed hash of an email address. We need to look a person up
 * (to replace their previous submission, to check their token) without ever
 * storing a searchable plaintext address. HMAC rather than a bare SHA-256 so a
 * leaked table can't be brute-forced against a list of staff addresses.
 */
export function emailFingerprint(email: string): string {
  return createHmac('sha256', requireEnv('EMAIL_HASH_KEY'))
    .update(normaliseEmail(email))
    .digest('hex')
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Opaque hash for single-use verification tokens and codes. */
export function tokenFingerprint(token: string): string {
  return createHmac('sha256', requireEnv('EMAIL_HASH_KEY'))
    .update(token)
    .digest('hex')
}

export function randomToken(): string {
  return randomBytes(32).toString('base64url')
}

/** Six digits, zero-padded, for people who'd rather type than click. */
export function randomCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

export function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
