'use client'

import type { CSSProperties } from 'react'
import { startTransition, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ListChecks,
  RotateCcw,
  ShieldCheck,
  Target,
} from 'lucide-react'
import Link from 'next/link'

import type { AssessmentPath, CompanyId, RoleId } from '@/lib/assessment-paths'
import {
  isPracticeAttemptPassed,
  type PracticeAttempt,
  type PracticeAttempts,
  type StagePractice,
} from '@/lib/practice-model'

import AuthControls from '../../../auth-controls'
import BrandLink from '../../../brand-link'
import styles from '../../../experience.module.css'
import PracticeStagePanel from './practice-stage-panel'

type RoleSummary = {
  id: RoleId
  title: string
  shortTitle: string
  skills: string[]
}

type CompanySummary = {
  id: CompanyId
  name: string
  monogram: string
  accent: string
}

type PathWorkspaceProps = {
  role: RoleSummary
  company: CompanySummary
  path: AssessmentPath
  practiceStages: StagePractice[]
  storageOwner: string
}

type StoredProgress = {
  activeStageId: string
  practiceAttempts: PracticeAttempts
}

function isStoredProgress(value: unknown): value is StoredProgress {
  if (!value || typeof value !== 'object') {
    return false
  }

  const progress = value as Partial<StoredProgress>
  return typeof progress.activeStageId === 'string'
    && (progress.practiceAttempts === undefined
      || (typeof progress.practiceAttempts === 'object' && progress.practiceAttempts !== null))
}

function isPracticeAttempt(value: unknown): value is PracticeAttempt {
  if (!value || typeof value !== 'object') {
    return false
  }

  const attempt = value as Partial<PracticeAttempt>
  return typeof attempt.answer === 'string'
    && typeof attempt.reviewed === 'boolean'
    && Array.isArray(attempt.criteriaMet)
    && attempt.criteriaMet.every((index) => Number.isInteger(index))
}

function sanitizeStoredProgress(
  value: unknown,
  path: AssessmentPath,
  practiceStages: StagePractice[],
): StoredProgress | undefined {
  if (!isStoredProgress(value)) {
    return undefined
  }

  const validStageIds = new Set(path.stages.map((stage) => stage.id))
  const validQuestions = new Map(practiceStages.flatMap((stage) => (
    stage.questions.map((question) => [question.id, question] as const)
  )))
  const practiceAttempts = Object.entries(value.practiceAttempts ?? {}).reduce<PracticeAttempts>(
    (attempts, [questionId, storedAttempt]) => {
      const question = validQuestions.get(questionId)
      if (!question || !isPracticeAttempt(storedAttempt)) {
        return attempts
      }

      attempts[questionId] = {
        answer: storedAttempt.answer.slice(0, 20_000),
        reviewed: storedAttempt.reviewed,
        criteriaMet: [...new Set(storedAttempt.criteriaMet)].filter((index) => (
          index >= 0 && index < question.criteria.length
        )),
      }
      return attempts
    },
    {},
  )

  return {
    activeStageId: validStageIds.has(value.activeStageId) ? value.activeStageId : (path.stages[0]?.id ?? ''),
    practiceAttempts,
  }
}

