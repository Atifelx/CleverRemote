'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { saveFreelancerProfile } from '../../actions/profile'

const SERVICE_CATEGORIES = [
  { id: 'microsoft-365', label: 'Microsoft 365 & Intune', icon: '☁️', desc: 'Exchange, SharePoint, Teams, Intune, Azure AD' },
  { id: 'cybersecurity', label: 'Cybersecurity / SOC', icon: '🔒', desc: 'Endpoint protection, compliance, threat monitoring' },
  { id: 'virtual-assistance', label: 'Virtual Assistance', icon: '🖥️', desc: 'Admin tasks, data entry, form filling, system access' },
  { id: 'ai-automation', label: 'AI & Workflow Automation', icon: '🤖', desc: 'Copilot, Power Automate, ChatGPT integration' },
  { id: 'ecommerce-crm', label: 'E-commerce / CRM Support', icon: '🛒', desc: 'Shopify, HubSpot, Salesforce admin & data' },
  { id: 'cloud-infra', label: 'Cloud Migration & Backup', icon: '📦', desc: 'Azure/AWS basics, disaster recovery, backups' },
  { id: 'bookkeeping', label: 'Bookkeeping & Data Entry', icon: '📊', desc: 'QuickBooks, Xero, invoicing, reconciliation' },
  { id: 'social-media', label: 'Social Media & Content', icon: '📱', desc: 'Content creation, scheduling, video editing' },
  { id: 'project-management', label: 'Virtual Project Manager', icon: '📋', desc: 'Remote team management, Jira, Asana, sprints' },
  { id: 'helpdesk', label: 'On-Demand Help Desk', icon: '🛟', desc: 'L1–L3 support, ticketing, SLAs, ITSM' },
]

const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  'microsoft-365': ['M365 Admin', 'Intune & Endpoint', 'Azure AD / Entra ID', 'Exchange Online', 'SharePoint Admin', 'SharePoint Development', 'Teams Admin', 'Teams Calling/Rooms', 'OneDrive/Migration', 'Power Platform', 'Autopilot', 'Windows 365'],
  'cybersecurity': ['Microsoft Defender', 'Sentinel (SIEM)', 'Purview Compliance', 'Endpoint Protection', 'Identity & Access Mgmt', 'Security Audits', 'Incident Response', 'SOC Monitoring'],
  'virtual-assistance': ['Email Management', 'Calendar Management', 'Data Entry', 'Document Formatting', 'Travel Booking', 'Research & Reports', 'CRM Data Updates', 'Customer Support Chat'],
  'ai-automation': ['Microsoft Copilot', 'Power Automate Flows', 'Power Apps', 'ChatGPT/AI Tools', 'AI Document Processing', 'Workflow Optimization', 'RPA (Robotic Process)'],
  'ecommerce-crm': ['Shopify Admin', 'WooCommerce', 'HubSpot', 'Salesforce', 'Zoho CRM', 'Order Management', 'Product Listings', 'Customer Support'],
  'cloud-infra': ['Azure Administration', 'AWS Basics', 'Backup Management', 'Disaster Recovery', 'Server Monitoring', 'DNS/Domain Mgmt', 'VM Management'],
  'bookkeeping': ['QuickBooks', 'Xero', 'FreshBooks', 'Invoicing', 'Bank Reconciliation', 'Expense Tracking', 'Payroll Support', 'Financial Reports'],
  'social-media': ['Content Creation', 'Social Media Scheduling', 'Video Editing', 'Canva/Graphics', 'SEO Basics', 'Email Marketing', 'Community Management'],
  'project-management': ['Jira', 'Asana', 'Monday.com', 'Trello', 'Sprint Planning', 'Stakeholder Reports', 'Team Coordination', 'Risk Management'],
  'helpdesk': ['L1 Support', 'L2 Support', 'L3 Support', 'Ticketing Systems', 'ServiceNow', 'Freshdesk/Zendesk', 'Remote Troubleshooting', 'SLA Management'],
}

