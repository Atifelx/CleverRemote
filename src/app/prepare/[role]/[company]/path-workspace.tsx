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

import AuthControls from '../../../auth-controls'
import BrandLink from '../../../brand-link'
import styles from '../../../experience.module.css'

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
  storageOwner: string
}

type StoredProgress = {
  activeStageId: string
  completedTaskIds: string[]
}

function taskId(stageId: string, taskIndex: number) {
  return `${stageId}:${taskIndex}`
}

function isStoredProgress(value: unknown): value is StoredProgress {
  if (!value || typeof value !== 'object') {
    return false
  }

  const progress = value as Partial<StoredProgress>
  return typeof progress.activeStageId === 'string'
    && Array.isArray(progress.completedTaskIds)
    && progress.completedTaskIds.every((id) => typeof id === 'string')
}

function sanitizeStoredProgress(value: unknown, path: AssessmentPath): StoredProgress | undefined {
  if (!isStoredProgress(value)) {
    return undefined
  }

  const validStageIds = new Set(path.stages.map((stage) => stage.id))
  const validTaskIds = new Set(path.stages.flatMap((stage) => (
    stage.outcomes.map((_, index) => taskId(stage.id, index))
  )))

  return {
    activeStageId: validStageIds.has(value.activeStageId) ? value.activeStageId : (path.stages[0]?.id ?? ''),
    completedTaskIds: [...new Set(value.completedTaskIds.filter((id) => validTaskIds.has(id)))],
  }
}

export default function PathWorkspace({ role, company, path, storageOwner }: PathWorkspaceProps) {
  const defaultStageId = path.stages[0]?.id ?? ''
  const storageKey = `vetted-path:v1:${storageOwner}:${role.id}:${company.id}`
  const [activeStageId, setActiveStageId] = useState(defaultStageId)
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    let savedProgress: StoredProgress | undefined

    try {
      const storedValue = window.localStorage.getItem(storageKey)
      const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : undefined
      savedProgress = sanitizeStoredProgress(parsedValue, path)
    } catch {
      savedProgress = undefined
    }

    startTransition(() => {
      setActiveStageId(savedProgress?.activeStageId ?? defaultStageId)
      setCompletedTaskIds(savedProgress?.completedTaskIds ?? [])
      setStorageReady(true)
    })
  }, [defaultStageId, path, storageKey])

  useEffect(() => {
    if (!storageReady) {
      return
    }

    const progress: StoredProgress = { activeStageId, completedTaskIds }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress))
    } catch {
      // Progress remains available for the current session when storage is blocked.
    }
  }, [activeStageId, completedTaskIds, storageKey, storageReady])

  const activeStageIndex = Math.max(path.stages.findIndex((stage) => stage.id === activeStageId), 0)
  const activeStage = path.stages[activeStageIndex]
  const totalTaskCount = path.stages.reduce((total, stage) => total + stage.outcomes.length, 0)
  const totalWeight = path.stages.reduce((total, stage) => total + stage.weight, 0)
  const { completedTaskCount, completedWeight } = path.stages.reduce(
    (progress, stage) => {
      const stageCompletedCount = stage.outcomes.filter((_, index) => (
        completedTaskIds.includes(taskId(stage.id, index))
      )).length

      progress.completedTaskCount += stageCompletedCount
      progress.completedWeight += stage.outcomes.length === 0
        ? 0
        : (stageCompletedCount / stage.outcomes.length) * stage.weight
      return progress
    },
    { completedTaskCount: 0, completedWeight: 0 },
  )
  const progressPercent = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100)
  const activeCompletedCount = activeStage.outcomes.filter((_, index) => completedTaskIds.includes(taskId(activeStage.id, index))).length
  const activeStageComplete = activeCompletedCount === activeStage.outcomes.length
  const isFirstStage = activeStageIndex === 0
  const isLastStage = activeStageIndex === path.stages.length - 1

  function toggleTask(stageId: string, taskIndex: number) {
    const id = taskId(stageId, taskIndex)
    setCompletedTaskIds((current) => current.includes(id)
      ? current.filter((task) => task !== id)
      : [...current, id])
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
    setCompletedTaskIds([])
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
              <p>{path.stages.length} ordered rounds · Role-specific preparation sequence</p>
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
            <small>{completedTaskCount} of {totalTaskCount} preparation tasks complete</small>
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
                const stageCompletedCount = stage.outcomes.filter((_, taskIndex) => (
                  completedTaskIds.includes(taskId(stage.id, taskIndex))
                )).length
                const isComplete = stageCompletedCount === stage.outcomes.length
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
              <span><ListChecks size={17} /><small>Readiness tasks</small><strong>{activeStage.outcomes.length}</strong></span>
            </div>

            <div className={styles.expectationBlock}>
              <span>What this round tests</span>
              <p>{activeStage.summary}</p>
            </div>

            <div className={styles.preparationBlock}>
              <div className={styles.preparationHeading}>
                <div>
                  <span>Preparation evidence</span>
                  <h3>Complete before this round</h3>
                </div>
                <strong>{activeCompletedCount}/{activeStage.outcomes.length}</strong>
              </div>

              <div className={styles.taskList}>
                {activeStage.outcomes.map((outcome, index) => {
                  const id = taskId(activeStage.id, index)
                  const isChecked = completedTaskIds.includes(id)

                  return (
                    <label className={styles.taskItem} key={id}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTask(activeStage.id, index)}
                      />
                      <span className={styles.customCheckbox}>{isChecked && <Check size={16} />}</span>
                      <span>
                        <small>Task {String(index + 1).padStart(2, '0')}</small>
                        <strong>{outcome}</strong>
                      </span>
                    </label>
                  )
                })}
              </div>

              <div className={`${styles.stageReadiness} ${activeStageComplete ? styles.stageReady : ''}`}>
                {activeStageComplete ? <CheckCircle2 size={19} /> : <Target size={19} />}
                <span>
                  <strong>{activeStageComplete ? 'Round preparation complete' : 'Round still in preparation'}</strong>
                  <small>{activeStageComplete ? 'Continue to the next stage in sequence.' : 'Finish each evidence task before moving forward.'}</small>
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