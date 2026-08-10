'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { QuestionField } from '@/components/QuestionField'
import type { Brand } from '@/lib/brand'
import {
  SECTIONS,
  type Answers,
  firstSectionWithError,
  validate,
} from '@/lib/survey'

const DRAFT_VERSION = 1

function draftKey(email: string) {
  return `sfs-draft:${DRAFT_VERSION}:${email}`
}

export function SurveyForm({
  brand,
  email,
  alreadySubmitted,
}: {
  brand: Brand
  email: string
  alreadySubmitted: boolean
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const section = SECTIONS[step]
  const isLast = step === SECTIONS.length - 1

  // Answers live in this browser until submitted, so a closed tab or a flat
  // battery doesn't cost someone 15 minutes of writing.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(draftKey(email))
      if (!stored) return
      const parsed = JSON.parse(stored) as { answers?: Answers; step?: number }
      if (parsed.answers && Object.keys(parsed.answers).length > 0) {
        setAnswers(parsed.answers)
        setStep(Math.min(Math.max(parsed.step ?? 0, 0), SECTIONS.length - 1))
        setDraftRestored(true)
      }
    } catch {
      // A corrupt draft is not worth surfacing; just start fresh.
    }
  }, [email])

  useEffect(() => {
    if (Object.keys(answers).length === 0) return
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          draftKey(email),
          JSON.stringify({ answers, step }),
        )
        setSavedAt(new Date())
      } catch {
        // Private browsing with no storage quota — carry on regardless.
      }
    }, 400)
    return () => window.clearTimeout(timer)
  }, [answers, step, email])

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }))
    setErrors((current) => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }, [])

  const focusTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    headingRef.current?.focus()
  }, [])

  /** Required questions in *this* step only, so people aren't blocked early. */
  function validateStep(): boolean {
    const stepErrors: Record<string, string> = {}
    for (const question of section.questions) {
      if (!question.required) continue
      const single = validate({ [question.id]: answers[question.id] ?? '' })
      if (single.errors[question.id]) {
        stepErrors[question.id] = single.errors[question.id]
      }
    }
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length > 0) {
      const firstId = Object.keys(stepErrors)[0]
      document
        .getElementById(`q-${firstId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return false
    }
    return true
  }

  function goNext() {
    if (!validateStep()) return
    setStep((current) => Math.min(current + 1, SECTIONS.length - 1))
    focusTop()
  }

  function goBack() {
    setErrors({})
    setStep((current) => Math.max(current - 1, 0))
    focusTop()
  }

  async function submit() {
    const result = validate(answers)
    if (!result.ok) {
      setErrors(result.errors)
      const target = firstSectionWithError(result.errors)
      setStep(target)
      setSubmitError(
        'A few required questions still need an answer — they are highlighted below.',
      )
      focusTop()
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: result.cleaned }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors)
          setStep(firstSectionWithError(data.errors))
        }
        setSubmitError(data.error ?? 'We could not save your answers. Please retry.')
        focusTop()
        return
      }
      try {
        window.localStorage.removeItem(draftKey(email))
      } catch {
        /* nothing to clean up */
      }
      router.push('/survey/done')
    } catch {
      setSubmitError(
        'We could not reach the server. Your answers are saved in this browser — check your connection and try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const progress = useMemo(
    () => Math.round(((step + 1) / SECTIONS.length) * 100),
    [step],
  )

  return (
    <div>
      {alreadySubmitted && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-relaxed text-amber-900">
          <strong className="font-semibold">
            You&apos;ve already submitted a response.
          </strong>{' '}
          You&apos;re welcome to fill it in again — doing so replaces your previous
          answers.
        </div>
      )}

      {draftRestored && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm leading-relaxed text-slate-600">
          We&apos;ve restored the answers you had in progress on this device.
        </div>
      )}

      {/* Progress */}
      <div className="no-print">
        <div className="flex items-end justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Part {section.number} of {SECTIONS.length}
          </p>
          <p className="text-xs text-slate-400">{progress}% through</p>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={SECTIONS.length}
          aria-label="Survey progress"
        >
          <div
            className="h-full rounded-full bg-orange transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step chips: skip ahead once you've been there. Desktop only. */}
        <nav className="mt-3 hidden flex-wrap gap-1.5 sm:flex" aria-label="Survey parts">
          {SECTIONS.map((item, index) => {
            const state =
              index === step ? 'current' : index < step ? 'done' : 'upcoming'
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (index === step) return
                  if (index > step && !validateStep()) return
                  setStep(index)
                  focusTop()
                }}
                aria-current={index === step ? 'step' : undefined}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  state === 'current'
                    ? 'bg-navy text-white'
                    : state === 'done'
                      ? 'bg-orange/12 text-navy hover:bg-orange/20'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {item.number}. {item.title}
              </button>
            )
          })}
        </nav>
      </div>

      <section key={section.id} className="mt-7 animate-fade-up">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-[23px] leading-tight text-navy outline-none sm:text-[28px]"
        >
          {section.title}
        </h1>
        {section.blurb && (
          <p className="mt-1.5 text-[15px] text-slate-600">{section.blurb}</p>
        )}

        <div className="mt-6 space-y-5">
          {section.questions.map((question) => (
            <div
              key={question.id}
              id={`q-${question.id}`}
              className={`card p-4 sm:p-5 ${
                errors[question.id] ? 'border-red-300 ring-1 ring-red-100' : ''
              }`}
            >
              <QuestionField
                question={question}
                brand={brand}
                value={answers[question.id] ?? ''}
                error={errors[question.id]}
                onChange={(value) => setAnswer(question.id, value)}
              />
            </div>
          ))}
        </div>

        {submitError && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800"
          >
            {submitError}
          </p>
        )}

        {isLast && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-[13.5px] leading-relaxed text-slate-600">
            Once you&apos;ve submitted, please book a 30-minute follow-up chat
            directly in {brand.manager.firstName}&apos;s calendar. Thanks again for
            taking the time.
          </div>
        )}

        {/* Sticky on mobile so the buttons are always within thumb reach. */}
        <div className="no-print sticky bottom-0 z-10 -mx-4 mt-7 border-t border-slate-200 bg-slate-50/95 px-4 py-3.5 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button type="button" onClick={goBack} className="btn-secondary flex-none">
                Back
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="btn-primary flex-1 sm:flex-none"
              >
                {submitting ? 'Submitting…' : 'Submit my answers'}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="btn-primary flex-1 sm:flex-none"
              >
                Continue
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[11.5px] text-slate-400 sm:mt-3 sm:text-left">
            {savedAt
              ? `Draft saved in this browser at ${savedAt.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}. Nothing is sent until you submit.`
              : 'Your progress is saved in this browser as you type. Nothing is sent until you submit.'}
          </p>
        </div>
      </section>
    </div>
  )
}