export default function FreelancerOnboarding() {
  const [state, action, isPending] = useActionState(saveFreelancerProfile, null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [primarySkills, setPrimarySkills] = useState<string[]>([])

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const togglePrimary = (skill: string) => {
    setPrimarySkills(prev => {
      if (prev.includes(skill)) return prev.filter(s => s !== skill)
      if (prev.length >= 3) return prev
      return [...prev, skill]
    })
  }

  const availableSkills = selectedCategories.flatMap(cat => SKILLS_BY_CATEGORY[cat] || [])

  return (
    <div className="onboarding-wrapper">
      <nav className="navbar">
        <Link href="/" className="logo">CleverCrack</Link>
        <div className="flex items-center gap-3">
          <div className="badge badge-purple">● Step 2 of 2 — Engineer Profile</div>
        </div>
      </nav>

      <div className="onboarding-body">
        <div style={{ marginBottom: '28px' }}>
          <div className="completion-bar-wrapper" style={{ marginBottom: '8px' }}>
            <div className="completion-bar-fill" style={{ width: '100%' }} />
          </div>
          <p className="text-xs text-muted">Last step — build your profile to start getting matched with clients.</p>
        </div>

        <div className="onboarding-card">
          <h1>Build Your Engineer Profile</h1>
          <p>Show clients what you can do — pick your service areas and highlight your strongest skills.</p>

          {state?.error && (
            <div className="form-error mb-6">⚠ {state.error}</div>
          )}

          <form className="onboarding-form" action={action}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" type="text" placeholder="John Doe" className="form-input" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Years of Experience *</label>
                <input name="experienceYears" type="number" placeholder="10" className="form-input" min="1" max="40" required />
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Rate (USD)</label>
                <select name="monthlyRate" className="form-input">
                  <option value="">Select rate</option>
                  <option value="$800/month">$800 / month</option>
                  <option value="$1,000/month">$1,000 / month</option>
                  <option value="$1,250/month">$1,250 / month</option>
                  <option value="$1,500/month">$1,500 / month</option>
                </select>
              </div>
            </div>

            {/* SERVICE CATEGORIES */}
            <div className="form-group">
              <label className="form-label">What services can you offer? * (select all that apply)</label>
              <p className="text-xs text-muted" style={{ marginBottom: '12px' }}>Choose the areas where you can deliver work. Clients will find you when searching any of these.</p>
              <div className="service-category-grid">
                {SERVICE_CATEGORIES.map(cat => (
                  <label
                    key={cat.id}
                    className={`service-category-card ${selectedCategories.includes(cat.id) ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <input type="checkbox" name="serviceCategories" value={cat.id} checked={selectedCategories.includes(cat.id)} onChange={() => {}} style={{ display: 'none' }} />
                    <span className="service-cat-icon">{cat.icon}</span>
                    <span className="service-cat-label">{cat.label}</span>
                    <span className="service-cat-desc">{cat.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* PRIMARY SKILLS */}
            {selectedCategories.length > 0 && (
              <div className="form-group">
                <label className="form-label">Select your primary expertise (up to 3)</label>
                <p className="text-xs text-muted" style={{ marginBottom: '12px' }}>These are shown first on your profile. Clients searching for these skills see you at the top.</p>
                <div className="skills-grid">
                  {availableSkills.map(skill => (
                    <label
                      key={skill}
                      className={`skill-checkbox ${primarySkills.includes(skill) ? 'primary-selected' : ''}`}
                      onClick={(e) => { e.preventDefault(); togglePrimary(skill) }}
                    >
                      <input type="checkbox" name="primarySkills" value={skill} checked={primarySkills.includes(skill)} onChange={() => {}} />
                      {skill}
                      {primarySkills.includes(skill) && <span className="primary-badge">★ Primary</span>}
                    </label>
                  ))}
                </div>
                {primarySkills.length >= 3 && (
                  <p className="text-xs" style={{ color: 'var(--amber)', marginTop: '8px' }}>Maximum 3 primary skills selected. Deselect one to change.</p>
                )}
              </div>
            )}

            {/* ADDITIONAL SKILLS — all remaining from selected categories */}
            {selectedCategories.length > 0 && (
              <div className="form-group">
                <label className="form-label">Additional skills (select all you can do)</label>
                <p className="text-xs text-muted" style={{ marginBottom: '12px' }}>These also appear on your profile and are searchable by clients.</p>
                <div className="skills-grid">
                  {availableSkills.filter(s => !primarySkills.includes(s)).map(skill => (
                    <label key={skill} className="skill-checkbox">
                      <input type="checkbox" name="skills" value={skill} />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">About You</label>
              <textarea
                name="about"
                className="form-input"
                placeholder="Describe your experience, certifications, and what makes you stand out..."
                style={{ minHeight: '130px' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary btn-alt"
              disabled={isPending || selectedCategories.length === 0}
              style={{ padding: '15px 32px', marginTop: '8px' }}
            >
              {isPending ? 'Creating your profile…' : 'Submit Profile & Go to Dashboard →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
