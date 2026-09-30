import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Bot,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  Network,
} from 'lucide-react'
import Link from 'next/link'

import { assessmentPaths, roles, type RoleId } from '@/lib/assessment-paths'

import AuthControls from './auth-controls'
import BrandLink from './brand-link'
import styles from './experience.module.css'

const roleIcons: Record<RoleId, LucideIcon> = {
  'forward-deployed-engineer': BriefcaseBusiness,
  'ai-engineer': Bot,
  'ai-forward-deployed-engineer': Network,
}

export default function Home() {
  return (
    <main className={styles.screen}>
      <header className={styles.topbar}>
        <BrandLink />
        <div className={styles.topbarActions}>
          <div className={styles.stepStatus} aria-label="Step 1 of 3">
            <span>01</span>
            <div className={styles.stepTrack}><i /></div>
            <span className={styles.stepTotal}>03</span>
          </div>
          <AuthControls />
        </div>
      </header>

      <div className={styles.selectionLayout}>
        <section className={styles.introPanel}>
          <p className={styles.kicker}>Start your route</p>
          <h1>Which role are you preparing for?</h1>
          <p className={styles.lede}>
            Your target role changes the interview sequence, technical depth, and practice plan.
          </p>

          <Link className={styles.learningPrimer} href="/learn">
            <span><BookOpenCheck size={20} /></span>
            <span>
              <small>New to the core topics?</small>
              <strong>Learn first, then take the tests</strong>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <div className={styles.routePreview}>
            <div className={styles.routePreviewItem}>
              <span className={styles.routePreviewNumber}>01</span>
              <span><strong>Role</strong><small>Choose your discipline</small></span>
              <Check size={16} aria-hidden="true" />
            </div>
            <div className={styles.routePreviewItem}>
              <span className={styles.routePreviewNumber}>02</span>
              <span><strong>Company</strong><small>Select the hiring process</small></span>
            </div>
            <div className={styles.routePreviewItem}>
              <span className={styles.routePreviewNumber}>03</span>
              <span><strong>Roadmap</strong><small>Work through every round</small></span>
            </div>
          </div>

          <p className={styles.sourceNote}>
            Hiring flows change. Each roadmap includes a confidence level and review date.
          </p>
        </section>

        <section className={styles.choicePanel} aria-labelledby="role-list-title">
          <div className={styles.choiceHeader}>
            <div>
              <p className={styles.choiceLabel}>Target role</p>
              <h2 id="role-list-title">Select one path</h2>
            </div>
            <span className={styles.choiceCount}>{roles.length} paths</span>
          </div>

          <div className={styles.roleList}>
            {roles.map((role, index) => {
              const Icon = roleIcons[role.id]
              const stageCount = assessmentPaths.find((path) => path.roleId === role.id)?.stages.length ?? 0

              return (
                <Link className={styles.roleCard} href={`/prepare/${role.id}`} key={role.id}>
                  <span className={styles.roleIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.roleIcon}><Icon size={24} strokeWidth={1.8} /></span>
                  <span className={styles.roleBody}>
                    <span className={styles.roleEyebrow}>{role.eyebrow}</span>
                    <strong>{role.title}</strong>
                    <span className={styles.roleDescription}>{role.description}</span>
                    <span className={styles.skillRow}>
                      {role.skills.map((skill) => <span key={skill}>{skill}</span>)}
                    </span>
                  </span>
                  <span className={styles.roleMeta}>
                    <span>3 companies</span>
                    <span>{stageCount} rounds each</span>
                  </span>
                  <ArrowRight className={styles.cardArrow} size={21} aria-hidden="true" />
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}