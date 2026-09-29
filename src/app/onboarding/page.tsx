import Link from 'next/link'

export default function OnboardingSelection() {
  return (
    <div className="onboarding-wrapper">
      <nav className="navbar">
        <Link href="/" className="logo">CleverCrack</Link>
      </nav>

      <div className="onboarding-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 68px)' }}>
        <div className="auth-header text-center mb-8">
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Welcome to CleverCrack! 👋
          </h1>
          <p className="text-secondary">How would you like to use the platform?</p>
        </div>

        <div className="dual-card-container" style={{ maxWidth: '760px' }}>
          <Link href="/onboarding/client" style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
            <div className="login-card" style={{ cursor: 'pointer', gap: '16px', height: '100%' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '4px' }}>🏢</div>
              <h2 className="card-title">I am a Client</h2>
              <p className="card-desc">I want to hire remote experts for IT, admin, bookkeeping, and more.</p>
              <div className="btn-primary btn-full" style={{ textAlign: 'center', marginTop: 'auto' }}>
                Continue as Client →
              </div>
            </div>
          </Link>

          <Link href="/onboarding/freelancer" style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
            <div className="login-card" style={{ cursor: 'pointer', gap: '16px', height: '100%' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '4px' }}>💻</div>
              <h2 className="card-title">I am a Freelancer</h2>
              <p className="card-desc">I am a professional looking to join the talent pool and earn remotely.</p>
              <div className="btn-primary btn-alt btn-full" style={{ textAlign: 'center', marginTop: 'auto' }}>
                Continue as Freelancer →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
