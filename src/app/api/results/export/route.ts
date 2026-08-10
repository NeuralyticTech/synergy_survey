import { NextResponse } from 'next/server'
import { getBrand, isCompanyId } from '@/lib/brand'
import { getResultsSession } from '@/lib/session'
import { listSubmissions } from '@/lib/submissions'
import { ALL_QUESTIONS, fill } from '@/lib/survey'

export const dynamic = 'force-dynamic'

function csvCell(value: string): string {
  // Prefix anything a spreadsheet would treat as a formula, so a pasted
  // "=cmd" in a free-text answer stays inert text.
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${guarded.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  const session = await getResultsSession()
  if (!session) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 })
  }

  const url = new URL(request.url)
  const companyParam = url.searchParams.get('company')
  const personParam = url.searchParams.get('person')

  let submissions = await listSubmissions()
  if (isCompanyId(companyParam)) {
    submissions = submissions.filter((s) => s.company === companyParam)
  }
  if (personParam) {
    submissions = submissions.filter((s) => s.id === personParam)
  }

  const header = [
    'Company',
    'Name',
    'Email',
    'Submitted (AEST/local)',
    'Revision',
    ...ALL_QUESTIONS.filter((q) => q.id !== 'full_name').map((q) =>
      // The generic brand name keeps one column header per question when the
      // export spans both companies.
      q.label.replaceAll('{BRAND}', 'the company').replaceAll('{MANAGER}', 'their manager'),
    ),
  ]

  const rows = submissions.map((submission) => {
    const brand = getBrand(submission.company)
    return [
      brand.legalName,
      submission.name,
      submission.email,
      submission.updatedAt.toISOString(),
      String(submission.revision),
      ...ALL_QUESTIONS.filter((q) => q.id !== 'full_name').map((question) => {
        const value = submission.answers[question.id] ?? ''
        if (question.kind === 'choice') {
          const choice = question.choices?.find((c) => c.value === value)
          return choice ? fill(choice.label, brand) : value
        }
        return value
      }),
    ]
  })

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvCell(String(cell))).join(','))
    .join('\r\n')

  const scope = isCompanyId(companyParam) ? companyParam : 'all'
  const stamp = new Date().toISOString().slice(0, 10)

  return new NextResponse(`﻿${csv}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="staff-checkin-${scope}-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
