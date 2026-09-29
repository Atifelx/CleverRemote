'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signIn } from '../actions/auth'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(signIn, null)

  return (
    <div className="auth-wrapper">
      <nav className="auth-nav">
        <Link href="/" className="logo">CleverCrack</Link>
        <span className="text-sm text-muted">Remote IT & Business Support</span>
      </nav>

      <div className="auth-body">
        <div className="auth-dual-layout">
          <div className="auth-header">
            <div className="auth-logo-text text-gradient">CleverCrack</div>
            <p className="auth-tagline">Sign in to your account</p>
          </div>

          {state?.error && (
            <div className="form-error mb-6" style={{ maxWidth: '980px' }}>
              ⚠ {state.error}
            </div>
          )}

          <div className="dual-card-container">
            {/* Client Login */}
            <div className="login-card">
              <div className="card-header">
                <span className="icon">🏢</span>
                <h2>I want to hire an Expert</h2>
              </div>
              <h3 className="card-title">Client Login</h3>
              <p className="card-desc">Find and manage your dedicated remote experts.</p>

              <form className="login-form" action={action}>
                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input name="email" type="email" placeholder="you@company.com" className="form-input" autoComplete="email" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input name="password" type="password" placeholder="••••••••" className="form-input" autoComplete="current-password" required />
                </div>
                <div className="forgot-pass">
                  <a href="#">Forgot password?</a>
                </div>
                <button type="submit" className="btn-primary btn-full mt-4" disabled={isPending}>
                  {isPending ? 'Signing in…' : 'Sign In as Client'}
                </button>
              </form>

              <div className="card-footer">
                Don&apos;t have an account?{' '}
                <Link href="/register/client">Sign up as Client</Link>
              </div>
            </div>

            {/* Engineer Login */}
            <div className="login-card">
              <div className="card-header">
                <span className="icon">👨‍💻</span>
                <h2>I am a Freelancer</h2>
              </div>
              <h3 className="card-title">Freelancer Login</h3>
              <p className="card-desc">Access your dashboard, clients, and earnings.</p>

              <form className="login-form" action={action}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" placeholder="you@email.com" className="form-input" autoComplete="email" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input name="password" type="password" placeholder="••••••••" className="form-input" autoComplete="current-password" required />
                </div>
                <div className="forgot-pass">
                  <a href="#">Forgot password?</a>
                </div>
                <button type="submit" className="btn-primary btn-alt btn-full mt-4" disabled={isPending}>
                  {isPending ? 'Signing in…' : 'Sign In as Freelancer'}
                </button>
              </form>

              <div className="card-footer">
                New here?{' '}
                <Link href="/register/freelancer">Apply as Freelancer</Link>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            By signing in, you agree to our{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
