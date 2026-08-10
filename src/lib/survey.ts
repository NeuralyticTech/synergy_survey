import type { Brand } from './brand'

export type QuestionKind = 'text' | 'textarea' | 'choice' | 'scale' | 'nps'

export interface Choice {
  value: string
  label: string
}

export interface Question {
  id: string
  kind: QuestionKind
  /** May contain {BRAND}, {MANAGER} and {OTHER_MANAGER} placeholders. */
  label: string
  help?: string
  required?: boolean
  /** choice only */
  choices?: Choice[]
  /** scale only — 1..5 with endpoint captions */
  low?: string
  high?: string
  /** Free-text answers are never charted; scales/choices/nps are. */
  chartable?: boolean
}

export interface Section {
  id: string
  number: number
  title: string
  blurb?: string
  questions: Question[]
}

const YES_NO: Choice[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

export const SECTIONS: Section[] = [
  {
    id: 'role-structure',
    number: 1,
    title: 'Your role & structure',
    blurb: 'The basics — who you are and how your role is set up.',
    questions: [
      {
        id: 'full_name',
        kind: 'text',
        label: 'Full name',
        required: true,
      },
      {
        id: 'job_title',
        kind: 'text',
        label: 'Current job title',
        required: true,
      },
      {
        id: 'purpose_description',
        kind: 'textarea',
        label: 'In one sentence, how would you describe what the business does?',
        help: "There's no right answer — this just helps us understand how clearly our direction and purpose are landing.",
      },
      {
        id: 'has_jd',
        kind: 'choice',
        label: 'Do you currently have a formal, written job description (JD)?',
        required: true,
        chartable: true,
        choices: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No / not sure' },
        ],
      },
      {
        id: 'core_responsibilities',
        kind: 'textarea',
        label: 'In your own words, what are your core day-to-day responsibilities?',
        help: 'If you have a JD, feel free to summarise rather than repeat it.',
      },
      {
        id: 'line_manager',
        kind: 'text',
        label: 'Who do you consider your direct line manager?',
      },
      {
        id: 'reporting_method',
        kind: 'textarea',
        label: 'How do you currently report to them?',
        help: 'e.g. daily huddles, weekly 1-on-1s, informal chats.',
      },
      {
        id: 'feedback_method',
        kind: 'textarea',
        label:
          'How do you currently receive feedback on your performance? Is it clear, timely and useful?',
      },
    ],
  },
  {
    id: 'performance-wellbeing',
    number: 2,
    title: 'Your role, performance & well-being',
    blurb: 'How the job is actually going for you day to day.',
    questions: [
      {
        id: 'meeting_expectations',
        kind: 'choice',
        label:
          "Thinking about your role and responsibilities, do you feel you're meeting the business's expectations?",
        required: true,
        chartable: true,
        choices: YES_NO,
      },
      {
        id: 'expectations_detail',
        kind: 'textarea',
        label:
          "If no — what's getting in the way? If yes — what's an example you're proud of?",
      },
      {
        id: 'role_vs_expected',
        kind: 'textarea',
        label:
          'Are your role and responsibilities in line with what you personally expected when you took it on?',
      },
      {
        id: 'role_changes',
        kind: 'textarea',
        label: 'What, if anything, would you like to see different about your role?',
      },
      {
        id: 'going_well',
        kind: 'textarea',
        label:
          "What's going really well for you right now? What are you enjoying most?",
      },
      {
        id: 'blockers',
        kind: 'textarea',
        label:
          "Are there any blockers you've come across that get in the way of doing your best work?",
      },
      {
        id: 'workload_sustainability',
        kind: 'scale',
        label: 'Overall, how sustainable does your current workload feel?',
        required: true,
        chartable: true,
        low: 'Unsustainable',
        high: 'Very sustainable',
      },
      {
        id: 'urgent_flag',
        kind: 'textarea',
        label:
          "Is there anything urgent you'd like to flag that you need to speak to Nigel & Michael or your manager about as a priority?",
        help: "Optional — leave blank if there's nothing pressing.",
      },
    ],
  },
  {
    id: 'tools-environment',
    number: 3,
    title: 'Tools, collaboration & environment',
    blurb: 'Whether you have what you need, and how well we work together.',
    questions: [
      {
        id: 'tools_adequate',
        kind: 'choice',
        label:
          'Do you have the right hardware, software and tools to do your job efficiently?',
        required: true,
        chartable: true,
        choices: [
          { value: 'everything', label: 'Yes, everything I need' },
          { value: 'mostly', label: 'Mostly, but some things could improve' },
          { value: 'gaps', label: 'No, there are significant gaps' },
        ],
      },
      {
        id: 'tools_needed',
        kind: 'textarea',
        label:
          'If you chose “Mostly” or “No” — what specific tools, software, hardware or access do you need?',
      },
      {
        id: 'team_collaboration',
        kind: 'scale',
        label: 'How well do teams across the business communicate and collaborate?',
        required: true,
        chartable: true,
        low: 'Poorly',
        high: 'Very well',
      },
      {
        id: 'collaboration_ideas',
        kind: 'textarea',
        label: 'Is there anything we could do to help teams work together better?',
      },
    ],
  },
  {
    id: 'manager-leadership',
    number: 4,
    title: 'Manager & leadership',
    blurb: 'Support, direction and recognition.',
    questions: [
      {
        id: 'manager_support',
        kind: 'scale',
        label: 'Do you feel supported by your manager?',
        required: true,
        chartable: true,
        low: 'Not supported',
        high: 'Very supported',
      },
      {
        id: 'manager_expectations',
        kind: 'choice',
        label:
          "Do you have specific expectations of your manager, and do you feel they're meeting them?",
        required: true,
        chartable: true,
        choices: [
          { value: 'meeting', label: "Yes, they're meeting them" },
          { value: 'not_fully', label: 'Not fully' },
        ],
      },
      {
        id: 'manager_expectations_detail',
        kind: 'textarea',
        label:
          "If yes — what are they doing well that you'd like them to keep doing? If not — what could improve?",
      },
      {
        id: 'direction_clarity',
        kind: 'scale',
        label:
          'Do you feel you get clear direction and visibility on company goals and decisions?',
        required: true,
        chartable: true,
        low: 'Not clear',
        high: 'Very clear',
      },
      {
        id: 'leadership_feedback',
        kind: 'textarea',
        label:
          "Any constructive feedback you'd like to share with leadership about business direction, culture or day-to-day operations?",
        help:
          "Remember this goes only to Nigel & Michael — but if you'd rather raise something in person at your 1-on-1 instead of in writing, that's fine too.",
      },
      {
        id: 'recognition',
        kind: 'scale',
        label:
          'I feel my contributions and achievements are recognised and appreciated.',
        required: true,
        chartable: true,
        low: 'Strongly disagree',
        high: 'Strongly agree',
      },
    ],
  },
  {
    id: 'growth-culture',
    number: 5,
    title: 'Growth, development & culture',
    blurb: 'Where you want to get to, and how it feels to work here.',
    questions: [
      {
        id: 'has_goals',
        kind: 'choice',
        label: 'Do you currently have clear, defined performance or business goals?',
        required: true,
        chartable: true,
        choices: YES_NO,
      },
      {
        id: 'set_goals',
        kind: 'textarea',
        label:
          'Would you like to set formal goals or key results together for the next 6–12 months?',
      },
      {
        id: 'project_interest',
        kind: 'textarea',
        label:
          "Outside of formal KPIs, is there a project or part of the business you'd love to be more involved in?",
      },
      {
        id: 'leadership_interest',
        kind: 'textarea',
        label:
          'Do you have any interest in moving toward a management or leadership role over time?',
      },
      {
        id: 'learning_goals',
        kind: 'textarea',
        label:
          'What are your goals for self-learning and growth over the next year?',
        help: 'Courses, certifications, vendor training, skills.',
      },
      {
        id: 'what_you_like',
        kind: 'textarea',
        label: 'What do you like about working here?',
      },
      {
        id: 'travel',
        kind: 'textarea',
        label: 'How do you feel about travelling for work?',
      },
      {
        id: 'retention_likelihood',
        kind: 'scale',
        label: 'Realistically, how likely are you to still be with us in 12 months?',
        required: true,
        chartable: true,
        low: 'Very unlikely',
        high: 'Very likely',
      },
      {
        id: 'nps',
        kind: 'nps',
        label:
          'On a scale of 0–10, how likely are you to recommend working here to a friend or colleague as a good place to work?',
        required: true,
        chartable: true,
        low: 'Not at all likely',
        high: 'Extremely likely',
      },
      {
        id: 'pay_benefits',
        kind: 'textarea',
        label:
          "Is there anything about pay, benefits or recognition you'd like to raise?",
        help: "Optional — no pressure to answer if you'd rather discuss this in person.",
      },
    ],
  },
  {
    id: 'final-thoughts',
    number: 6,
    title: 'Final thoughts & next steps',
    questions: [
      {
        id: 'one_change',
        kind: 'textarea',
        label:
          'If you could change or improve just ONE thing about your role or the company, what would it be?',
        help: 'Pick the one that would make the biggest difference — not a full list.',
      },
      {
        id: 'anything_else',
        kind: 'textarea',
        label: "Anything else you'd like to share that wasn't covered above?",
      },
      {
        id: 'followup_preference',
        kind: 'choice',
        label: 'Who would you prefer to book your follow-up 1-on-1 with?',
        required: true,
        chartable: true,
        choices: [
          { value: 'nigel', label: 'Nigel' },
          { value: 'michael', label: 'Michael' },
          { value: 'both', label: 'Nigel & Michael' },
          { value: 'either', label: 'Direct line manager / Either' },
        ],
      },
    ],
  },
]

