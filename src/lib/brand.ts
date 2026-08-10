export type CompanyId = 'portal' | 'synergy'

export interface Brand {
  id: CompanyId
  /** Short name used inline in question wording. */
  name: string
  legalName: string
  tagline: string
  /** The director/manager who reads this company's responses. */
  manager: { firstName: string; role: string; email: string }
  /** The other company's manager — referenced in the follow-up question. */
  otherManagerFirstName: string
  emailDomains: string[]
  logo: { src: string; alt: string; width: number; height: number }
  colors: { navy: string; orange: string; navyRgb: string; orangeRgb: string }
  fonts: { heading: string; body: string }
  website: string
}

export const BRANDS: Record<CompanyId, Brand> = {
  portal: {
    id: 'portal',
    name: 'Portal Technology',
    legalName: 'Portal Technology',
    tagline: 'Helping you get on with IT',
    manager: {
      firstName: 'Nigel',
      role: 'Director',
      email: 'nigel@portaltechnology.com.au',
    },
    otherManagerFirstName: 'Michael',
    emailDomains: ['portaltechnology.com.au'],
    logo: {
      src: '/brand/portal-technology-logo.png',
      alt: 'Portal Technology',
      width: 1073,
      height: 225,
    },
    colors: {
      navy: '#1d285a',
      orange: '#ee7522',
      navyRgb: '29 40 90',
      orangeRgb: '238 117 34',
    },
    fonts: {
      heading: 'var(--font-montserrat), ui-sans-serif, system-ui, sans-serif',
      body: 'var(--font-lato), ui-sans-serif, system-ui, sans-serif',
    },
    website: 'https://portaltechnology.au/',
  },
  synergy: {
    id: 'synergy',
    name: 'Synergy',
    legalName: 'Synergy Managed Services',
    tagline: 'Managed Services',
    manager: {
      firstName: 'Michael',
      role: 'Director',
      email: 'mbailey@synergymanaged.com.au',
    },
    otherManagerFirstName: 'Nigel',
    emailDomains: ['synergymanaged.com.au'],
    logo: {
      src: '/brand/synergy-managed-services-logo.png',
      alt: 'Synergy Managed Services',
      width: 512,
      height: 61,
    },
    colors: {
      navy: '#1c2949',
      orange: '#f7941d',
      navyRgb: '28 41 73',
      orangeRgb: '247 148 29',
    },
    fonts: {
      heading: 'var(--font-catamaran), ui-sans-serif, system-ui, sans-serif',
      body: 'var(--font-catamaran), ui-sans-serif, system-ui, sans-serif',
    },
    website: 'https://www.synergymanaged.com.au/',
  },
}

export const COMPANY_IDS: CompanyId[] = ['portal', 'synergy']

export function isCompanyId(value: unknown): value is CompanyId {
  return value === 'portal' || value === 'synergy'
}

export function getBrand(id: CompanyId): Brand {
  return BRANDS[id]
}

/**
 * Extra domains can be allowed without a code change via
 * ALLOWED_EMAIL_DOMAINS="portaltechnology.au:portal,example.com:synergy".
 */
function extraDomains(): Array<{ domain: string; company: CompanyId }> {
  const raw = process.env.ALLOWED_EMAIL_DOMAINS
  if (!raw) return []
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [domain, company] = entry.split(':').map((part) => part?.trim())
      return { domain: (domain ?? '').toLowerCase(), company }
    })
    .filter(
      (entry): entry is { domain: string; company: CompanyId } =>
        entry.domain.length > 0 && isCompanyId(entry.company),
    )
}

/** Which company an address belongs to, or null if it isn't a staff address. */
export function companyForEmail(email: string): CompanyId | null {
  const domain = email.trim().toLowerCase().split('@')[1]
  if (!domain) return null
  for (const id of COMPANY_IDS) {
    if (BRANDS[id].emailDomains.includes(domain)) return id
  }
  return extraDomains().find((entry) => entry.domain === domain)?.company ?? null
}

export function allDomainsFor(company: CompanyId): string[] {
  return [
    ...BRANDS[company].emailDomains,
    ...extraDomains()
      .filter((entry) => entry.company === company)
      .map((entry) => entry.domain),
  ]
}

export function allAllowedDomains(): string[] {
  const builtIn = COMPANY_IDS.flatMap((id) => BRANDS[id].emailDomains)
  const extra = extraDomains().map((e) => e.domain)
  return Array.from(new Set([...builtIn, ...extra]))
}

