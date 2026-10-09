'use client'

import { startTransition, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  Circle,
  Copy,
  Lightbulb,
  RotateCcw,
  Search,
  Settings,
  SquareTerminal,
  Target,
} from 'lucide-react'
import Link from 'next/link'

import {
  devOpsLabs,
  devOpsLabStepCount,
  forPlatform,
  isLabPlatform,
  labPlatformNames,
  labPlatforms,
  type Lab,
  type LabPlatform,
  type LabStep,
} from '@/lib/devops-lab'

import AuthControls from '../../auth-controls'
import BrandLink from '../../brand-link'
import ArchitectureMap from './architecture-map'
import { LabTaskView } from './lab-tasks'
import styles from './lab.module.css'

type StoredLabProgress = {
  platform: LabPlatform
  activeLab: string
  completed: string[]
}

const validStepIds = new Set(devOpsLabs.flatMap((lab) => lab.steps.map((step) => step.id)))
const validLabSlugs = new Set(devOpsLabs.map((lab) => lab.slug))

function readProgress(raw: string | null): StoredLabProgress | undefined {
  if (!raw) return undefined
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object') return undefined
    const stored = value as Partial<StoredLabProgress>
    return {
      platform: isLabPlatform(stored.platform) ? stored.platform : 'azure',
      activeLab: typeof stored.activeLab === 'string' && validLabSlugs.has(stored.activeLab) ? stored.activeLab : devOpsLabs[0].slug,
      completed: Array.isArray(stored.completed)
        ? [...new Set(stored.completed)].filter((id): id is string => typeof id === 'string' && validStepIds.has(id))
        : [],
    }
  } catch {
    return undefined
  }
}

function firstOpenStep(lab: Lab, completed: ReadonlySet<string>) {
  const index = lab.steps.findIndex((step) => !completed.has(step.id))
  return index === -1 ? lab.steps.length - 1 : index
}

const consoleNames: Record<LabPlatform, string> = {
  azure: 'Microsoft Azure',
  aws: 'AWS Console',
  gcp: 'Google Cloud',
}

function ConsoleFrame({ step, platform, children }: { step: LabStep, platform: LabPlatform, children: React.ReactNode }) {
  const surface = step.surface ?? 'cloud'
  const crumbs = forPlatform(step.screen, platform).split(' > ')
  const pageTitle = crumbs[crumbs.length - 1]

  if (surface === 'local') {
    return (
      <div className={`${styles.console} ${styles.consoleLocal}`}>
        <div className={styles.localBar}>
          <span className={styles.trafficLights}><i /><i /><i /></span>
          <span>Your laptop · {crumbs.join(' / ')}</span>
        </div>
        <div className={styles.consoleBody}>{children}</div>
      </div>
    )
  }

  if (surface === 'github') {
    return (
      <div className={`${styles.console} ${styles.consoleGithub}`}>
        <div className={styles.githubBar}>
          <strong>GitHub</strong>
          <span>{crumbs.join(' / ')}</span>
        </div>
        <div className={styles.consoleBody}>{children}</div>
      </div>
    )
  }

  return (
    <div className={`${styles.console} ${styles[`console_${platform}`]}`}>
      <div className={styles.cloudBar}>
        <span className={styles.cloudMenu} aria-hidden="true">☰</span>
        <strong>{consoleNames[platform]}</strong>
        <span className={styles.cloudSearch}><Search size={13} /> Search</span>
        {platform === 'gcp' ? <span className={styles.projectChip}>shop-prod ▾</span> : null}
        {platform === 'aws' ? <span className={styles.projectChip}>N. Virginia ▾</span> : null}
        <span className={styles.cloudIcons} aria-hidden="true"><SquareTerminal size={15} /><Bell size={15} /><Settings size={15} /></span>
      </div>
      <nav className={styles.breadcrumb} aria-label="Console location">
        {crumbs.map((crumb, index) => (
          <span key={`${crumb}-${index}`}>{index > 0 ? <span className={styles.crumbSep}>›</span> : null}{crumb}</span>
        ))}
      </nav>
      <h3 className={styles.consoleTitle}>{pageTitle}</h3>
      <div className={styles.consoleBody}>{children}</div>
    </div>
  )
}

