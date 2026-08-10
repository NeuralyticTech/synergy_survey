import type { Metadata, Viewport } from 'next'
import { Catamaran, Lato, Montserrat } from 'next/font/google'
import './globals.css'

// Both brands' typefaces are loaded once here and selected per brand via the
// --brand-font-* variables that <BrandShell> sets.
const catamaran = Catamaran({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-catamaran',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Staff Check-in & Feedback Survey',
  description: 'A confidential check-in for Portal Technology and Synergy staff.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1c2949',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en-AU"
      className={`${catamaran.variable} ${montserrat.variable} ${lato.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
