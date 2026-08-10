#!/usr/bin/env node
// Prints a fresh set of secrets to paste into Vercel / .env.local.
import { randomBytes } from 'node:crypto'

const lines = [
  `ENCRYPTION_KEY=${randomBytes(32).toString('base64')}`,
  `EMAIL_HASH_KEY=${randomBytes(32).toString('base64')}`,
  `SESSION_SECRET=${randomBytes(48).toString('base64')}`,
]

console.log('\nGenerated secrets — store these somewhere safe:\n')
console.log(lines.join('\n'))
console.log(
  [
    '',
    'ENCRYPTION_KEY  encrypts every answer. Lose it and existing responses',
    '                become permanently unreadable. Changing it later orphans',
    '                anything already submitted.',
    'EMAIL_HASH_KEY  keys the lookup hashes. Changing it detaches people from',
    '                their previous submission.',
    'SESSION_SECRET  signs login cookies. Rotating it just signs everyone out.',
    '',
  ].join('\n'),
)
