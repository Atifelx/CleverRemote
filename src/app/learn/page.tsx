import type { Metadata } from 'next'
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CloudCog,
  Code2,
} from 'lucide-react'
import Link from 'next/link'

import { devOpsLabs, devOpsLabStepCount } from '@/lib/devops-lab'
import { getLearningExampleCount } from '@/lib/learning-model'
import { learningPaths } from '@/lib/learning-paths'

import AuthControls from '../auth-controls'
import BrandLink from '../brand-link'
import styles from './learn.module.css'

export const metadata: Metadata = {
  title: 'Learning paths | CleverCrack',
  description: 'Master software engineering, FDE delivery, and AI engineering, then deploy a real app in the hands-on DevOps Cloud Lab.',
}

const pathIcons = [Code2, BriefcaseBusiness, BrainCircuit]

const libraryTotals = learningPaths.reduce(
  (totals, path) => ({
    chapters: totals.chapters + path.chapters.length,
    examples: totals.examples + getLearningExampleCount(path),
  }),
  { chapters: 0, examples: 0 },
)

const platformLensCount = new Set(
  learningPaths.flatMap((path) => path.platforms),
).size

export default function LearningLibraryPage() {
  return (
    <main className={styles.learnScreen}>
      <header className={styles.topbar}>
        <BrandLink />
        <nav className={styles.topbarNav} aria-label="Primary navigation">
          <Link href="/">Test roadmaps</Link>
          <AuthControls />
        </nav>
      </header>

      <div className={styles.libraryShell}>
        <section className={styles.libraryIntro}>
          <div>
            <p className={styles.kicker}>Learning library</p>
            <h1>Learn the core.<br />Then crack the test.</h1>
          </div>
          <div className={styles.libraryIntroCopy}>
            <p>
              Three ordered books cover software, system delivery, and AI engineering for Turing, Andela, and Toptal technical processes. A hands-on cloud lab then takes one app to production on Azure, AWS, and Google Cloud.
            </p>
            <div className={styles.libraryTotals}>
              <span><strong>{libraryTotals.chapters}</strong> chapters</span>
              <span><strong>{libraryTotals.examples}</strong> worked examples</span>
              <span><strong>{platformLensCount}</strong> platform lenses</span>
            </div>
          </div>
        </section>

        <section className={styles.pathIndex} aria-labelledby="learning-paths-title">
          <header className={styles.sectionHeading}>
            <div>
              <span>Ordered curricula</span>
              <h2 id="learning-paths-title">Choose where to start</h2>
            </div>
            <p>Build your role foundation first. Then use the DevOps Cloud Lab to deploy, scale, and secure a real app.</p>
          </header>

          <div className={styles.pathList}>
            {learningPaths.map((path, index) => {
              const Icon = pathIcons[index]
              const exampleCount = getLearningExampleCount(path)

              return (
                <Link
                  className={styles.pathCard}
                  href={`/learn/${path.id}`}
                  key={path.id}
                  style={{ '--path-accent': path.accent } as React.CSSProperties}
                >
                  <span className={styles.pathOrder}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.pathIcon}><Icon size={25} /></span>
                  <span className={styles.pathCopy}>
                    <small>Learning path {index + 1}</small>
                    <strong>{path.title}</strong>
                    <span>{path.description}</span>
                  </span>
                  <span className={styles.pathStats}>
                    <span><strong>{path.chapters.length}</strong> chapters</span>
                    <span><strong>{exampleCount}</strong> examples</span>
                  </span>
                  <ArrowRight size={21} aria-hidden="true" />
                </Link>
              )
            })}
            <Link
              className={styles.pathCard}
              href="/learn/devops-cloud-core"
              style={{ '--path-accent': '#0f7b6c' } as React.CSSProperties}
            >
              <span className={styles.pathOrder}>{String(learningPaths.length + 1).padStart(2, '0')}</span>
              <span className={styles.pathIcon}><CloudCog size={25} /></span>
              <span className={styles.pathCopy}>
                <small>Hands-on virtual lab</small>
                <strong>DevOps Cloud Lab: Azure · AWS · Google Cloud</strong>
                <span>Build, containerize, deploy, scale, secure, and run one app to 1 million users in simulated cloud consoles.</span>
              </span>
              <span className={styles.pathStats}>
                <span><strong>{devOpsLabs.length}</strong> labs</span>
                <span><strong>{devOpsLabStepCount}</strong> steps</span>
              </span>
              <ArrowRight size={21} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className={styles.studySequence} aria-labelledby="study-sequence-title">
          <div className={styles.sequenceTitle}>
            <BookOpenCheck size={20} />
            <div>
              <span>Recommended sequence</span>
              <h2 id="study-sequence-title">Match the books to your role</h2>
            </div>
          </div>
          <div className={styles.sequenceRows}>
            <p><strong>FDE</strong><span>Software Core + FDE Core</span><ArrowRight size={15} /><span>DevOps Cloud Lab</span></p>
            <p><strong>AI Engineer</strong><span>Software Core + AI Core</span><ArrowRight size={15} /><span>DevOps Cloud Lab</span></p>
            <p><strong>AI FDE</strong><span>Software + FDE + AI Cores</span><ArrowRight size={15} /><span>DevOps Cloud Lab</span></p>
          </div>
        </section>
      </div>
    </main>
  )
}