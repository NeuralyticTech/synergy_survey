import Link from 'next/link'
import { BrandShell } from '@/components/BrandShell'
import { allAllowedDomains } from '@/lib/brand'
import { StartForm } from './start/[company]/StartForm'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const domains = allAllowedDomains()

  return (
    <BrandShell>
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Confidential Staff Survey
        </p>
        <h1 className="mt-2 text-[26px] font-bold leading-tight text-[#1c2949] sm:text-4xl">
          Staff 360 Survey
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600 sm:text-base">
          This is a check-in, not a test — there are no right or wrong answers, and
          nothing here puts your role at risk. It takes about 10–15 minutes.
        </p>

        <div className="mt-8">
          <StartForm domains={domains} />
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="text-sm font-semibold text-[#1c2949]">
            How your answers are handled
          </h3>
          <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-slate-600">
            <li>
              You&apos;ll confirm your work email address first, so only staff can
              take part.
            </li>
            <li>
              Answers are encrypted before they&apos;re stored, and are read only by
              Nigel &amp; Michael.
            </li>
            <li>
              Your name is attached so they can follow up with you personally. If
              you&apos;d rather raise something in person, say so in your answers and
              bring it to your 1-on-1 instead.
            </li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/results"
            className="text-xs text-slate-400 underline decoration-dotted hover:text-slate-600"
          >
            Results Dashboard (managers)
          </Link>
        </div>
      </div>
    </BrandShell>
  )
}

