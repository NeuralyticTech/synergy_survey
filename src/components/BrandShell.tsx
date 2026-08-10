import type { Brand } from '@/lib/brand'

/**
 * Applies a brand's palette and typefaces to everything inside it, and draws
 * the shared page chrome (logo header, confidentiality footer).
 */
export function BrandShell({
  brand,
  children,
  width = 'form',
}: {
  brand: Brand
  children: React.ReactNode
  width?: 'form' | 'wide'
}) {
  const style = {
    '--brand-navy': brand.colors.navy,
    '--brand-orange': brand.colors.orange,
    '--brand-navy-rgb': brand.colors.navyRgb,
    '--brand-orange-rgb': brand.colors.orangeRgb,
    '--brand-font-heading': brand.fonts.heading,
    '--brand-font-body': brand.fonts.body,
  } as React.CSSProperties

  return (
    <div
      style={style}
      className="flex min-h-dvh flex-col font-body"
    >
      <div className="h-1.5 w-full bg-orange" aria-hidden />
      <header className="border-b border-slate-200 bg-white">
        <div
          className={`mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6 ${
            width === 'wide' ? 'max-w-7xl' : 'max-w-3xl'
          }`}
        >
          {/* Plain <img>: these are small, already-optimised, static assets. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logo.src}
            alt={brand.logo.alt}
            width={brand.logo.width}
            height={brand.logo.height}
            className="h-8 w-auto sm:h-10"
          />
          <span className="hidden text-right text-xs leading-tight text-slate-500 sm:block">
            Staff Check-in
            <br />&amp; Feedback Survey
          </span>
        </div>
      </header>

      <main
        className={`mx-auto w-full flex-1 px-4 py-7 sm:px-6 sm:py-10 ${
          width === 'wide' ? 'max-w-7xl' : 'max-w-3xl'
        }`}
      >
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div
          className={`mx-auto px-4 py-5 sm:px-6 ${
            width === 'wide' ? 'max-w-7xl' : 'max-w-3xl'
          }`}
        >
          <p className="text-xs leading-relaxed text-slate-500">
            Confidential. Responses are encrypted at rest and visible only to{' '}
            {brand.manager.firstName}. {brand.legalName}.
          </p>
        </div>
      </footer>
    </div>
  )
}