export default function PathWorkspace({
  role,
  company,
  path,
  practiceStages,
  storageOwner,
}: PathWorkspaceProps) {
  const defaultStageId = path.stages[0]?.id ?? ''
  const storageKey = `vetted-path:v2:${storageOwner}:${role.id}:${company.id}`
  const [activeStageId, setActiveStageId] = useState(defaultStageId)
  const [practiceAttempts, setPracticeAttempts] = useState<PracticeAttempts>({})
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    let savedProgress: StoredProgress | undefined

    try {
      const storedValue = window.localStorage.getItem(storageKey)
      const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : undefined
      savedProgress = sanitizeStoredProgress(parsedValue, path, practiceStages)
    } catch {
      savedProgress = undefined
    }

    startTransition(() => {
      setActiveStageId(savedProgress?.activeStageId ?? defaultStageId)
      setPracticeAttempts(savedProgress?.practiceAttempts ?? {})
      setStorageReady(true)
    })
  }, [defaultStageId, path, practiceStages, storageKey])

  useEffect(() => {
    if (!storageReady) {
      return
    }

    const progress: StoredProgress = { activeStageId, practiceAttempts }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress))
    } catch {
      // Progress remains available for the current session when storage is blocked.
    }
  }, [activeStageId, practiceAttempts, storageKey, storageReady])

  const activeStageIndex = Math.max(path.stages.findIndex((stage) => stage.id === activeStageId), 0)
  const activeStage = path.stages[activeStageIndex]
  const activeStagePractice = practiceStages.find((stage) => stage.stageId === activeStage.id)

  if (!activeStagePractice) {
    throw new Error(`Missing practice stage: ${activeStage.id}`)
  }

  function getStageProgress(stage: AssessmentPath['stages'][number]) {
    const stagePractice = practiceStages.find((practice) => practice.stageId === stage.id)
    if (!stagePractice) {
      throw new Error(`Missing practice stage: ${stage.id}`)
    }

    return {
      completedCount: stagePractice.questions.filter((question) => (
        isPracticeAttemptPassed(question, practiceAttempts[question.id])
      )).length,
      totalCount: stagePractice.questions.length,
    }
  }

  const totalTaskCount = path.stages.reduce((total, stage) => (
    total + getStageProgress(stage).totalCount
  ), 0)
  const totalWeight = path.stages.reduce((total, stage) => total + stage.weight, 0)
  const { completedTaskCount, completedWeight } = path.stages.reduce(
    (progress, stage) => {
      const stageProgress = getStageProgress(stage)

      progress.completedTaskCount += stageProgress.completedCount
      progress.completedWeight += stageProgress.totalCount === 0
        ? 0
        : (stageProgress.completedCount / stageProgress.totalCount) * stage.weight
      return progress
    },
    { completedTaskCount: 0, completedWeight: 0 },
  )
  const progressPercent = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100)
  const activeStageProgress = getStageProgress(activeStage)
  const activeCompletedCount = activeStageProgress.completedCount
  const activeStageComplete = activeStageProgress.totalCount > 0
    && activeCompletedCount === activeStageProgress.totalCount
  const isFirstStage = activeStageIndex === 0
  const isLastStage = activeStageIndex === path.stages.length - 1

  function updatePracticeAttempt(questionId: string, attempt: PracticeAttempt) {
    const isKnownQuestion = practiceStages.some((stage) => (
      stage.questions.some((question) => question.id === questionId)
    ))
    if (!isKnownQuestion) {
      return
    }

    setPracticeAttempts((current) => ({
      ...current,
      [questionId]: {
        ...attempt,
        answer: attempt.answer.slice(0, 20_000),
      },
    }))
  }

  function selectRelativeStage(offset: number) {
    const nextStage = path.stages[activeStageIndex + offset]
    if (nextStage) {
      setActiveStageId(nextStage.id)
    }
  }

  function resetProgress() {
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      // Reset the in-memory state even when storage is unavailable.
    }
    setActiveStageId(defaultStageId)
    setPracticeAttempts({})
  }

  return (
    <main
      className={`${styles.screen} ${styles.workspaceScreen}`}
      style={{ '--company-accent': company.accent } as CSSProperties}
    >
      <header className={styles.topbar}>
        <BrandLink />
        <div className={styles.workspaceHeaderMeta}>
          <span className={styles.savedState}><Check size={14} /> Saved on this device</span>
          <button className={styles.iconButton} type="button" onClick={resetProgress} title="Reset roadmap progress">
            <RotateCcw size={17} />
            <span className={styles.srOnly}>Reset roadmap progress</span>
          </button>
          <AuthControls />
        </div>
      </header>

      <div className={styles.workspaceShell}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/">Roles</Link>
          <ChevronRight size={13} />
          <Link href={`/prepare/${role.id}`}>{role.title}</Link>
          <ChevronRight size={13} />
          <span>{company.name}</span>
        </nav>

        <section className={styles.roadmapHeader}>
          <div className={styles.roadmapIdentity}>
            <span className={styles.companyMonogram}>{company.monogram}</span>
            <div>
              <p className={styles.kicker}>{company.name} assessment roadmap</p>
              <h1>{role.title}</h1>
              <p>{path.stages.length} ordered rounds · Evidence-backed practice sequence</p>
            </div>
          </div>
          <div className={styles.overallProgress} aria-label={`${progressPercent}% roadmap complete`}>
            <div className={styles.progressCopy}>
              <span>Overall readiness</span>
              <strong>{storageReady ? progressPercent : 0}%</strong>
            </div>
            <div className={styles.progressBar}>
              <i style={{ width: `${storageReady ? progressPercent : 0}%` }} />
            </div>
            <small>{completedTaskCount} of {totalTaskCount} practice questions passed</small>
          </div>
        </section>

        <div className={styles.workspaceGrid}>
          <aside className={styles.stageRail}>
            <div className={styles.stageRailHeader}>
              <span>Assessment sequence</span>
              <strong>{path.stages.length} rounds</strong>
            </div>
            <ol>
              {path.stages.map((stage, index) => {
                const stageProgress = getStageProgress(stage)
                const isComplete = stageProgress.totalCount > 0
                  && stageProgress.completedCount === stageProgress.totalCount
                const isActive = stage.id === activeStage.id

                return (
                  <li key={stage.id}>
                    <button
                      className={`${styles.stageButton} ${isActive ? styles.activeStage : ''} ${isComplete ? styles.completeStage : ''}`}
                      type="button"
                      onClick={() => setActiveStageId(stage.id)}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      <span className={styles.stageNumber}>
                        {isComplete ? <Check size={15} /> : String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.stageButtonCopy}>
                        <small>{stage.type}</small>
                        <strong>{stage.title}</strong>
                        <span>{stage.duration}</span>
                      </span>
                      <ChevronRight className={styles.stageChevron} size={16} />
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className={styles.confidenceNote}>
              <ShieldCheck size={16} />
              <span><strong>{path.confidence} confidence</strong>Reviewed {path.lastReviewed}. Exact steps can vary by opening.</span>
            </div>
          </aside>

          <section className={styles.stageDetail} aria-labelledby="active-stage-title">
            <header className={styles.stageDetailHeader}>
              <div>
                <span className={styles.roundLabel}>Round {activeStageIndex + 1} of {path.stages.length}</span>
                <span className={styles.stageType}>{activeStage.type}</span>
                <h2 id="active-stage-title">{activeStage.title}</h2>
              </div>
              <div className={styles.roundWeight}>
                <span>{activeStage.weight}%</span>
                <small>roadmap weight</small>
              </div>
            </header>

            <div className={styles.stageFactRow}>
              <span><Clock3 size={17} /><small>Expected duration</small><strong>{activeStage.duration}</strong></span>
              <span><Target size={17} /><small>Primary signal</small><strong>{activeStage.type}</strong></span>
              <span><ListChecks size={17} /><small>Practice questions</small><strong>{activeStageProgress.totalCount}</strong></span>
            </div>

            <div className={styles.expectationBlock}>
              <span>What this round tests</span>
              <p>{activeStage.summary}</p>
            </div>

            <PracticeStagePanel
              key={activeStagePractice.stageId}
              practice={activeStagePractice}
              attempts={practiceAttempts}
              onAttemptChange={updatePracticeAttempt}
            />
            <div className={styles.practiceCompletionWrap}>
              <div className={`${styles.stageReadiness} ${activeStageComplete ? styles.stageReady : ''}`}>
                {activeStageComplete ? <CheckCircle2 size={19} /> : <Target size={19} />}
                <span>
                  <strong>{activeStageComplete ? 'Round evidence complete' : 'Round evidence still incomplete'}</strong>
                  <small>{activeStageComplete
                    ? 'Every required response passed its rubric. Continue in sequence.'
                    : `${activeCompletedCount} of ${activeStageProgress.totalCount} required responses have passed.`}</small>
                </span>
              </div>
            </div>

            <footer className={styles.stageActions}>
              <button type="button" onClick={() => selectRelativeStage(-1)} disabled={isFirstStage}>
                <ArrowLeft size={17} /> Previous round
              </button>
              <button
                className={styles.primaryStageAction}
                type="button"
                onClick={() => selectRelativeStage(1)}
                disabled={!activeStageComplete || isLastStage}
              >
                {isLastStage && activeStageComplete ? 'Roadmap complete' : 'Continue to next round'}
                {isLastStage && activeStageComplete ? <Check size={17} /> : <ArrowRight size={17} />}
              </button>
            </footer>
          </section>
        </div>
      </div>
    </main>
  )
}