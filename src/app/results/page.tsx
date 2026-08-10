import { getResultsSession } from '@/lib/session'
import { listSubmissions } from '@/lib/submissions'
import { ResultsLogin } from './ResultsLogin'
import { ResultsDashboard } from './ResultsDashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Staff Check-in Results',
  robots: { index: false, follow: false },
}

export default async function ResultsPage() {
  const session = await getResultsSession()
  if (!session) return <ResultsLogin />

  // Decryption happens only here, after the allowlist check has passed.
  const submissions = await listSubmissions()

  return (
    <ResultsDashboard
      viewerEmail={session.email}
      submissions={submissions.map((submission) => ({
        id: submission.id,
        company: submission.company,
        name: submission.name,
        email: submission.email,
        answers: submission.answers,
        updatedAt: submission.updatedAt.toISOString(),
        revision: submission.revision,
      }))}
    />
  )
}
