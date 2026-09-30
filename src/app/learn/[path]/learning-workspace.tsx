'use client'

import type { CSSProperties } from 'react'
import { startTransition, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Target,
} from 'lucide-react'
import Link from 'next/link'

import type { LearningPath } from '@/lib/learning-model'
import { getLearningExampleCount } from '@/lib/learning-model'

import AuthControls from '../../auth-controls'
import BrandLink from '../../brand-link'
import styles from '../learn.module.css'

type LearningWorkspaceProps = {
  path: LearningPath
  storageOwner: string
}

type StoredLearningProgress = {
  activeChapterId: string
  activeExampleId: string
  completedExampleIds: string[]
}

function sanitizeProgress(value: unknown, path: LearningPath): StoredLearningProgress | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const stored = value as Partial<StoredLearningProgress>
  const validChapterIds = new Set(path.chapters.map((chapter) => chapter.id))
  const validExampleIds = new Set(path.chapters.flatMap((chapter) => (
    chapter.examples.map((example) => example.id)
  )))

  if (
    typeof stored.activeChapterId !== 'string'
    || !validChapterIds.has(stored.activeChapterId)
    || typeof stored.activeExampleId !== 'string'
    || !validExampleIds.has(stored.activeExampleId)
    || !Array.isArray(stored.completedExampleIds)
  ) {
    return undefined
  }

  return {
    activeChapterId: stored.activeChapterId,
    activeExampleId: stored.activeExampleId,
    completedExampleIds: [...new Set(stored.completedExampleIds)].filter((id) => (
      typeof id === 'string' && validExampleIds.has(id)
    )),
  }
}

