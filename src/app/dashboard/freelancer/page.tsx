import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '../../actions/auth'

const MOCK_MATCHES = [
  { initials: 'AC', name: 'Acme Corp', requirement: 'Need L2 Intune support engineer', budget: '$1,250/mo', grad: 'linear-gradient(135deg,#00C2FF,#0094CC)', status: 'New Match' },
  { initials: 'TG', name: 'TechGiant MSP', requirement: 'M365 admin for 200-user org', budget: '$1,000/mo', grad: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', status: 'Shortlisted' },
  { initials: 'NX', name: 'NextWave IT', requirement: 'SharePoint dev, Power Platform', budget: '$1,500/mo', grad: 'linear-gradient(135deg,#10B981,#0D9B6C)', status: 'In Review' },
]

const MOCK_ACTIVITY = [
  { icon: '🎯', text: 'New client match: Acme Corp is looking for your skills', time: '1 hour ago' },
  { icon: '💬', text: 'TechGiant MSP sent you a message', time: '3 hours ago' },
  { icon: '👁️', text: 'Your profile was viewed 12 times this week', time: 'Today' },
  { icon: '⭐', text: 'You received a 5-star review from Global Retail Inc.', time: '2 days ago' },
]

export default async function FreelancerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let profile: Record<string, unknown> | null = null
  try {
    const { data } = await supabase
      .from('freelancer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = data
  } catch { /* table may not exist yet */ }

  const displayName = (profile?.name as string) ?? user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'Engineer'
  const initials = displayName.slice(0, 2).toUpperCase()
  const skills = (profile?.skills as string[]) ?? []
  const completionPct = profile ? 100 : 40

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Link href="/" className="logo">CleverCrack</Link>
        </div>
        <nav className="sidebar-nav">
          <a className="sidebar-item active" href="/dashboard/freelancer">
            <span className="icon">📊</span> Dashboard
          </a>
          <a className="sidebar-item" href="#">
            <span className="icon">🎯</span> My Matches
          </a>
          <a className="sidebar-item" href="#">
            <span className="icon">👤</span> My Profile
          </a>
          <a className="sidebar-item" href="#">
            <span className="icon">💬</span> Messages
          </a>
          <div className="sidebar-section-label">Account</div>
          <a className="sidebar-item" href="#">
            <span className="icon">💰</span> Earnings
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
            <h1>Engineer Dashboard</h1>
            <p>Welcome back, {displayName}</p>
          </div>
          <div className="topbar-actions">
            {!profile && (
              <Link href="/onboarding/freelancer" className="btn-primary btn-sm">Complete Profile</Link>
            )}
            <div className="user-avatar-sm">{initials}</div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Profile incomplete banner */}
          {!profile && (
            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 'var(--radius-lg)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <p style={{ fontWeight: 700, marginBottom: '3px', color: 'var(--purple)' }}>🚀 Complete your profile to get matched</p>
                <p className="text-sm text-muted">Add your skills and experience to start receiving client matches.</p>
              </div>
              <Link href="/onboarding/freelancer" className="btn-primary btn-alt btn-sm" style={{ whiteSpace: 'nowrap' }}>Complete Profile →</Link>
            </div>
          )}

          {/* KPI Widgets */}
          <div className="stats-widgets">
            <div className="stat-widget">
              <div className="stat-widget-icon" style={{ background: 'var(--cyan-dim)' }}>👁️</div>
              <div className="stat-widget-label">Profile Views</div>
              <div className="stat-widget-value">47</div>
              <div className="stat-widget-change up">↑ +8 this week</div>
            </div>
            <div className="stat-widget">
              <div className="stat-widget-icon" style={{ background: 'var(--purple-dim)' }}>🎯</div>
              <div className="stat-widget-label">New Matches</div>
              <div className="stat-widget-value">3</div>
              <div className="stat-widget-change up">↑ 2 need response</div>
            </div>
            <div className="stat-widget">
              <div className="stat-widget-icon" style={{ background: 'var(--emerald-dim)' }}>🤝</div>
              <div className="stat-widget-label">Active Clients</div>
              <div className="stat-widget-value">1</div>
              <div className="stat-widget-change up">● Ongoing project</div>
            </div>
            <div className="stat-widget">
              <div className="stat-widget-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>💰</div>
              <div className="stat-widget-label">Monthly Earnings</div>
              <div className="stat-widget-value">$1,250</div>
              <div className="stat-widget-change up">↑ Active contract</div>
            </div>
          </div>

          <div className="dashboard-grid-2">
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Profile completion */}
              <div className="profile-completion">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Profile Strength</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--cyan)' }}>{completionPct}%</span>
                </div>
                <div className="completion-bar-wrapper">
                  <div className="completion-bar-fill" style={{ width: `${completionPct}%` }} />
                </div>
                {!profile && (
                  <p className="text-xs text-muted">Add your skills, experience, and about section to reach 100%.</p>
                )}
                {profile && (
                  <p className="text-xs text-muted">Great profile! You are showing up in client searches.</p>
                )}
              </div>

              {/* Availability */}
              <div className="dashboard-section-card" style={{ overflow: 'hidden' }}>
                <div className="section-card-header">
                  <span className="section-card-title">Availability</span>
                </div>
                <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="availability-toggle">
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider" />
                    </label>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Available for new clients</div>
                      <div className="text-xs text-muted">Clients can see and match with you</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted">Toggle off when you are at capacity or taking a break.</p>
                </div>
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div className="dashboard-section-card">
                  <div className="section-card-header">
                    <span className="section-card-title">Your Skills</span>
                  </div>
                  <div style={{ padding: '16px 22px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.map((s: string) => (
                      <span key={s} className="skill-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column — Matches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="dashboard-section-card" style={{ flex: 1 }}>
                <div className="section-card-header">
                  <span className="section-card-title">Client Matches</span>
                  <span className="badge badge-cyan">{MOCK_MATCHES.length} new</span>
                </div>
                <div className="section-card-body">
                  {MOCK_MATCHES.map(m => (
                    <div key={m.name} className="row-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div className="row-item-left">
                          <div className="row-item-avatar" style={{ background: m.grad }}>{m.initials}</div>
                          <div>
                            <div className="row-item-name">{m.name}</div>
                            <div className="row-item-sub">{m.budget}</div>
                          </div>
                        </div>
                        <div className={`badge ${m.status === 'New Match' ? 'badge-emerald' : m.status === 'Shortlisted' ? 'badge-cyan' : 'badge-amber'}`}>
                          {m.status}
                        </div>
                      </div>
                      <p className="text-xs text-secondary" style={{ paddingLeft: '51px' }}>{m.requirement}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="dashboard-section-card">
                <div className="section-card-header">
                  <span className="section-card-title">Activity</span>
                </div>
                <div className="section-card-body">
                  {MOCK_ACTIVITY.map((a, i) => (
                    <div key={i} className="row-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <span style={{ fontSize: '1rem' }}>{a.icon}</span>
                        <span className="row-item-name" style={{ fontSize: '0.82rem' }}>{a.text}</span>
                      </div>
                      <span className="row-item-sub" style={{ paddingLeft: '29px' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
