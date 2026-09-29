'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUp } from '../../actions/auth'

const boundSignUp = signUp.bind(null, 'CLIENT')

export default function RegisterClientPage() {
  const [state, action, isPending] = useActionState(boundSignUp, null)

  return (
    <div className="auth-wrapper">
      <nav className="auth-nav">
        <Link href="/" className="logo">CleverCrack</Link>
        <span className="text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </span>
      </nav>

      <div className="auth-body">
        <div className="auth-single-card">
          <div className="auth-header">
            <div className="auth-logo-text" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>
              🏢 Hire a Remote Expert
            </div>
            <p className="auth-tagline">Create your client account — it takes 2 minutes.</p>
          </div>

          {state?.error && (
            <div className="form-error mb-4">⚠ {state.error}</div>
          )}

          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Work Email *</label>
              <input
                name="email"
                type="email"
                placeholder="you@company.com"
                className="form-input"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                name="password"
                type="password"
                placeholder="At least 8 characters"
                className="form-input"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-full mt-2"
              disabled={isPending}
              style={{ padding: '15px' }}
            >
              {isPending ? 'Creating account…' : 'Create Client Account →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--cyan-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,194,255,0.2)' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
              ✓ Access 100+ vetted remote experts<br />
              ✓ Flat monthly rates from $800<br />
              ✓ Cancel anytime, no contracts
            </p>
          </div>

          <p className="text-center mt-6" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Looking to work as a freelancer?{' '}
            <Link href="/register/freelancer">Apply here →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
