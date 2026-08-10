import type { Config } from 'tailwindcss'

// Brand colours are supplied at runtime as CSS variables by the <BrandShell>
// wrapper, so the same utility classes render in Portal or Synergy livery.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'rgb(var(--brand-navy-rgb) / <alpha-value>)',
        orange: 'rgb(var(--brand-orange-rgb) / <alpha-value>)',
      },
      fontFamily: {
        heading: 'var(--brand-font-heading)',
        body: 'var(--brand-font-body)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 24, 40, 0.06), 0 8px 24px -12px rgba(16, 24, 40, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.28s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
