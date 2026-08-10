import Link from 'next/link'

const REASONS: Record<string, string> = {
  incomplete:
    'That link looks incomplete — some email clients break long links across lines. Try copying the whole link, or use the 6-digit code from the same email instead.',
  expired:
    'This link has already been used, or it has expired. Links last 7 days. Request a new one and you can use either the link or the 6-digit code.',
  'not-authorised': 'That address is not authorised to view the results dashboard.',
  'not-staff':
    'That address is no longer recognised as a Portal Technology or Synergy Managed Services staff address.',
}

export default async function VerifyFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams
  const message = REASONS[reason ?? ''] ?? REASONS.expired

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1d285a] via-[#ee7522] to-[#f7941d]" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 sm:px-6">
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl text-[#1c2949]">That link didn&apos;t work</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{message}</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#f7941d] px-5 py-3 text-base font-semibold text-white transition hover:brightness-95"
          >
            Start again
          </Link>
        </div>
      </main>
    </div>
  )
}
