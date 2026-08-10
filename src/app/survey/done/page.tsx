import { redirect } from 'next/navigation'
import { BrandShell } from '@/components/BrandShell'
import { getBrand } from '@/lib/brand'
import { getSurveySession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function DonePage() {
  const session = await getSurveySession()
  if (!session) redirect('/')
  const brand = getBrand(session.company)

  return (
    <BrandShell brand={brand}>
      <div className="animate-fade-up">
        <div className="card p-6 sm:p-8">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-orange/12 text-2xl text-orange"
            aria-hidden
          >
            ✓
          </span>
          <h1 className="mt-5 text-[25px] leading-tight text-navy sm:text-3xl">
            Thank you — that&apos;s all submitted
          </h1>
          <p className="mt-3.5 text-[15px] leading-relaxed text-slate-700 sm:text-base">
            Your answers have gone straight to Nigel &amp; Michael, encrypted,
            and won&apos;t be shared any more widely.
          </p>

          <div className="mt-6 rounded-lg border-l-4 border-orange bg-orange/5 py-3.5 pl-4 pr-4">
            <h2 className="text-[15px] font-semibold text-navy">One last thing</h2>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-700">
              Please book a 30-minute follow-up chat to talk through your answers and your goals.
            </p>
          </div>


          <p className="mt-6 text-sm leading-relaxed text-slate-500">
            If you want to change something, you can{' '}
            <a
              href="/survey"
              className="font-medium text-navy underline decoration-orange decoration-2 underline-offset-2"
            >
              fill the survey in again
            </a>{' '}
            — a new response replaces the old one.
          </p>
        </div>

        <form action="/api/auth/logout" method="post" className="mt-6">
          <button type="submit" className="btn-secondary">
            Sign out of this device
          </button>
        </form>
      </div>
    </BrandShell>
  )
}
