import { NextResponse } from 'next/server'
import { getResultsSession } from '@/lib/session'
import { deleteSubmission } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await getResultsSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const id = body?.id
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing submission ID.' }, { status: 400 })
    }

    const deleted = await deleteSubmission(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting submission:', err)
    return NextResponse.json(
      { error: 'Failed to delete submission.' },
      { status: 500 },
    )
  }
}
