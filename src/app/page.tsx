import Link from 'next/link'
import { BRANDS, COMPANY_IDS } from '@/lib/brand'

export const dynamic = 'force-static'

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1d285a] via-[#ee7522] to-[#f7941d]" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Confidential
        </p>
        <h1 className="mt-2 text-[26px] leading-tight text-[#1c2949] sm:text-4xl">
          Staff Check-in &amp; Feedback Survey
        </h1>
        <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-slate-600 sm:text-base">
          This is a check-in, not a test — there are no right or wrong answers, and
          nothing here puts your role at risk. It takes about 10–15 minutes.
        </p>

        <div className="mt-9">
          <h2 className="text-lg text-[#1c2949] sm:text-xl">
            First up — who do you work for?
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Pick your company and we&apos;ll take you to the right survey.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {COMPANY_IDS.map((id) => {
              const brand = BRANDS[id]
              return (
                <Link
                  key={id}
                  href={`/start/${id}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg focus-visible:-translate-y-0.5"
                  style={{ outlineColor: brand.colors.orange }}
                >
                  <span
                    className="mb-4 block h-1 w-11 rounded-full transition-all group-hover:w-16"
                    style={{ backgroundColor: brand.colors.orange }}
                    aria-hidden
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logo.src}
                    alt={brand.logo.alt}
                    width={brand.logo.width}
                    height={brand.logo.height}
                    className="h-9 w-auto self-start"
                  />
                  <span className="mt-4 text-sm leading-relaxed text-slate-600">
                    I work for {brand.legalName}.
                  </span>
                  <span
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: brand.colors.orange }}
                  >
                    Start my survey
                    <span
                      aria-hidden
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5">
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
              Nigel (Portal) or Michael (Synergy).
            </li>
            <li>
              Your name is attached so they can follow up with you personally. If
              you&apos;d rather raise something in person, say so in the answer and
              bring it to your 1-on-1 instead.
            </li>
          </ul>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <p className="text-xs text-slate-500">
            Portal Technology &amp; Synergy Managed Services
          </p>
          <Link
            href="/results"
            className="text-xs text-slate-400 underline decoration-dotted hover:text-slate-600"
          >
            Results (managers)
          </Link>
        </div>
      </footer>
    </div>
  )
}
