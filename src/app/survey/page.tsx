import { redirect } from 'next/navigation'
import { BrandShell } from '@/components/BrandShell'
import { getBrand } from '@/lib/brand'
import { getSurveySession } from '@/lib/session'
import { hasSubmitted } from '@/lib/submissions'
import { SurveyForm } from './SurveyForm'

export const dynamic = 'force-dynamic'

export default async function SurveyPage() {
  const session = await getSurveySession()
  if (!session) redirect('/')

  const brand = getBrand(session.company)
  const alreadySubmitted = await hasSubmitted(session.email)

  return (
    <BrandShell brand={brand}>
      <SurveyForm
        brand={brand}
        email={session.email}
        alreadySubmitted={alreadySubmitted}
      />
    </BrandShell>
  )
}
