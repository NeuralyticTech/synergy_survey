import type { CompanyId } from './brand'
import type { StoredSubmission } from './submissions'
import {
  ALL_QUESTIONS,
  NPS_VALUES,
  SCALE_VALUES,
  type Answers,
  type Question,
} from './survey'

export interface Distribution {
  value: string
  label: string
  count: number
  share: number
}

export interface ChartableSummary {
  question: Question
  answered: number
  /** Present for scale/nps questions. */
  average: number | null
  /** NPS questions only: promoters − detractors, as a percentage. */
  npsScore: number | null
  distribution: Distribution[]
}

export interface FreeTextAnswer {
  submissionId: string
  name: string
  company: CompanyId
  text: string
}

export interface Aggregate {
  total: number
  byCompany: Record<CompanyId, number>
  charts: ChartableSummary[]
  freeText: Array<{ question: Question; answers: FreeTextAnswer[] }>
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/**
 * Net Promoter Score on the standard 0–10 banding: 9–10 promoters,
 * 7–8 passives, 0–6 detractors.
 */
function netPromoterScore(values: number[]): number | null {
  if (values.length === 0) return null
  const promoters = values.filter((value) => value >= 9).length
  const detractors = values.filter((value) => value <= 6).length
  return Math.round(((promoters - detractors) / values.length) * 100)
}

function optionsFor(question: Question): Array<{ value: string; label: string }> {
  switch (question.kind) {
    case 'choice':
      return question.choices ?? []
    case 'scale':
      return SCALE_VALUES.map((value) => ({ value, label: value }))
    case 'nps':
      return NPS_VALUES.map((value) => ({ value, label: value }))
    default:
      return []
  }
}

export function summarise(submissions: StoredSubmission[]): Aggregate {
  const charts: ChartableSummary[] = []
  const freeText: Array<{ question: Question; answers: FreeTextAnswer[] }> = []

  for (const question of ALL_QUESTIONS) {
    if (question.chartable) {
      const raw = submissions
        .map((submission) => submission.answers[question.id])
        .filter((value): value is string => Boolean(value))

      const counts = new Map<string, number>()
      for (const value of raw) counts.set(value, (counts.get(value) ?? 0) + 1)

      const distribution = optionsFor(question).map((option) => ({
        value: option.value,
        label: option.label,
        count: counts.get(option.value) ?? 0,
        share: raw.length === 0 ? 0 : (counts.get(option.value) ?? 0) / raw.length,
      }))

      const numeric =
        question.kind === 'scale' || question.kind === 'nps'
          ? raw.map(Number).filter((value) => Number.isFinite(value))
          : []

      charts.push({
        question,
        answered: raw.length,
        average: numeric.length ? mean(numeric) : null,
        npsScore: question.kind === 'nps' ? netPromoterScore(numeric) : null,
        distribution,
      })
      continue
    }

    // Name and title identify the row rather than being an answer to read.
    if (question.id === 'full_name' || question.id === 'job_title') continue

    const answers = submissions
      .map((submission) => ({
        submissionId: submission.id,
        name: submission.name,
        company: submission.company,
        text: (submission.answers[question.id] ?? '').trim(),
      }))
      .filter((answer) => answer.text.length > 0)

    if (answers.length > 0) freeText.push({ question, answers })
  }

  return {
    total: submissions.length,
    byCompany: {
      portal: submissions.filter((s) => s.company === 'portal').length,
      synergy: submissions.filter((s) => s.company === 'synergy').length,
    },
    charts,
    freeText,
  }
}

/**
 * Answers worth a manager's attention first: low workload sustainability,
 * low retention likelihood, significant tool gaps, or anything flagged urgent.
 */
export function attentionFlags(answers: Answers): string[] {
  const flags: string[] = []
  const low = (id: string, threshold = 2) => {
    const value = Number(answers[id])
    return Number.isFinite(value) && value <= threshold
  }

  if (low('workload_sustainability')) flags.push('Workload unsustainable')
  if (low('retention_likelihood')) flags.push('Retention risk')
  if (low('manager_support')) flags.push('Feels unsupported')
  if (low('recognition')) flags.push('Feels unrecognised')
  if (low('direction_clarity')) flags.push('Direction unclear')
  if (answers.tools_adequate === 'gaps') flags.push('Significant tool gaps')
  if (answers.meeting_expectations === 'no') flags.push('Not meeting expectations')
  if ((answers.urgent_flag ?? '').trim().length > 0) flags.push('Raised something urgent')
  if ((answers.pay_benefits ?? '').trim().length > 0) flags.push('Raised pay / benefits')
  if (Number(answers.nps) <= 6 && answers.nps !== undefined && answers.nps !== '')
    flags.push('NPS detractor')

  return flags
}
