'use client'

import type { Brand } from '@/lib/brand'
import { NPS_VALUES, SCALE_VALUES, fill, type Question } from '@/lib/survey'

export function QuestionField({
  question,
  brand,
  value,
  error,
  onChange,
}: {
  question: Question
  brand: Brand
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  const label = fill(question.label, brand)
  const help = question.help ? fill(question.help, brand) : null
  const describedBy = [help && `${question.id}-help`, error && `${question.id}-error`]
    .filter(Boolean)
    .join(' ')

  return (
    <fieldset className="border-0 p-0">
      <legend className="q-label">
        {label}
        {question.required ? (
          <span className="ml-1 font-normal text-orange" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-2 align-middle text-[11px] font-medium uppercase tracking-wide text-slate-400">
            optional
          </span>
        )}
      </legend>

      {help && (
        <p id={`${question.id}-help`} className="q-help">
          {help}
        </p>
      )}

      <div className="mt-3">
        {question.kind === 'text' && (
          <input
            type="text"
            id={question.id}
            value={value}
            maxLength={200}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            onChange={(event) => onChange(event.target.value)}
            className="field"
          />
        )}

        {question.kind === 'textarea' && (
          <textarea
            id={question.id}
            value={value}
            rows={4}
            maxLength={5000}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            onChange={(event) => onChange(event.target.value)}
            className="field min-h-[104px] resize-y leading-relaxed"
          />
        )}

        {question.kind === 'choice' && (
          <div className="grid gap-2">
            {question.choices?.map((choice) => {
              const selected = value === choice.value
              return (
                <label
                  key={choice.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-3 text-[15px] transition ${
                    selected
                      ? 'border-orange bg-orange/[0.07] text-navy'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={choice.value}
                    checked={selected}
                    onChange={() => onChange(choice.value)}
                    className="h-4.5 w-4.5 flex-none accent-orange"
                    style={{ accentColor: brand.colors.orange }}
                  />
                  <span className="font-medium">{fill(choice.label, brand)}</span>
                </label>
              )
            })}
          </div>
        )}

        {question.kind === 'scale' && (
          <RatingRow
            name={question.id}
            values={[...SCALE_VALUES]}
            value={value}
            low={question.low}
            high={question.high}
            brand={brand}
            onChange={onChange}
          />
        )}

        {question.kind === 'nps' && (
          <RatingRow
            name={question.id}
            values={NPS_VALUES}
            value={value}
            low={question.low}
            high={question.high}
            brand={brand}
            onChange={onChange}
            compact
          />
        )}
      </div>

      {error && (
        <p
          id={`${question.id}-error`}
          role="alert"
          className="mt-2 text-sm font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </fieldset>
  )
}

/**
 * Numeric rating control. Wraps rather than scrolls, so the 0–10 NPS row still
 * fits a narrow phone without a hidden horizontal scroll area.
 */
function RatingRow({
  name,
  values,
  value,
  low,
  high,
  brand,
  onChange,
  compact = false,
}: {
  name: string
  values: string[]
  value: string
  low?: string
  high?: string
  brand: Brand
  onChange: (value: string) => void
  compact?: boolean
}) {
  return (
    <div>
      {/* A grid rather than a wrapping flex row: 0–10 needs two rows on a
          phone, and flex-basis would leave the second row's cells wider. */}
      <div
        role="radiogroup"
        aria-label={name}
        className={
          compact
            ? 'grid grid-cols-6 gap-1.5 sm:grid-cols-11'
            : 'grid grid-cols-5 gap-1.5 sm:gap-2'
        }
      >
        {values.map((option) => {
          const selected = value === option
          return (
            <label
              key={option}
              className={`flex cursor-pointer select-none items-center justify-center rounded-lg border text-[15px] font-semibold transition ${
                compact ? 'h-11 sm:h-12' : 'h-12 sm:h-14 sm:text-base'
              } ${
                selected
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              }`}
              style={selected ? { backgroundColor: brand.colors.orange } : undefined}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={selected}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option}
            </label>
          )
        })}
      </div>
      {(low || high) && (
        <div className="mt-2 flex justify-between gap-3 text-[12.5px] text-slate-500">
          <span>
            {values[0]} — {low}
          </span>
          <span className="text-right">
            {values[values.length - 1]} — {high}
          </span>
        </div>
      )}
    </div>
  )
}
