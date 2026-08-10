import { BRANDS, type Brand } from '@/lib/brand'

/**
 * Applies a brand's palette and typefaces to everything inside it, and draws
 * the shared page chrome (unified logo header, confidentiality footer).
 */
export function BrandShell({
  brand,
  children,
  width = 'form',
}: {
  brand?: Brand
  children: React.ReactNode
  width?: 'form' | 'wide'
}) {
  const activeBrand = brand ?? BRANDS.synergy
  const style = {
    '--brand-navy': activeBrand.colors.navy,
    '--brand-orange': activeBrand.colors.orange,
    '--brand-navy-rgb': activeBrand.colors.navyRgb,
    '--brand-orange-rgb': activeBrand.colors.orangeRgb,
    '--brand-font-heading': activeBrand.fonts.heading,
    '--brand-font-body': activeBrand.fonts.body,
  } as React.CSSProperties

  return (
    <div style={style} className="flex min-h-dvh flex-col font-body">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1d285a] via-[#ee7522] to-[#f7941d]" />
      <header className="border-b border-slate-200 bg-white">
        <div
          className={`mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 ${
            width === 'wide' ? 'max-w-7xl' : 'max-w-3xl'
          }`}
        >
          <div className="flex items-center gap-4 sm:gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BRANDS.portal.logo.src}
              alt={BRANDS.portal.logo.alt}
              width={BRANDS.portal.logo.width}
              height={BRANDS.portal.logo.height}
              className="h-6 w-auto sm:h-7"
            />
            <span className="h-5 w-px bg-slate-200" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BRANDS.synergy.logo.src}
              alt={BRANDS.synergy.logo.alt}
              width={BRANDS.synergy.logo.width}
              height={BRANDS.synergy.logo.height}
              className="h-6 w-auto sm:h-7"
            />
          </div>
          <span className="text-right text-xs leading-tight text-slate-500">
            <strong className="font-semibold text-[#1c2949]">Staff 360 Surveys</strong>
            <br />
            Portal Technology &amp; Synergy Managed Services
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
            Confidential. Responses are encrypted at rest and visible only to Nigel &amp; Michael.
            Portal Technology &amp; Synergy Managed Services.
          </p>
        </div>
      </footer>
    </div>
  )
}

