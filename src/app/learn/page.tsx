import type { Metadata } from 'next'
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Code2,
} from 'lucide-react'
import Link from 'next/link'

import { getLearningExampleCount } from '@/lib/learning-model'
import { learningPaths } from '@/lib/learning-paths'

import AuthControls from '../auth-controls'
import BrandLink from '../brand-link'
import styles from './learn.module.css'

export const metadata: Metadata = {
  title: 'Learning paths | CleverCrack',
  description: 'Master software engineering, FDE delivery, and AI engineering concepts before practicing platform assessments.',
}

const pathIcons = [Code2, BriefcaseBusiness, BrainCircuit]

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
              Three ordered books cover the concepts behind Turing, Andela, and Toptal technical processes. Study examples first, then use the company roadmaps to verify readiness.
            </p>
            <div className={styles.libraryTotals}>
              <span><strong>37</strong> chapters</span>
              <span><strong>323</strong> worked examples</span>
              <span><strong>3</strong> platform lenses</span>
            </div>
          </div>
        </section>

        <section className={styles.pathIndex} aria-labelledby="learning-paths-title">
          <header className={styles.sectionHeading}>
            <div>
              <span>Ordered curricula</span>
              <h2 id="learning-paths-title">Choose where to start</h2>
            </div>
            <p>Software Core is the shared base. Add the delivery or AI book for your target role.</p>
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
            <p><strong>FDE</strong><span>Software Engineering Core</span><ArrowRight size={15} /><span>FDE / System / Delivery Core</span></p>
            <p><strong>AI Engineer</strong><span>Software Engineering Core</span><ArrowRight size={15} /><span>AI Engineering Core</span></p>
            <p><strong>AI FDE</strong><span>Software Engineering Core</span><ArrowRight size={15} /><span>FDE Core + AI Engineering Core</span></p>
          </div>
        </section>
      </div>
    </main>
  )
}