export const ALL_QUESTIONS: Question[] = SECTIONS.flatMap((s) => s.questions)

export const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  ALL_QUESTIONS.map((q) => [q.id, q]),
)

/** Substitute the brand placeholders in any question or option label. */
export function fill(template: string, brand?: Brand): string {
  const brandName = brand ? brand.name : 'the business'
  return template
    .replaceAll('{BRAND}', brandName)
    .replaceAll('{MANAGER}', 'Nigel & Michael')
    .replaceAll('{OTHER_MANAGER}', 'Nigel & Michael')
}


export const SCALE_VALUES = ['1', '2', '3', '4', '5'] as const
export const NPS_VALUES = Array.from({ length: 11 }, (_, i) => String(i))

export type Answers = Record<string, string>

export interface ValidationResult {
  ok: boolean
  /** questionId -> message */
  errors: Record<string, string>
  cleaned: Answers
}

const MAX_TEXT = 200
const MAX_TEXTAREA = 5000

/**
 * Shared by the client (for inline errors) and the API route (which must never
 * trust the client). Trims, length-caps and checks allowed values.
 */
export function validate(answers: Answers): ValidationResult {
  const errors: Record<string, string> = {}
  const cleaned: Answers = {}

  for (const question of ALL_QUESTIONS) {
    const raw = (answers[question.id] ?? '').toString()
    const value = raw.trim()

    if (!value) {
      if (question.required) errors[question.id] = 'This one is required.'
      continue
    }

    switch (question.kind) {
      case 'text':
        cleaned[question.id] = value.slice(0, MAX_TEXT)
        break
      case 'textarea':
        cleaned[question.id] = value.slice(0, MAX_TEXTAREA)
        break
      case 'choice':
        if (!question.choices?.some((c) => c.value === value)) {
          errors[question.id] = 'Please pick one of the options.'
        } else {
          cleaned[question.id] = value
        }
        break
      case 'scale':
        if (!SCALE_VALUES.includes(value as (typeof SCALE_VALUES)[number])) {
          errors[question.id] = 'Please choose a rating from 1 to 5.'
        } else {
          cleaned[question.id] = value
        }
        break
      case 'nps':
        if (!NPS_VALUES.includes(value)) {
          errors[question.id] = 'Please choose a number from 0 to 10.'
        } else {
          cleaned[question.id] = value
        }
        break
    }
  }

  return { ok: Object.keys(errors).length === 0, errors, cleaned }
}

export function firstSectionWithError(errors: Record<string, string>): number {
  const index = SECTIONS.findIndex((section) =>
    section.questions.some((q) => errors[q.id]),
  )
  return index === -1 ? 0 : index
}
