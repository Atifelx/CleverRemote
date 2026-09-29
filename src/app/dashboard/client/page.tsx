import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '../../actions/auth'

const MOCK_ENGINEERS = [
  { initials: 'AK', name: 'Ahmed K.', role: 'M365 & Intune Specialist', status: 'Active', since: 'Jan 2026', grad: 'linear-gradient(135deg,#00C2FF,#0094CC)', skills: ['Intune', 'Azure AD'] },
  { initials: 'SR', name: 'Sara R.', role: 'SharePoint Developer', status: 'Active', since: 'Mar 2026', grad: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', skills: ['SharePoint', 'Teams'] },
]

const MOCK_ACTIVITY = [
  { icon: '✅', text: 'Ahmed resolved 3 Intune policy issues', time: '2 hours ago' },
  { icon: '📋', text: 'Monthly report submitted by Sara R.', time: 'Yesterday' },
  { icon: '🔒', text: 'Security audit completed — 0 critical findings', time: '3 days ago' },
  { icon: '🆕', text: 'New engineer match available for your requirements', time: '5 days ago' },
]

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let profile: Record<string, unknown> | null = null
  try {
    const { data } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = data
  } catch { /* table may not exist yet */ }

  const displayName = (profile?.name as string) ?? user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'Client'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/" className="logo">CleverCrack</Link>
        </div>
        <nav className="sidebar-nav">
          <a className="sidebar-item active" href="/dashboard/client">
            <span className="icon">📊</span> Dashboard
          </a>
          <a className="sidebar-item" href="/talent">
            <span className="icon">🔍</span> Browse Engineers
          </a>
          <a className="sidebar-item" href="#">
            <span className="icon">👥</span> My Engineers
          </a>
          <div className="sidebar-section-label">Account</div>
          <a className="sidebar-item" href="#">
            <span className="icon">💳</span> Billing
          </a>
          <a className="sidebar-item" href="#">
            <span className="icon">⚙️</span> Settings
          </a>
        </nav>
        <div className="sidebar-footer">
          <form action={signOut}>
            <button type="submit" className="sidebar-item btn-danger" style={{ width: '100%', border: 'none' }}>
              <span className="icon">🚪</span> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="topbar-title">
            <h1>Client Dashboard</h1>
            <p>Welcome back, {displayName}</p>
          </div>
          <div className="topbar-actions">
            <Link href="/talent" className="btn-primary btn-sm">+ Find Engineer</Link>
            <div className="user-avatar-sm">{initials}</div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Setup banner when profile not configured */}
          {!profile && (
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-lg)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <p style={{ fontWeight: 700, marginBottom: '3px', color: 'var(--amber)' }}>⚡ Complete your profile</p>
                <p className="text-sm text-muted">Tell us your requirements to start getting matched with engineers.</p>
              </div>
              <Link href="/onboarding/client" className="btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>Complete Profile →</Link>
            </div>
          )}

          {/* KPI Widgets */}
          <div className="stats-widgets">
            <div className="stat-widget">
              <div className="stat-widget-icon" style={{ background: 'var(--cyan-dim)' }}>👥</div>
              <div className="stat-widget-label">Active Engineers</div>
              <div className="stat-widget-value">2</div>
              <div className="stat-widget-change up">↑ +1 this month</div>
            </div>
            <div className="stat-widget">
              <div className="stat-widget-icon" style={{ background: 'var(--emerald-dim)' }}>✅</div>
              <div className="stat-widget-label">Tickets Resolved</div>
              <div className="stat-widget-value">148</div>
              <div className="stat-widget-change up">↑ +12% vs last month</div>
            </div>
            <div className="stat-widget">
              <div className="stat-widget-icon" style={{ background: 'var(--purple-dim)' }}>💰</div>
              <div className="stat-widget-label">Monthly Spend</div>
              <div className="stat-widget-value">$2,250</div>
              <div className="stat-widget-change up">↑ 70% cheaper than MSP</div>
            </div>
            <div className="stat-widget">
              <div className="stat-widget-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>⚡</div>
              <div className="stat-widget-label">Avg Response</div>
              <div className="stat-widget-value">47m</div>
              <div className="stat-widget-change up">↑ Within SLA</div>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="dashboard-grid-2">
            {/* My Engineers */}
            <div className="dashboard-section-card">
              <div className="section-card-header">
                <span className="section-card-title">My Engineers</span>
                <Link href="/talent" className="text-sm" style={{ color: 'var(--cyan)' }}>Add engineer →</Link>
              </div>
              <div className="section-card-body">
                {MOCK_ENGINEERS.map(eng => (
                  <div key={eng.name} className="row-item">
                    <div className="row-item-left">
                      <div className="row-item-avatar" style={{ background: eng.grad }}>{eng.initials}</div>
                      <div>
                        <div className="row-item-name">{eng.name}</div>
                        <div className="row-item-sub">{eng.role} · Since {eng.since}</div>
                      </div>
                    </div>
                    <div className="row-item-right">
                      <div className="badge badge-emerald">● {eng.status}</div>
                      <button className="btn-secondary btn-sm" style={{ cursor: 'pointer' }}>Message</button>
                    </div>
                  </div>
                ))}
                <div className="row-item" style={{ justifyContent: 'center', padding: '18px' }}>
                  <Link href="/talent" className="text-sm" style={{ color: 'var(--text-muted)' }}>Browse more engineers →</Link>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-section-card">
              <div className="section-card-header">
                <span className="section-card-title">Recent Activity</span>
              </div>
              <div className="section-card-body">
                {MOCK_ACTIVITY.map((a, i) => (
                  <div key={i} className="row-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{a.icon}</span>
                      <span className="row-item-name">{a.text}</span>
                    </div>
                    <span className="row-item-sub" style={{ paddingLeft: '30px' }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Browse Engineers CTA */}
          <div style={{ background: 'var(--hero-bg)', borderRadius: 'var(--radius-lg)', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <h3 style={{ fontWeight: 800, marginBottom: '6px', fontSize: '1.1rem' }}>Need another Microsoft engineer?</h3>
              <p className="text-sm text-secondary">Browse 50+ available specialists and add them to your team.</p>
            </div>
            <Link href="/talent" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Browse Talent →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