export default function LearningWorkspace({ path, storageOwner }: LearningWorkspaceProps) {
  const firstChapter = path.chapters[0]
  const firstExample = firstChapter?.examples[0]
  const storageKey = `clevercrack:learning:v1:${storageOwner}:${path.id}`
  const [activeChapterId, setActiveChapterId] = useState(firstChapter?.id ?? '')
  const [activeExampleId, setActiveExampleId] = useState(firstExample?.id ?? '')
  const [completedExampleIds, setCompletedExampleIds] = useState<string[]>([])
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    let progress: StoredLearningProgress | undefined

    try {
      const storedValue = window.localStorage.getItem(storageKey)
      const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : undefined
      progress = sanitizeProgress(parsedValue, path)
    } catch {
      progress = undefined
    }

    startTransition(() => {
      setActiveChapterId(progress?.activeChapterId ?? firstChapter?.id ?? '')
      setActiveExampleId(progress?.activeExampleId ?? firstExample?.id ?? '')
      setCompletedExampleIds(progress?.completedExampleIds ?? [])
      setStorageReady(true)
    })
  }, [firstChapter?.id, firstExample?.id, path, storageKey])

  useEffect(() => {
    if (!storageReady) {
      return
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify({
        activeChapterId,
        activeExampleId,
        completedExampleIds,
      } satisfies StoredLearningProgress))
    } catch {
      // Progress remains available in memory when browser storage is blocked.
    }
  }, [activeChapterId, activeExampleId, completedExampleIds, storageKey, storageReady])

  const completedIds = new Set(completedExampleIds)
  const chapterIndex = Math.max(path.chapters.findIndex((chapter) => chapter.id === activeChapterId), 0)
  const chapter = path.chapters[chapterIndex]
  const exampleIndex = Math.max(chapter.examples.findIndex((example) => example.id === activeExampleId), 0)
  const example = chapter.examples[exampleIndex]
  const totalExamples = getLearningExampleCount(path)
  const progressPercent = Math.round((completedExampleIds.length / totalExamples) * 100)
  const chapterCompletedCount = chapter.examples.filter((item) => completedIds.has(item.id)).length
  const chapterComplete = chapterCompletedCount === chapter.examples.length
  const exampleComplete = completedIds.has(example.id)
  const nextExample = chapter.examples[exampleIndex + 1]
  const previousExample = chapter.examples[exampleIndex - 1]
  const nextChapter = path.chapters[chapterIndex + 1]
  const previousChapter = path.chapters[chapterIndex - 1]

  function selectChapter(chapterId: string) {
    const selectedChapter = path.chapters.find((item) => item.id === chapterId)
    if (!selectedChapter) {
      return
    }

    const firstIncomplete = selectedChapter.examples.find((item) => !completedIds.has(item.id))
    setActiveChapterId(selectedChapter.id)
    setActiveExampleId(firstIncomplete?.id ?? selectedChapter.examples[0]?.id ?? '')
  }

  function setExampleComplete(shouldComplete: boolean) {
    setCompletedExampleIds((current) => shouldComplete
      ? [...new Set([...current, example.id])]
      : current.filter((id) => id !== example.id))
  }

  function continueForward() {
    if (nextExample) {
      setActiveExampleId(nextExample.id)
      return
    }

    if (nextChapter) {
      setActiveChapterId(nextChapter.id)
      setActiveExampleId(nextChapter.examples[0]?.id ?? '')
    }
  }

  function goBack() {
    if (previousExample) {
      setActiveExampleId(previousExample.id)
      return
    }

    if (previousChapter) {
      setActiveChapterId(previousChapter.id)
      setActiveExampleId(previousChapter.examples.at(-1)?.id ?? '')
    }
  }

  function resetProgress() {
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      // Reset in-memory progress even when browser storage is blocked.
    }
    setActiveChapterId(firstChapter?.id ?? '')
    setActiveExampleId(firstExample?.id ?? '')
    setCompletedExampleIds([])
  }

  return (
    <main className={styles.learnScreen} style={{ '--path-accent': path.accent } as CSSProperties}>
      <header className={styles.topbar}>
        <BrandLink />
        <div className={styles.workspaceActions}>
          <span className={styles.savedLabel}><Check size={14} /> Saved on this device</span>
          <button className={styles.iconButton} type="button" onClick={resetProgress} title="Reset learning progress">
            <RotateCcw size={17} />
            <span className={styles.srOnly}>Reset learning progress</span>
          </button>
          <AuthControls />
        </div>
      </header>

      <div className={styles.workspaceShell}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/learn">Learning library</Link>
          <ChevronRight size={13} />
          <span>{path.shortTitle}</span>
        </nav>

        <section className={styles.pathHeader}>
          <div className={styles.pathHeaderCopy}>
            <p className={styles.kicker}>Core learning path</p>
            <h1>{path.title}</h1>
            <p>{path.audience}</p>
            <div className={styles.platformTags} aria-label="Platform preparation coverage">
              {path.platforms.map((platform) => <span key={platform}>{platform}</span>)}
            </div>
          </div>
          <div className={styles.overallProgress} aria-label={`${progressPercent}% complete`}>
            <div><span>Learning progress</span><strong>{storageReady ? progressPercent : 0}%</strong></div>
            <i><b style={{ width: `${storageReady ? progressPercent : 0}%` }} /></i>
            <small>{completedExampleIds.length} of {totalExamples} examples understood</small>
          </div>
        </section>

        <div className={styles.learningGrid}>
          <aside className={styles.chapterRail}>
            <header>
              <span>Book contents</span>
              <strong>{path.chapters.length} chapters</strong>
            </header>
            <ol>
              {path.chapters.map((item, index) => {
                const completedCount = item.examples.filter((candidate) => completedIds.has(candidate.id)).length
                const isComplete = completedCount === item.examples.length
                const isActive = item.id === chapter.id

                return (
                  <li key={item.id}>
                    <button
                      className={`${styles.chapterButton} ${isActive ? styles.activeChapter : ''} ${isComplete ? styles.completedChapter : ''}`}
                      type="button"
                      onClick={() => selectChapter(item.id)}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      <span>{isComplete ? <Check size={14} /> : String(index + 1).padStart(2, '0')}</span>
                      <span><strong>{item.title}</strong><small>{completedCount}/{item.examples.length} examples</small></span>
                      <ChevronRight size={15} />
                    </button>
                  </li>
                )
              })}
            </ol>
          </aside>

          <section className={styles.chapterWorkspace} aria-labelledby="chapter-title">
            <header className={styles.chapterHeader}>
              <div>
                <span>Chapter {chapterIndex + 1} of {path.chapters.length}</span>
                <h2 id="chapter-title">{chapter.title}</h2>
                <p>{chapter.summary}</p>
              </div>
              <div className={`${styles.chapterStatus} ${chapterComplete ? styles.chapterStatusComplete : ''}`}>
                {chapterComplete ? <CheckCircle2 size={20} /> : <BookOpen size={20} />}
                <span><strong>{chapterCompletedCount}/{chapter.examples.length}</strong><small>understood</small></span>
              </div>
            </header>

            <div className={styles.outcomeStrip}>
              {chapter.outcomes.map((outcome) => <span key={outcome}><Check size={14} />{outcome}</span>)}
            </div>

            <div className={styles.exampleWorkspace}>
              <nav className={styles.exampleIndex} aria-label={`${chapter.title} examples`}>
                <header><span>Worked examples</span><strong>{chapter.examples.length}</strong></header>
                {chapter.examples.map((item, index) => (
                  <button
                    className={`${styles.exampleButton} ${item.id === example.id ? styles.activeExample : ''}`}
                    type="button"
                    key={item.id}
                    onClick={() => setActiveExampleId(item.id)}
                    aria-current={item.id === example.id ? 'true' : undefined}
                  >
                    {completedIds.has(item.id) ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    <span><small>Example {String(index + 1).padStart(2, '0')}</small><strong>{item.title}</strong></span>
                  </button>
                ))}
              </nav>

              <article className={styles.exampleLesson}>
                <header>
                  <span>Example {exampleIndex + 1} of {chapter.examples.length}</span>
                  <span className={exampleComplete ? styles.understood : undefined}>
                    {exampleComplete ? <CheckCircle2 size={15} /> : <Target size={15} />}
                    {exampleComplete ? 'Understood' : 'Learning'}
                  </span>
                </header>
                <h3>{example.title}</h3>

                <section className={styles.principleBlock}>
                  <span><BookOpen size={16} /> Core concept</span>
                  <p>{example.principle}</p>
                  {example.explanation?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </section>

                <section className={styles.workedBlock}>
                  <span><Lightbulb size={16} /> Worked example</span>
                  <p>{example.workedExample?.scenario ?? example.example}</p>
                  {example.workedExample ? (
                    <>
                      <ol>
                        {example.workedExample.steps.map((step) => <li key={step}>{step}</li>)}
                      </ol>
                      {example.workedExample.code ? (
                        <div className={styles.codeSample}>
                          <span>{example.workedExample.code.language}</span>
                          <pre><code>{example.workedExample.code.code}</code></pre>
                        </div>
                      ) : null}
                      <p className={styles.exampleResult}><strong>Result</strong>{example.workedExample.result}</p>
                    </>
                  ) : null}
                </section>

                {example.whyItMatters && example.useCases ? (
                  <div className={styles.contextGrid}>
                    <section>
                      <span><Target size={16} /> Why it matters</span>
                      <p>{example.whyItMatters}</p>
                    </section>
                    <section>
                      <span><ListChecks size={16} /> Where you use it</span>
                      <ul>{example.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}</ul>
                    </section>
                  </div>
                ) : null}

                <section className={styles.platformBlock}>
                  <span><ListChecks size={16} /> How interviews test this</span>
                  <p>{chapter.platformFocus}</p>
                  {example.interview ? (
                    <div className={styles.interviewCheck}>
                      <p><strong>Question</strong>{example.interview.prompt}</p>
                      <p><strong>Strong answer</strong>{example.interview.answer}</p>
                    </div>
                  ) : null}
                </section>

                <div className={styles.lessonActions}>
                  <button type="button" onClick={goBack} disabled={!previousExample && !previousChapter}>
                    <ArrowLeft size={16} /> Previous
                  </button>
                  <button
                    className={styles.completeButton}
                    type="button"
                    onClick={() => setExampleComplete(!exampleComplete)}
                  >
                    {exampleComplete ? <RotateCcw size={16} /> : <Check size={16} />}
                    {exampleComplete ? 'Mark for review' : 'Mark understood'}
                  </button>
                  {nextExample || nextChapter ? (
                    <button type="button" onClick={continueForward}>
                      Next <ArrowRight size={16} />
                    </button>
                  ) : (
                    <Link href="/">Choose test roadmap <ArrowRight size={16} /></Link>
                  )}
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}