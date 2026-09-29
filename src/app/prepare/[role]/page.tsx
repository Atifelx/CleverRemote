import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Layers3,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  companies,
  getAssessmentPath,
  getRole,
  isRoleId,
  roles,
} from '@/lib/assessment-paths'

import AuthControls from '../../auth-controls'
import BrandLink from '../../brand-link'
import styles from '../../experience.module.css'

type CompanySelectionPageProps = {
  params: Promise<{ role: string }>
}

export function generateStaticParams() {
  return roles.map((role) => ({ role: role.id }))
}

export async function generateMetadata({ params }: CompanySelectionPageProps): Promise<Metadata> {
  const { role: roleParam } = await params
  const role = isRoleId(roleParam) ? getRole(roleParam) : undefined

  return {
    title: role ? `${role.title} interview paths | CleverCrack` : 'Interview path | CleverCrack',
  }
}

export default async function CompanySelectionPage({ params }: CompanySelectionPageProps) {
  const { role: roleParam } = await params

  if (!isRoleId(roleParam)) {
    notFound()
  }

  const role = getRole(roleParam)

  if (!role) {
    notFound()
  }

  return (
    <main className={styles.screen}>
      <header className={styles.topbar}>
        <BrandLink />
        <div className={styles.topbarActions}>
          <div className={styles.stepStatus} aria-label="Step 2 of 3">
            <span>02</span>
            <div className={`${styles.stepTrack} ${styles.stepTwo}`}><i /></div>
            <span className={styles.stepTotal}>03</span>
          </div>
          <AuthControls />
        </div>
      </header>

      <div className={styles.companyLayout}>
        <section className={styles.companyIntro}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Change role
          </Link>
          <p className={styles.kicker}>Selected role · {role.shortTitle}</p>
          <h1>Which hiring process are you entering?</h1>
          <p className={styles.lede}>
            The same role is assessed differently by each talent network. Choose the company named on your invitation.
          </p>
          <div className={styles.selectedRoleStrip}>
            <span>Current target</span>
            <strong>{role.title}</strong>
            <small>{role.skills.join(' · ')}</small>
          </div>
        </section>

        <section className={styles.companyChoices} aria-label="Available company assessment paths">
          {companies.map((company) => {
            const path = getAssessmentPath(role.id, company.id)

            if (!path) {
              return null
            }

            return (
              <Link
                className={styles.companyCard}
                href={`/prepare/${role.id}/${company.id}`}
                key={company.id}
                style={{ '--company-accent': company.accent } as CSSProperties}
              >
                <div className={styles.companyCardHeader}>
                  <span className={styles.companyMonogram}>{company.monogram}</span>
                  <span className={styles.companyIdentity}>
                    <strong>{company.name}</strong>
                    <small>{company.description}</small>
                  </span>
                  <ArrowRight className={styles.companyArrow} size={22} aria-hidden="true" />
                </div>

                <div className={styles.companyFacts}>
                  <span><Layers3 size={15} /> {path.stages.length} stages</span>
                  <span><CalendarClock size={15} /> Reviewed {path.lastReviewed}</span>
                  <span><ShieldCheck size={15} /> {path.confidence} confidence</span>
                </div>

                <ol className={styles.roundPreview}>
                  {path.stages.slice(0, 3).map((stage, index) => (
                    <li key={stage.id}>
                      <span>{index + 1}</span>
                      <span><small>{stage.type}</small><strong>{stage.title}</strong></span>
                    </li>
                  ))}
                </ol>

                <span className={styles.moreRounds}>
                  + {path.stages.length - 3} later rounds in your roadmap
                </span>
              </Link>
            )
          })}
        </section>
      </div>
    </main>
  )
}