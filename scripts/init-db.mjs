#!/usr/bin/env node
// Applies db/schema.sql to the configured Neon database.
// Usage: npm run db:init   (reads .env.local, or an already-exported DATABASE_URL)
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'
import { splitStatements } from '../db/split.mjs'

async function loadEnvLocal() {
  if (!existsSync('.env.local')) return
  const text = await readFile('.env.local', 'utf8')
  for (const line of text.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue
    process.env[key] = rawValue.replace(/^["']|["']$/g, '')
  }
}

await loadEnvLocal()

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING

if (!url) {
  console.error(
    'No connection string. Set DATABASE_URL in .env.local (Vercel > Storage > your Neon database > .env.local tab).',
  )
  process.exit(1)
}

const sql = neon(url)
const schema = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8')

const statements = splitStatements(schema)

for (const statement of statements) {
  const label = statement.split('\n')[0].slice(0, 72)
  try {
    await sql(statement)
    console.log(`  ok   ${label}`)
  } catch (error) {
    console.error(`  FAIL ${label}\n       ${error.message}`)
    process.exit(1)
  }
}

console.log('\nSchema applied.')