function CliBox({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className={styles.cliBox}>
      <div className={styles.cliHead}>
        <span><SquareTerminal size={14} /> Same thing in the CLI</span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(command).then(() => {
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1500)
            })
          }}
        >
          <Copy size={12} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>{command}</pre>
    </div>
  )
}

export default function LabWorkspace({ storageOwner }: { storageOwner: string }) {
  const storageKey = `clevercrack:devops-lab:v1:${storageOwner}`
  const [platform, setPlatform] = useState<LabPlatform>('azure')
  const [activeLabSlug, setActiveLabSlug] = useState(devOpsLabs[0].slug)
  const [completed, setCompleted] = useState<string[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readProgress(window.localStorage.getItem(storageKey))
    startTransition(() => {
      if (stored) {
        setPlatform(stored.platform)
        setActiveLabSlug(stored.activeLab)
        setCompleted(stored.completed)
        const lab = devOpsLabs.find((item) => item.slug === stored.activeLab) ?? devOpsLabs[0]
        setStepIndex(firstOpenStep(lab, new Set(stored.completed)))
      }
      setReady(true)
    })
  }, [storageKey])

  useEffect(() => {
    if (!ready) return
    const progress: StoredLabProgress = { platform, activeLab: activeLabSlug, completed }
    window.localStorage.setItem(storageKey, JSON.stringify(progress))
  }, [ready, storageKey, platform, activeLabSlug, completed])

  const completedSet = new Set(completed)
  const lab = devOpsLabs.find((item) => item.slug === activeLabSlug) ?? devOpsLabs[0]
  const labIndex = devOpsLabs.indexOf(lab)
  const step = lab.steps[Math.min(stepIndex, lab.steps.length - 1)]
  const stepDone = completedSet.has(step.id)
  const labDoneCount = lab.steps.filter((item) => completedSet.has(item.id)).length
  const labComplete = labDoneCount === lab.steps.length
  const previousArchitecture = labIndex > 0 ? devOpsLabs[labIndex - 1].architecture : []
  const newNodes = lab.architecture.filter((id) => !previousArchitecture.includes(id))
  const totalPercent = Math.round((completed.length / devOpsLabStepCount) * 100)
  const nextLab = devOpsLabs[labIndex + 1]

  function openLab(target: Lab) {
    setActiveLabSlug(target.slug)
    setStepIndex(firstOpenStep(target, completedSet))
  }

  function completeStep() {
    setCompleted((current) => (current.includes(step.id) ? current : [...current, step.id]))
  }

  function canOpenStep(index: number) {
    return index === 0 || lab.steps.slice(0, index).every((item) => completedSet.has(item.id))
  }

  return (
    <main className={styles.labScreen}>
      <header className={styles.topbar}>
        <BrandLink />
        <div className={styles.platformSwitch} role="radiogroup" aria-label="Cloud platform">
          {labPlatforms.map((item) => (
            <button
              type="button"
              role="radio"
              aria-checked={platform === item}
              key={item}
              className={`${styles.platformButton} ${styles[`platform_${item}`]} ${platform === item ? styles.platformActive : ''}`}
              onClick={() => setPlatform(item)}
            >
              {labPlatformNames[item]}
            </button>
          ))}
        </div>
        <div className={styles.topbarActions}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => {
              setCompleted([])
              setActiveLabSlug(devOpsLabs[0].slug)
              setStepIndex(0)
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <AuthControls />
        </div>
      </header>

      <div className={styles.shell}>
        <aside className={styles.labNav} aria-label="Labs">
          <Link className={styles.backLink} href="/learn"><ArrowLeft size={14} /> Learning library</Link>
          <div className={styles.navHead}>
            <strong>DevOps Cloud Lab</strong>
            <span>{completed.length}/{devOpsLabStepCount} steps · {totalPercent}%</span>
            <div className={styles.navProgress}><div style={{ width: `${totalPercent}%` }} /></div>
          </div>
          <ol>
            {devOpsLabs.map((item) => {
              const done = item.steps.filter((labStep) => completedSet.has(labStep.id)).length
              const isActive = item.slug === lab.slug
              return (
                <li key={item.slug}>
                  <button
                    type="button"
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    aria-current={isActive ? 'step' : undefined}
                    onClick={() => openLab(item)}
                  >
                    <span className={styles.navNumber}>{done === item.steps.length ? <CheckCircle2 size={16} /> : String(item.number).padStart(2, '0')}</span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{done}/{item.steps.length} steps</small>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </aside>

        <section className={styles.labMain}>
          <header className={styles.labHeader}>
            <span className={styles.labKicker}>Lab {lab.number} of {devOpsLabs.length} · {labPlatformNames[platform]}</span>
            <h1>{lab.title}</h1>
            <p className={styles.mission}><Target size={16} /> {lab.mission}</p>
            <div className={styles.labIntro}>
              <div>
                <span className={styles.introLabel}>The idea</span>
                <ul>{lab.concept.map((line) => <li key={line}>{line}</li>)}</ul>
              </div>
              <div>
                <span className={styles.introLabel}>You will build</span>
                <div className={styles.buildChips}>{lab.build.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
            </div>
          </header>

          <ol className={styles.stepper} aria-label="Lab steps">
            {lab.steps.map((item, index) => {
              const done = completedSet.has(item.id)
              const open = canOpenStep(index)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={!open}
                    className={`${styles.stepPill} ${index === stepIndex ? styles.stepPillActive : ''} ${done ? styles.stepPillDone : ''}`}
                    onClick={() => setStepIndex(index)}
                  >
                    {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    <span>{index + 1}. {forPlatform(item.title, platform)}</span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className={styles.stage}>
            <div className={styles.stageConsole}>
              <ConsoleFrame step={step} platform={platform}>
                <LabTaskView
                  key={`${step.id}-${platform}`}
                  task={step.task}
                  platform={platform}
                  done={stepDone}
                  onComplete={completeStep}
                />
              </ConsoleFrame>
            </div>

            <aside className={styles.coach} aria-live="polite">
              <span className={styles.coachStep}>Step {stepIndex + 1} of {lab.steps.length}</span>
              <h2>{forPlatform(step.title, platform)}</h2>
              <p className={styles.coachDo}>{forPlatform(step.instruction, platform)}</p>
              <div className={styles.coachWhy}>
                <span><Lightbulb size={14} /> Why</span>
                <p>{forPlatform(step.why, platform)}</p>
              </div>
              {stepDone ? (
                <div className={styles.coachResult}>
                  <CheckCircle2 size={16} />
                  <p>{forPlatform(step.result, platform)}</p>
                </div>
              ) : null}
              {step.cli ? <CliBox command={forPlatform(step.cli, platform)} /> : null}
              <div className={styles.coachNav}>
                <button type="button" className={styles.ghostButton} disabled={stepIndex === 0} onClick={() => setStepIndex(stepIndex - 1)}>
                  <ArrowLeft size={14} /> Back
                </button>
                {stepIndex < lab.steps.length - 1 ? (
                  <button type="button" className={styles.primaryButton} disabled={!stepDone} onClick={() => setStepIndex(stepIndex + 1)}>
                    Next step <ArrowRight size={14} />
                  </button>
                ) : nextLab ? (
                  <button type="button" className={styles.primaryButton} disabled={!labComplete} onClick={() => openLab(nextLab)}>
                    Lab {nextLab.number} <ArrowRight size={14} />
                  </button>
                ) : null}
              </div>
            </aside>
          </div>

          <section className={styles.mapSection} aria-labelledby="system-map-title">
            <header>
              <span className={styles.introLabel}>{labComplete ? 'Lab complete' : 'Your system after this lab'}</span>
              <h2 id="system-map-title">{labComplete ? `Done. This is what you built on ${labPlatformNames[platform]}.` : 'Where this lab fits'}</h2>
              <p>Green dots are live user traffic. Parts marked NEW are added in this lab.</p>
            </header>
            <div className={styles.mapScroll}>
              <ArchitectureMap nodes={lab.architecture} newNodes={newNodes} platform={platform} />
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}
