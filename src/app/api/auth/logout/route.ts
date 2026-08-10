import { NextResponse } from 'next/server'
import { clearSessions } from '@/lib/session'

export async function POST(request: Request) {
  await clearSessions()
  return NextResponse.redirect(new URL('/', request.url), { status: 303 })
}
