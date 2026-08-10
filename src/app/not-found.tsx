import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1d285a] via-[#ee7522] to-[#f7941d]" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-16 sm:px-6">
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl text-[#1c2949]">Page not found</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            That address doesn&apos;t exist. Head back to the start to pick your
            company.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#f7941d] px-5 py-3 text-base font-semibold text-white transition hover:brightness-95"
          >
            Back to the start
          </Link>
        </div>
      </main>
    </div>
  )
}
