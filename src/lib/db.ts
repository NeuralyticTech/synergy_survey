import 'server-only'
import { neon } from '@neondatabase/serverless'

/**
 * Tagged-template SQL, parameterised. Both backends below expose this shape,
 * so callers never care which one they got.
 */
export type SqlClient = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>

// Vercel's Neon integration writes several aliases; accept whichever is present.
function connectionString(): string | null {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING ??
    null
  )
}

let cached: SqlClient | null = null

export function sql(): SqlClient {
  if (cached) return cached

  const url = connectionString()
  if (url) {
    cached = neon(url) as unknown as SqlClient
    return cached
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'No Postgres connection string found. Set DATABASE_URL — the Neon integration on Vercel sets this for you.',
    )
  }

  // Local preview with no database configured: fall back to an in-process
  // Postgres (PGlite) so the whole flow can be clicked through offline. This
  // path is unreachable in production because of the guard above.
  cached = devSql()
  return cached
}

type DevDb = {
  query: (
    text: string,
    params: unknown[],
  ) => Promise<{ rows: Record<string, unknown>[] }>
}

// Next loads this module once per bundle (route handlers and pages are
// separate), and two PGlite instances over one data directory don't see each
// other's writes. Hang the instance off globalThis so all bundles share it.
const devDbGlobal = globalThis as typeof globalThis & {
  __surveyDevDb?: Promise<DevDb>
}

/** Lazily-started PGlite instance, persisted under .pglite/ between restarts. */
function devSql(): SqlClient {
  async function instance() {
    if (!devDbGlobal.__surveyDevDb) {
      devDbGlobal.__surveyDevDb = (async () => {
        // Built at runtime so the bundler can't statically pull PGlite into the
        // production build.
        const moduleName = ['@electric-sql', 'pglite'].join('/')
        const { PGlite } = (await import(
          /* webpackIgnore: true */ /* turbopackIgnore: true */ moduleName
        )) as typeof import('@electric-sql/pglite')

        const db = new PGlite('./.pglite')
        const { readFile } = await import('node:fs/promises')
        const { splitStatements } = await import('../../db/split.mjs')
        const schema = await readFile('./db/schema.sql', 'utf8')
        for (const statement of splitStatements(schema)) {
          await db.query(statement)
        }
        console.warn(
          '\n[dev] No DATABASE_URL set — using a local PGlite database at ./.pglite.\n' +
            '      Set DATABASE_URL in .env.local to use your real Neon database.\n',
        )
        return db as DevDb
      })()
    }
    return devDbGlobal.__surveyDevDb
  }

  return async (strings, ...values) => {
    const text = strings.reduce(
      (acc, part, index) => acc + part + (index < values.length ? `$${index + 1}` : ''),
      '',
    )
    const db = await instance()
    const result = await db.query(text, values)
    return result.rows
  }
}
