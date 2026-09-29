'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { saveClientProfile } from '../../actions/profile'

const SERVICE_CATEGORIES = [
  { id: 'microsoft-365', label: 'Microsoft 365 & Intune', icon: '☁️' },
  { id: 'cybersecurity', label: 'Cybersecurity / SOC', icon: '🔒' },
  { id: 'virtual-assistance', label: 'Virtual Assistance', icon: '🖥️' },
  { id: 'ai-automation', label: 'AI & Workflow Automation', icon: '🤖' },
  { id: 'ecommerce-crm', label: 'E-commerce / CRM Support', icon: '🛒' },
  { id: 'cloud-infra', label: 'Cloud Migration & Backup', icon: '📦' },
  { id: 'bookkeeping', label: 'Bookkeeping & Data Entry', icon: '📊' },
  { id: 'social-media', label: 'Social Media & Content', icon: '📱' },
  { id: 'project-management', label: 'Virtual Project Manager', icon: '📋' },
  { id: 'helpdesk', label: 'On-Demand Help Desk', icon: '🛟' },
]

const SKILLS: Record<string, string[]> = {
  'microsoft-365': ['M365 Admin', 'Intune & Endpoint', 'Azure AD / Entra ID', 'Exchange Online', 'SharePoint', 'Teams Admin', 'Power Platform', 'Autopilot'],
  'cybersecurity': ['Microsoft Defender', 'Sentinel (SIEM)', 'Purview Compliance', 'Endpoint Protection', 'Security Audits', 'SOC Monitoring'],
  'virtual-assistance': ['Email Management', 'Data Entry', 'Document Formatting', 'Research & Reports', 'Customer Support'],
  'ai-automation': ['Microsoft Copilot', 'Power Automate', 'Power Apps', 'ChatGPT/AI Tools', 'Workflow Optimization'],
  'ecommerce-crm': ['Shopify Admin', 'HubSpot', 'Salesforce', 'Order Management', 'Product Listings'],
  'cloud-infra': ['Azure Administration', 'AWS Basics', 'Backup Management', 'Disaster Recovery', 'Server Monitoring'],
  'bookkeeping': ['QuickBooks', 'Xero', 'Invoicing', 'Bank Reconciliation', 'Financial Reports'],
  'social-media': ['Content Creation', 'Social Media Scheduling', 'Video Editing', 'SEO Basics', 'Email Marketing'],
  'project-management': ['Jira', 'Asana', 'Sprint Planning', 'Team Coordination', 'Stakeholder Reports'],
  'helpdesk': ['L1-L3 Support', 'Ticketing Systems', 'ServiceNow', 'Freshdesk/Zendesk', 'SLA Management'],
}

export default function ClientOnboarding() {
  const [state, action, isPending] = useActionState(saveClientProfile, null)

  return (
    <div className="onboarding-wrapper">
      <nav className="navbar">
        <Link href="/" className="logo">CleverCrack</Link>
        <div className="flex items-center gap-3">
          <div className="badge badge-emerald">● Step 2 of 2 — Profile Setup</div>
        </div>
      </nav>

      <div className="onboarding-body">
        <div style={{ marginBottom: '28px' }}>
          <div className="completion-bar-wrapper" style={{ marginBottom: '8px' }}>
            <div className="completion-bar-fill" style={{ width: '100%' }} />
          </div>
          <p className="text-xs text-muted">Almost there — complete your profile to get matched with engineers.</p>
        </div>

        <div className="onboarding-card">
          <h1>Complete Your Client Profile</h1>
          <p>Tell us what you need — we&apos;ll match you with the right expert.</p>

          {state?.error && (
            <div className="form-error mb-6">⚠ {state.error}</div>
          )}

          <form className="onboarding-form" action={action}>
            <div className="form-group">
              <label className="form-label">Your Full Name *</label>
              <input name="name" type="text" placeholder="John Smith" className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">Company / Organisation Name</label>
              <input name="company" type="text" placeholder="Acme Corp" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">What service do you need? *</label>
              <div className="service-category-grid">
                {SERVICE_CATEGORIES.map(cat => (
                  <label key={cat.id} className="service-category-card">
                    <input type="radio" name="serviceCategory" value={cat.id} style={{ display: 'none' }} />
                    <span className="service-cat-icon">{cat.icon}</span>
                    <span className="service-cat-label">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Requirement Title</label>
              <input name="requirementTitle" type="text" placeholder="e.g. Need dedicated Intune support engineer" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Tell us about your needs</label>
              <textarea
                name="story"
                className="form-input"
                placeholder="Describe what you need help with, your team size, and any specific requirements..."
                style={{ minHeight: '130px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills * (select all that apply)</label>
              <div className="skills-grid">
                {Object.values(SKILLS).flat().map(skill => (
                  <label key={skill} className="skill-checkbox">
                    <input type="checkbox" name="skills" value={skill} />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isPending}
              style={{ padding: '15px 32px', marginTop: '8px' }}
            >
              {isPending ? 'Saving profile…' : 'Submit & Find My Expert →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
