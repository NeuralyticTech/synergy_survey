import { NextResponse } from 'next/server'
import { getBrand } from '@/lib/brand'
import { sendSubmissionNotice } from '@/lib/email'
import { getSurveySession } from '@/lib/session'
import { saveSubmission } from '@/lib/submissions'
import { validate } from '@/lib/survey'

export async function POST(request: Request) {
  const session = await getSurveySession()
  if (!session) {
    return NextResponse.json(
      { error: 'Your session has expired. Please request a new link from the start page.' },
      { status: 401 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })
  }

  const { answers } = (body ?? {}) as { answers?: unknown }
  if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
    return NextResponse.json({ error: 'No answers received.' }, { status: 400 })
  }

  // Re-validate server-side: the client checks are for a good experience only.
  const result = validate(answers as Record<string, string>)
  if (!result.ok) {
    return NextResponse.json(
      {
        error: 'Some answers still need attention.',
        errors: result.errors,
      },
      { status: 422 },
    )
  }

  try {
    const { isUpdate } = await saveSubmission({
      email: session.email,
      company: session.company,
      answers: result.cleaned,
    })

    await sendSubmissionNotice({
      company: session.company,
      respondentName: result.cleaned.full_name ?? session.email,
      isUpdate,
    })

    return NextResponse.json({
      ok: true,
      isUpdate,
      manager: getBrand(session.company).manager.firstName,
    })
  } catch (error) {
    console.error('Failed to store submission', error)
    return NextResponse.json(
      {
        error:
          'We could not save your answers. Please try again — your responses are still in this browser.',
      },
      { status: 500 },
    )
  }
}
