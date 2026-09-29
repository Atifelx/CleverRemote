'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUp } from '../../actions/auth'

const boundSignUp = signUp.bind(null, 'FREELANCER')

export default function RegisterFreelancerPage() {
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
              👨‍💻 Join as a Freelancer
            </div>
            <p className="auth-tagline">Create your profile and start earning remotely across 10+ service areas.</p>
          </div>

          {state?.error && (
            <div className="form-error mb-4">⚠ {state.error}</div>
          )}

          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                name="email"
                type="email"
                placeholder="you@email.com"
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
              className="btn-primary btn-alt btn-full mt-2"
              disabled={isPending}
              style={{ padding: '15px' }}
            >
              {isPending ? 'Creating account…' : 'Create Freelancer Account →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--purple-dim)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.55' }}>
              ✓ Earn $800–$1,500/month per client<br />
              ✓ Work fully remote, on your terms<br />
              ✓ Join 100+ freelancers already earning
            </p>
          </div>

          <p className="text-center mt-6" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Looking to hire?{' '}
            <Link href="/register/client">Sign up as Client →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
