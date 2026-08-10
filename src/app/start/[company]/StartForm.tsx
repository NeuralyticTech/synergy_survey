'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { CompanyId } from '@/lib/brand'

type Stage = 'email' | 'sent'

export function StartForm({
  company,
  domains,
}: {
  company?: CompanyId
  domains: string[]
}) {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function requestLink(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const response = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, purpose: 'survey' }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setStage('sent')
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function submitCode(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'That code did not work.')
        return
      }
      router.push(data.redirectTo ?? '/survey')
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, purpose: 'survey' }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Could not send another email just yet.')
        return
      }
      setNotice('Sent again — give it a minute to arrive.')
    } finally {
      setBusy(false)
    }
  }

  if (stage === 'sent') {
    return (
      <section className="card animate-fade-up p-5 sm:p-7">
        <div className="flex items-start gap-3.5">
          <span
            className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-full bg-orange/12 text-lg text-orange"
            aria-hidden
          >
            ✓
          </span>
          <div className="min-w-0">
            <h2 className="text-lg text-navy">Check your inbox</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              We&apos;ve emailed a confirmation link to{' '}
              <strong className="break-all font-semibold text-navy">{email}</strong>.
              Click it to open your survey — the link works for 7 days, on any device.
            </p>
          </div>
        </div>

        <form onSubmit={submitCode} className="mt-6 border-t border-slate-200 pt-5">
          <label htmlFor="code" className="q-label">
            Prefer to type it in? Enter the 6-digit code from the email
          </label>
          <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="123456"
              className="field font-mono text-center text-xl tracking-[0.35em] sm:max-w-[11rem] sm:text-left"
            />
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="btn-primary sm:flex-none"
            >
              {busy ? 'Checking…' : 'Continue'}
            </button>
          </div>
        </form>

        {error && <Alert tone="error">{error}</Alert>}
        {notice && <Alert tone="ok">{notice}</Alert>}

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <button
            type="button"
            onClick={resend}
            disabled={busy}
            className="text-slate-500 underline decoration-dotted hover:text-navy disabled:opacity-50"
          >
            Send the email again
          </button>
          <button
            type="button"
            onClick={() => {
              setStage('email')
              setCode('')
              setError(null)
              setNotice(null)
            }}
            className="text-slate-500 underline decoration-dotted hover:text-navy"
          >
            Use a different address
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="card animate-fade-up p-5 sm:p-7">
      <h2 className="text-lg text-navy">Confirm your work email to begin</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        Only {domains.map((domain) => `@${domain}`).join(' or ')} addresses can open
        this survey. We&apos;ll email you a link to get started.
      </p>

      <form onSubmit={requestLink} className="mt-5">
        <label htmlFor="email" className="q-label">
          Work email address
        </label>
        <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={`you@${domains[0]}`}
            className="field sm:flex-1"
          />
          <button
            type="submit"
            disabled={busy || email.trim().length < 5}
            className="btn-primary sm:flex-none"
          >
            {busy ? 'Sending…' : 'Email me the link'}
          </button>
        </div>
        {error && <Alert tone="error">{error}</Alert>}
      </form>
    </section>
  )
}

function Alert({
  tone,
  children,
}: {
  tone: 'error' | 'ok'
  children: React.ReactNode
}) {
  const styles =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mt-3.5 rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed ${styles}`}
    >
      {children}
    </p>
  )
}
