'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

/**
 * Deliberately vague on success: an unlisted address gets the same message as
 * an allowlisted one, so this page can't be used to probe who has access.
 */
export function ResultsLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function requestLink(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'results' }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSent(true)
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
      router.refresh()
      router.push(data.redirectTo ?? '/results')
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1d285a] via-[#ee7522] to-[#f7941d]" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6 sm:py-20">
        <div className="card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Restricted
          </p>
          <h1 className="mt-2 text-2xl text-[#1c2949]">Staff check-in results</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            This dashboard is limited to Michael (Synergy) and Nigel (Portal).
            Sign in with your work email to continue.
          </p>

          {!sent ? (
            <form onSubmit={requestLink} className="mt-6">
              <label htmlFor="results-email" className="q-label">
                Email address
              </label>
              <input
                id="results-email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field mt-2.5"
              />
              <button
                type="submit"
                disabled={busy || email.trim().length < 5}
                className="mt-3.5 w-full rounded-lg bg-[#f7941d] px-5 py-3 text-base font-semibold text-white transition hover:brightness-95 disabled:opacity-55"
              >
                {busy ? 'Sending…' : 'Email me a sign-in link'}
              </button>
            </form>
          ) : (
            <div className="mt-6">
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
                If that address has access, a sign-in link and 6-digit code are on
                their way.
              </p>

              <form onSubmit={submitCode} className="mt-5">
                <label htmlFor="results-code" className="q-label">
                  Enter the 6-digit code
                </label>
                <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    id="results-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="123456"
                    className="field text-center font-mono text-xl tracking-[0.35em] sm:max-w-[11rem] sm:text-left"
                  />
                  <button
                    type="submit"
                    disabled={busy || code.length !== 6}
                    className="rounded-lg bg-[#1c2949] px-5 py-3 text-base font-semibold text-white transition hover:brightness-125 disabled:opacity-55"
                  >
                    {busy ? 'Checking…' : 'Sign in'}
                  </button>
                </div>
              </form>

              <button
                type="button"
                onClick={() => {
                  setSent(false)
                  setCode('')
                  setError(null)
                }}
                className="mt-4 text-sm text-slate-500 underline decoration-dotted hover:text-slate-800"
              >
                Use a different address
              </button>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800"
            >
              {error}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
