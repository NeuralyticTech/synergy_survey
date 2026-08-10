import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { BrandShell } from '@/components/BrandShell'
import { allDomainsFor, getBrand, isCompanyId } from '@/lib/brand'
import { getSurveySession } from '@/lib/session'
import { StartForm } from './StartForm'

export default async function StartPage({
  params,
}: {
  params: Promise<{ company: string }>
}) {
  const { company } = await params
  if (!isCompanyId(company)) notFound()

  // Already verified on this device? Skip straight to the questions.
  const session = await getSurveySession()
  if (session?.company === company) redirect('/survey')

  const brand = getBrand(company)
  const domains = allDomainsFor(company)

  return (
    <BrandShell brand={brand}>
      <div className="animate-fade-up">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <span aria-hidden>←</span> Not {brand.legalName}? Change company
        </Link>

        <h1 className="mt-5 text-[25px] leading-tight text-navy sm:text-3xl">
          A message from {brand.manager.firstName}
        </h1>

        <div className="mt-4 space-y-3.5 text-[15px] leading-relaxed text-slate-700 sm:text-base">
          <p>Hi everyone,</p>
          <p>
            Thank you for all your hard work and dedication. As {brand.name}{' '}
            continues to evolve, we want to make sure you have the support, clarity
            and tools you need to do your best work.
          </p>
          <p>
            This is a check-in, not a test — there are no right or wrong answers, and
            nothing here puts your role at risk. I&apos;d genuinely like to know how
            you&apos;re feeling, what&apos;s working well, where we can improve, and
            how we can help you grow.
          </p>
          <p className="rounded-lg border-l-4 border-orange bg-orange/5 py-3 pl-4 pr-3.5 text-[14.5px]">
            <strong className="font-semibold text-navy">
              A note on how this works:
            </strong>{' '}
            your responses go directly and only to {brand.manager.firstName} — they
            won&apos;t be shared more broadly. Your name stays on the survey so you
            can be followed up with personally, one-to-one. If there&apos;s something
            you&apos;d rather raise anonymously or in person rather than in writing,
            just say so in the relevant answer or raise it directly at your follow-up
            chat — that&apos;s completely fine.
          </p>
          <p>
            Once you&apos;ve submitted this, we&apos;d love to follow up with a short
            1-on-1 to talk through your answers and your goals.
          </p>
          <p className="text-sm text-slate-500">
            Estimated completion time: 10–15 minutes.
          </p>
        </div>

        <hr className="my-8 border-slate-200" />

        <StartForm company={company} domains={domains} />
      </div>
    </BrandShell>
  )
}

export function generateStaticParams() {
  return [{ company: 'portal' }, { company: 'synergy' }]
}
