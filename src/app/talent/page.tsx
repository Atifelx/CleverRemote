import Link from 'next/link'

const SERVICE_TABS = [
  { id: 'all', label: 'All Experts' },
  { id: 'microsoft-365', label: 'Microsoft 365' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
  { id: 'virtual-assistance', label: 'Virtual Assistance' },
  { id: 'ai-automation', label: 'AI & Automation' },
  { id: 'ecommerce-crm', label: 'E-commerce / CRM' },
  { id: 'bookkeeping', label: 'Bookkeeping' },
  { id: 'cloud-infra', label: 'Cloud & Infra' },
  { id: 'social-media', label: 'Social Media' },
  { id: 'project-management', label: 'Project Mgmt' },
  { id: 'helpdesk', label: 'Help Desk' },
]

const ENGINEERS = [
  { initials: 'AK', name: 'Ahmed K.', role: 'M365 & Intune Specialist', exp: '12 years', rate: '$1,200/mo', grad: 'linear-gradient(135deg,#00C2FF,#0094CC)', primarySkills: ['M365 Admin', 'Intune & Endpoint', 'Azure AD / Entra ID'], skills: ['Autopilot', 'Exchange Online', 'Teams Admin'], categories: ['microsoft-365', 'cloud-infra'], avail: true, rating: 5.0 },
  { initials: 'SR', name: 'Sara R.', role: 'SharePoint & AI Automation', exp: '9 years', rate: '$1,000/mo', grad: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', primarySkills: ['SharePoint', 'Power Platform', 'Microsoft Copilot'], skills: ['Power Automate', 'Power Apps', 'Teams Admin'], categories: ['microsoft-365', 'ai-automation'], avail: true, rating: 4.9 },
  { initials: 'MB', name: 'Mark B.', role: 'Cybersecurity & SOC Analyst', exp: '11 years', rate: '$1,500/mo', grad: 'linear-gradient(135deg,#10B981,#0D9B6C)', primarySkills: ['Microsoft Defender', 'Sentinel (SIEM)', 'SOC Monitoring'], skills: ['Purview Compliance', 'Endpoint Protection', 'Security Audits'], categories: ['cybersecurity', 'microsoft-365'], avail: true, rating: 5.0 },
  { initials: 'PJ', name: 'Priya J.', role: 'Virtual Assistant & CRM', exp: '8 years', rate: '$800/mo', grad: 'linear-gradient(135deg,#F59E0B,#D97706)', primarySkills: ['Email Management', 'HubSpot', 'Data Entry'], skills: ['Calendar Management', 'Salesforce', 'Customer Support'], categories: ['virtual-assistance', 'ecommerce-crm'], avail: true, rating: 4.8 },
  { initials: 'OA', name: 'Omar A.', role: 'Cloud & Endpoint Engineer', exp: '10 years', rate: '$1,250/mo', grad: 'linear-gradient(135deg,#EC4899,#BE185D)', primarySkills: ['Intune & Endpoint', 'Azure Administration', 'Backup Management'], skills: ['Autopilot', 'Disaster Recovery', 'VM Management'], categories: ['microsoft-365', 'cloud-infra'], avail: true, rating: 4.9 },
  { initials: 'FH', name: 'Fatima H.', role: 'Bookkeeper & Data Specialist', exp: '6 years', rate: '$800/mo', grad: 'linear-gradient(135deg,#06B6D4,#0E7490)', primarySkills: ['QuickBooks', 'Xero', 'Bank Reconciliation'], skills: ['Invoicing', 'Financial Reports', 'Data Entry'], categories: ['bookkeeping', 'virtual-assistance'], avail: true, rating: 4.9 },
  { initials: 'RV', name: 'Raj V.', role: 'AI & Power Platform Dev', exp: '9 years', rate: '$1,250/mo', grad: 'linear-gradient(135deg,#7C3AED,#4C1D95)', primarySkills: ['Power Apps', 'Power Automate', 'Microsoft Copilot'], skills: ['ChatGPT/AI Tools', 'Workflow Optimization', 'SharePoint'], categories: ['ai-automation', 'microsoft-365'], avail: true, rating: 4.9 },
  { initials: 'NA', name: 'Nadia A.', role: 'Help Desk & IT Support Lead', exp: '10 years', rate: '$1,000/mo', grad: 'linear-gradient(135deg,#059669,#065F46)', primarySkills: ['L1-L3 Support', 'ServiceNow', 'SLA Management'], skills: ['M365 Admin', 'Ticketing Systems', 'Remote Troubleshooting'], categories: ['helpdesk', 'microsoft-365'], avail: true, rating: 4.8 },
  { initials: 'ZK', name: 'Zara K.', role: 'Social Media & Content', exp: '5 years', rate: '$800/mo', grad: 'linear-gradient(135deg,#F43F5E,#BE123C)', primarySkills: ['Content Creation', 'Video Editing', 'Social Media Scheduling'], skills: ['Canva/Graphics', 'SEO Basics', 'Email Marketing'], categories: ['social-media'], avail: true, rating: 4.7 },
  { initials: 'AS', name: 'Ali S.', role: 'E-commerce & Shopify Expert', exp: '7 years', rate: '$1,000/mo', grad: 'linear-gradient(135deg,#14B8A6,#0D9488)', primarySkills: ['Shopify Admin', 'Order Management', 'Product Listings'], skills: ['WooCommerce', 'Customer Support', 'HubSpot'], categories: ['ecommerce-crm'], avail: true, rating: 4.8 },
  { initials: 'KM', name: 'Khalid M.', role: 'Virtual Project Manager', exp: '12 years', rate: '$1,250/mo', grad: 'linear-gradient(135deg,#6366F1,#4338CA)', primarySkills: ['Jira', 'Sprint Planning', 'Team Coordination'], skills: ['Asana', 'Stakeholder Reports', 'Risk Management'], categories: ['project-management'], avail: true, rating: 5.0 },
  { initials: 'LT', name: 'Lisa T.', role: 'Virtual M365 Admin', exp: '7 years', rate: '$1,000/mo', grad: 'linear-gradient(135deg,#06B6D4,#0E7490)', primarySkills: ['Exchange Online', 'M365 Admin', 'Azure AD / Entra ID'], skills: ['OneDrive/Migration', 'Teams Admin'], categories: ['microsoft-365'], avail: false, rating: 4.7 },
]

const SKILL_FILTERS = ['M365 Admin', 'Intune & Endpoint', 'SharePoint', 'Teams Admin', 'Cybersecurity', 'Help Desk', 'Power Platform', 'Virtual Assistance', 'Bookkeeping', 'E-commerce', 'AI & Automation', 'Project Mgmt']

export default function TalentPage() {
  return (
    <div className="home-wrapper">
      <nav className="navbar">
        <div className="nav-brand">
          <Link href="/" className="logo">CleverCrack</Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/talent">Browse Talent</Link>
          </div>
        </div>
        <div className="nav-auth">
          <Link href="/login" className="nav-login">Log in</Link>
          <Link href="/register/client" className="btn-nav-primary">Hire an Expert</Link>
        </div>
      </nav>

      {/* Page Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '40px 80px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="section-eyebrow">Browse</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '10px' }}>
            Find Your Remote Expert
          </h1>
          <p className="text-secondary" style={{ maxWidth: '580px', lineHeight: '1.65' }}>
            100+ pre-vetted professionals across Microsoft 365, cybersecurity, virtual assistance, AI automation, and more. Available for immediate engagement.
          </p>

          <div className="search-bar" style={{ maxWidth: '520px', marginTop: '24px' }}>
            <span className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input type="text" placeholder="Search by skill, e.g. Intune, Shopify, QuickBooks..." className="search-input" />
            <button className="search-btn">Search</button>
          </div>

          {/* Service category tabs */}
          <div className="service-tabs" style={{ marginTop: '24px' }}>
            {SERVICE_TABS.map(tab => (
              <span key={tab.id} className={`service-tab ${tab.id === 'all' ? 'active' : ''}`}>{tab.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 80px 80px' }}>
        <div className="talent-page-layout">
          {/* Filters */}
          <aside className="talent-filters">
            <div className="filter-title">Filters</div>

            <div className="filter-section">
              <span className="filter-section-label">Availability</span>
              <div className="filter-options">
                <label className="filter-option"><input type="checkbox" defaultChecked /> Available now</label>
                <label className="filter-option"><input type="checkbox" /> All experts</label>
              </div>
            </div>

            <div className="filter-section">
              <span className="filter-section-label">Monthly Rate</span>
              <div className="filter-options">
                <label className="filter-option"><input type="checkbox" /> $800/mo</label>
                <label className="filter-option"><input type="checkbox" /> $1,000/mo</label>
                <label className="filter-option"><input type="checkbox" defaultChecked /> $1,250/mo</label>
                <label className="filter-option"><input type="checkbox" /> $1,500/mo</label>
              </div>
            </div>

            <div className="filter-section">
              <span className="filter-section-label">Skill Area</span>
              <div className="filter-options">
                {SKILL_FILTERS.map(s => (
                  <label key={s} className="filter-option">
                    <input type="checkbox" /> {s}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <span className="filter-section-label">Experience</span>
              <div className="filter-options">
                <label className="filter-option"><input type="checkbox" /> 3–5 years</label>
                <label className="filter-option"><input type="checkbox" /> 5–8 years</label>
                <label className="filter-option"><input type="checkbox" defaultChecked /> 9–12 years</label>
                <label className="filter-option"><input type="checkbox" /> 12+ years</label>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="talent-results-area">
            <div className="talent-results-header">
              <span className="talent-results-title">Showing <strong style={{ color: 'var(--text-primary)' }}>{ENGINEERS.length} experts</strong> · Sorted by availability</span>
              <select className="form-input" style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}>
                <option>Sort: Available first</option>
                <option>Sort: Lowest rate</option>
                <option>Sort: Most experienced</option>
                <option>Sort: Highest rated</option>
              </select>
            </div>

            <div className="engineer-grid">
              {ENGINEERS.map(eng => (
                <div key={eng.name} className="engineer-card">
                  <div className="engineer-card-header">
                    <div className="engineer-avatar" style={{ background: eng.grad }}>{eng.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                        <div className="engineer-name">{eng.name}</div>
                        <div className={`badge ${eng.avail ? 'badge-emerald' : 'badge-amber'}`}>
                          {eng.avail ? '● Available' : '● Busy'}
                        </div>
                      </div>
                      <div className="engineer-role">{eng.role}</div>
                      <div className="engineer-exp">⭐ {eng.rating} · {eng.exp} experience</div>
                    </div>
                  </div>

                  {/* Primary skills highlighted */}
                  <div className="engineer-skills">
                    {eng.primarySkills.map(s => <span key={s} className="skill-tag primary">{s}</span>)}
                    {eng.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>

                  <div className="engineer-card-footer">
                    <div className="engineer-rate">{eng.rate}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href="/register/client" className="btn-secondary btn-sm">View Profile</Link>
                      <Link href="/register/client" className="btn-primary btn-sm">Hire →</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center', padding: '40px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Don&apos;t see the right fit?</h3>
              <p className="text-secondary text-sm mb-4">Post your specific requirement and we&apos;ll hand-match you within 24 hours.</p>
              <Link href="/register/client" className="btn-primary">Post a Requirement →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
