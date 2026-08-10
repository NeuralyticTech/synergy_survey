'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BRANDS, type CompanyId, getBrand } from '@/lib/brand'
import { attentionFlags, summarise } from '@/lib/aggregate'
import type { StoredSubmission } from '@/lib/submissions'
import { SECTIONS, fill, type Answers } from '@/lib/survey'

export interface SerialisedSubmission {
  id: string
  company: CompanyId
  name: string
  email: string
  answers: Answers
  updatedAt: string
  revision: number
}

type CompanyFilter = 'all' | CompanyId
type Tab = 'overview' | 'comments' | 'people'

export function ResultsDashboard({
  viewerEmail,
  submissions,
}: {
  viewerEmail: string
  submissions: SerialisedSubmission[]
}) {
  const router = useRouter()
  const [submissionList, setSubmissionList] = useState<SerialisedSubmission[]>(submissions)
  const [company, setCompany] = useState<CompanyFilter>('all')
  const [personId, setPersonId] = useState<string>('all')
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    setSubmissionList(submissions)
  }, [submissions])

  const handleDeleteSubmission = (id: string) => {
    setSubmissionList((prev) => prev.filter((s) => s.id !== id))
    router.refresh()
  }

  const byCompany = useMemo(
    () =>
      company === 'all'
        ? submissionList
        : submissionList.filter((s) => s.company === company),
    [submissionList, company],
  )

  // The person filter is scoped to the selected company, so switching company
  // can't leave a now-invisible person selected.
  const people = useMemo(
    () =>
      [...byCompany].sort((a, b) =>
        a.name.localeCompare(b.name, 'en-AU', { sensitivity: 'base' }),
      ),
    [byCompany],
  )

  const activePersonId = people.some((p) => p.id === personId) ? personId : 'all'

  const filtered = useMemo(
    () =>
      activePersonId === 'all'
        ? byCompany
        : byCompany.filter((s) => s.id === activePersonId),
    [byCompany, activePersonId],
  )

  const stored: StoredSubmission[] = useMemo(
    () =>
      filtered.map((s) => ({
        id: s.id,
        company: s.company,
        email: s.email,
        name: s.name,
        answers: s.answers,
        submittedAt: new Date(s.updatedAt),
        updatedAt: new Date(s.updatedAt),
        revision: s.revision,
      })),
    [filtered],
  )

  const aggregate = useMemo(() => summarise(stored), [stored])

  // Free-text and per-person tabs read against the brand of the row they came
  // from; the overview uses the filtered brand, or Synergy's neutral palette.
  const brandForLabels = company === 'all' ? BRANDS.synergy : getBrand(company)

  const exportHref = `/api/results/export?company=${company}${
    activePersonId !== 'all' ? `&person=${encodeURIComponent(activePersonId)}` : ''
  }`

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1d285a] via-[#ee7522] to-[#f7941d]" />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg text-[#1c2949] sm:text-xl">
              Staff check-in results
            </h1>
            <p className="text-xs text-slate-500">
              Signed in as {viewerEmail} · confidential
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href={exportHref} className="btn-secondary !px-3.5 !py-2 !text-sm">
              Export CSV
            </a>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn-secondary !px-3.5 !py-2 !text-sm">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Filters */}
        <div className="card p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Company
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'portal', 'synergy'] as CompanyFilter[]).map((option) => {
                  const active = company === option
                  const label =
                    option === 'all' ? 'Both companies' : BRANDS[option].legalName
                  const count =
                    option === 'all'
                      ? submissionList.length
                      : submissionList.filter((s) => s.company === option).length
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setCompany(option)
                        setPersonId('all')
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                        active
                          ? 'text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor:
                                option === 'all'
                                  ? '#1c2949'
                                  : BRANDS[option].colors.orange,
                            }
                          : undefined
                      }
                    >
                      {label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="person-filter"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Staff member
              </label>
              <select
                id="person-filter"
                value={activePersonId}
                onChange={(event) => setPersonId(event.target.value)}
                className="field !py-2.5"
              >
                <option value="all">
                  Everyone ({people.length} respondent
                  {people.length === 1 ? '' : 's'})
                </option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                    {person.answers.job_title ? ` — ${person.answers.job_title}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {submissionList.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <SummaryTiles aggregate={aggregate} filtered={filtered} />

            <nav className="mt-7 flex gap-1 overflow-x-auto border-b border-slate-200">
              {(
                [
                  ['overview', 'Ratings overview'],
                  ['comments', 'Written answers'],
                  ['people', `Individual responses (${filtered.length})`],
                ] as Array<[Tab, string]>
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-semibold transition ${
                    tab === id
                      ? 'border-[#ee7522] text-[#1c2949]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="mt-6">
              {filtered.length === 0 ? (
                <p className="card p-6 text-sm text-slate-600">
                  No responses match these filters yet.
                </p>
              ) : tab === 'overview' ? (
                <Overview aggregate={aggregate} brandName={brandForLabels.name} />
              ) : tab === 'comments' ? (
                <Comments aggregate={aggregate} brandName={brandForLabels.name} />
              ) : (
                <People submissions={filtered} onDelete={handleDeleteSubmission} />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card mt-6 p-8 text-center">
      <h2 className="text-lg text-[#1c2949]">No responses yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
        As soon as someone submits the check-in, their answers will appear here in
        aggregate and individually.
      </p>
    </div>
  )
}

function SummaryTiles({
  aggregate,
  filtered,
}: {
  aggregate: ReturnType<typeof summarise>
  filtered: SerialisedSubmission[]
}) {
  const find = (id: string) => aggregate.charts.find((c) => c.question.id === id)
  const nps = find('nps')
  const workload = find('workload_sustainability')
  const support = find('manager_support')
  const retention = find('retention_likelihood')
  const flagged = filtered.filter((s) => attentionFlags(s.answers).length > 0).length

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Tile label="Responses" value={String(aggregate.total)} />
      <Tile
        label="eNPS"
        value={nps?.npsScore === null || nps === undefined ? '—' : String(nps.npsScore)}
        hint="Promoters − detractors"
      />
      <Tile
        label="Workload"
        value={formatAverage(workload?.average)}
        hint="Avg. sustainability / 5"
      />
      <Tile
        label="Manager support"
        value={formatAverage(support?.average)}
        hint="Avg. / 5"
      />
      <Tile
        label="Staying 12 mths"
        value={formatAverage(retention?.average)}
        hint="Avg. likelihood / 5"
      />
      <Tile
        label="Needs attention"
        value={String(flagged)}
        hint="Responses with a flag"
        tone={flagged > 0 ? 'warn' : 'plain'}
      />
    </div>
  )
}

function Tile({
  label,
  value,
  hint,
  tone = 'plain',
}: {
  label: string
  value: string
  hint?: string
  tone?: 'plain' | 'warn'
}) {
  return (
    <div
      className={`card p-4 ${tone === 'warn' ? 'border-amber-300 bg-amber-50/60' : ''}`}
    >
      <p className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-[26px] font-bold leading-none text-[#1c2949]">{value}</p>
      {hint && <p className="mt-1.5 text-[11.5px] leading-tight text-slate-400">{hint}</p>}
    </div>
  )
}

function formatAverage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return value.toFixed(1)
}

function Overview({
  aggregate,
  brandName,
}: {
  aggregate: ReturnType<typeof summarise>
  brandName: string
}) {
  const brand = { ...BRANDS.synergy, name: brandName }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {aggregate.charts.map((chart) => {
        const max = Math.max(1, ...chart.distribution.map((d) => d.count))
        return (
          <section key={chart.question.id} className="card p-4 sm:p-5">
            <h3 className="text-[14.5px] font-semibold leading-snug text-[#1c2949]">
              {fill(chart.question.label, brand)}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {chart.answered} answered
              {chart.average !== null && ` · average ${chart.average.toFixed(2)}`}
              {chart.npsScore !== null && ` · eNPS ${chart.npsScore}`}
            </p>

            <div className="mt-3.5 space-y-1.5">
              {chart.distribution.map((row) => (
                <div key={row.value} className="flex items-center gap-2.5">
                  <span
                    className="w-[42%] shrink-0 truncate text-right text-[12.5px] text-slate-600"
                    title={row.label}
                  >
                    {row.label}
                  </span>
                  <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                    <div
                      className="h-full rounded bg-[#ee7522] transition-[width] duration-500"
                      style={{ width: `${(row.count / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-[12.5px] tabular-nums text-slate-500">
                    {row.count}
                    {chart.answered > 0 && (
                      <span className="text-slate-400">
                        {' '}
                        ({Math.round(row.share * 100)}%)
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function Comments({
  aggregate,
  brandName,
}: {
  aggregate: ReturnType<typeof summarise>
  brandName: string
}) {
  const brand = { ...BRANDS.synergy, name: brandName }

  return (
    <div className="space-y-5">
      {aggregate.freeText.length === 0 && (
        <p className="card p-6 text-sm text-slate-600">
          No written answers in this selection.
        </p>
      )}
      {aggregate.freeText.map(({ question, answers }) => (
        <section key={question.id} className="card p-4 sm:p-5">
          <h3 className="text-[15px] font-semibold leading-snug text-[#1c2949]">
            {fill(question.label, brand)}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{answers.length} answered</p>
          <ul className="mt-4 space-y-3">
            {answers.map((answer) => (
              <li
                key={`${question.id}-${answer.submissionId}`}
                className="rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-3"
              >
                <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-slate-700">
                  {answer.text}
                </p>
                <p className="mt-2 flex items-center gap-2 text-[12px] text-slate-500">
                  <CompanyDot company={answer.company} />
                  {answer.name}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function People({
  submissions,
  onDelete,
}: {
  submissions: SerialisedSubmission[]
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <PersonCard key={submission.id} submission={submission} onDelete={onDelete} />
      ))}
    </div>
  )
}

function PersonCard({
  submission,
  onDelete,
}: {
  submission: SerialisedSubmission
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const brand = getBrand(submission.company)
  const flags = attentionFlags(submission.answers)

  const performDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/results/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: submission.id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete submission.')
      }

      onDelete(submission.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete submission.'
      setDeleteError(message)
      setIsDeleting(false)
    }
  }

  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 p-4 text-left transition hover:bg-slate-50 sm:p-5"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[16px] font-semibold text-[#1c2949]">
              {submission.name}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: brand.colors.orange }}
            >
              {brand.legalName}
            </span>
          </div>
          <p className="mt-1 truncate text-[13px] text-slate-500">
            {submission.answers.job_title || 'No title given'} · {submission.email}
          </p>
          <p className="mt-0.5 text-[12px] text-slate-400">
            {new Date(submission.updatedAt).toLocaleString('en-AU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
            {submission.revision > 1 && ` · revision ${submission.revision}`}
          </p>
          {flags.length > 0 && (
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {flags.map((flag) => (
                <li
                  key={flag}
                  className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11.5px] font-medium text-amber-900"
                >
                  {flag}
                </li>
              ))}
            </ul>
          )}
        </div>
        <span
          aria-hidden
          className={`mt-1 flex-none text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-5">
          {SECTIONS.map((section) => {
            const rows = section.questions
              .filter((question) => (submission.answers[question.id] ?? '').trim())
              .filter((question) => question.id !== 'full_name')
            if (rows.length === 0) return null
            return (
              <div key={section.id} className="mb-5 last:mb-0">
                <h4 className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
                  Part {section.number} — {section.title}
                </h4>
                <dl className="mt-2.5 space-y-3">
                  {rows.map((question) => (
                    <div key={question.id}>
                      <dt className="text-[13.5px] font-semibold leading-snug text-[#1c2949]">
                        {fill(question.label, brand)}
                      </dt>
                      <dd className="mt-0.5 whitespace-pre-wrap text-[14.5px] leading-relaxed text-slate-700">
                        {displayAnswer(question.id, submission.answers, brand)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          })}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            {deleteError && (
              <p className="text-xs font-medium text-rose-600">{deleteError}</p>
            )}
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="ml-auto flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete submission
              </button>
            ) : (
              <div className="ml-auto flex flex-wrap items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2">
                <span className="text-xs font-medium text-rose-800">
                  Delete this submission permanently?
                </span>
                <button
                  type="button"
                  onClick={performDelete}
                  disabled={isDeleting}
                  className="rounded bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false)
                    setDeleteError(null)
                  }}
                  disabled={isDeleting}
                  className="rounded bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function displayAnswer(
  questionId: string,
  answers: Answers,
  brand: ReturnType<typeof getBrand>,
): string {
  const value = answers[questionId] ?? ''
  const question = SECTIONS.flatMap((s) => s.questions).find((q) => q.id === questionId)
  if (!question) return value
  if (question.kind === 'choice') {
    const choice = question.choices?.find((c) => c.value === value)
    return choice ? fill(choice.label, brand) : value
  }
  if (question.kind === 'scale') return `${value} / 5 — ${scaleWord(question, value)}`
  if (question.kind === 'nps') return `${value} / 10`
  return value
}

function scaleWord(
  question: { low?: string; high?: string },
  value: string,
): string {
  if (value === '1') return question.low ?? ''
  if (value === '5') return question.high ?? ''
  if (value === '3') return 'neutral'
  if (value === '2') return `leaning ${(question.low ?? '').toLowerCase()}`
  return `leaning ${(question.high ?? '').toLowerCase()}`
}

function CompanyDot({ company }: { company: CompanyId }) {
  const brand = getBrand(company)
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: brand.colors.orange }}
        aria-hidden
      />
      <span className="sr-only">{brand.legalName}: </span>
      {brand.legalName}
      <span aria-hidden>·</span>
    </span>
  )
}
