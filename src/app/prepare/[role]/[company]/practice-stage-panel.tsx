'use client'

import {
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileText,
  RotateCcw,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { useState } from 'react'

import {
  getPracticeScore,
  isPracticeAttemptPassed,
  PRACTICE_PASS_SCORE,
  type PracticeAttempt,
  type PracticeAttempts,
  type StagePractice,
} from '@/lib/practice-model'

import styles from '../../../experience.module.css'

type PracticeStagePanelProps = {
  practice: StagePractice
  attempts: PracticeAttempts
  onAttemptChange: (questionId: string, attempt: PracticeAttempt) => void
}

const emptyAttempt: PracticeAttempt = {
  answer: '',
  reviewed: false,
  criteriaMet: [],
}

function formatTimeTarget(timeMinutes: number) {
  const totalSeconds = Math.round(timeMinutes * 60)

  return totalSeconds % 60 === 0
    ? `${totalSeconds / 60} min target`
    : `${totalSeconds} sec target`
}

export default function PracticeStagePanel({
  practice,
  attempts,
  onAttemptChange,
}: PracticeStagePanelProps) {
  const firstOpenQuestion = practice.questions.find((question) => (
    !isPracticeAttemptPassed(question, attempts[question.id])
  )) ?? practice.questions[0]
  const [activeQuestionId, setActiveQuestionId] = useState(firstOpenQuestion?.id ?? '')
  const activeQuestionIndex = Math.max(
    practice.questions.findIndex((question) => question.id === activeQuestionId),
    0,
  )
  const activeQuestion = practice.questions[activeQuestionIndex]

  if (!activeQuestion) {
    return null
  }

  const attempt = attempts[activeQuestion.id] ?? emptyAttempt
  const isChoiceQuestion = activeQuestion.kind === 'single-choice'
  const answerLength = attempt.answer.trim().length
  const canReview = isChoiceQuestion
    ? Boolean(attempt.answer)
    : answerLength >= activeQuestion.minimumAnswerLength
  const score = getPracticeScore(activeQuestion, attempt)
  const scorePercent = Math.round(score * 100)
  const isPassed = isPracticeAttemptPassed(activeQuestion, attempt)
  const passedCount = practice.questions.filter((question) => (
    isPracticeAttemptPassed(question, attempts[question.id])
  )).length
  const nextQuestion = practice.questions[activeQuestionIndex + 1]

  function revealBenchmark() {
    if (!canReview) {
      return
    }

    onAttemptChange(activeQuestion.id, {
      ...attempt,
      reviewed: true,
      criteriaMet: [],
    })
  }

  function toggleCriterion(index: number) {
    const criteriaMet = attempt.criteriaMet.includes(index)
      ? attempt.criteriaMet.filter((criterionIndex) => criterionIndex !== index)
      : [...attempt.criteriaMet, index]

    onAttemptChange(activeQuestion.id, { ...attempt, criteriaMet })
  }

  function reviseAnswer() {
    onAttemptChange(activeQuestion.id, {
      ...attempt,
      reviewed: false,
      criteriaMet: [],
    })
  }

  return (
    <>
      <section className={styles.learningBlock} aria-labelledby="round-playbook-title">
        <div className={styles.learningCopy}>
          <span><BookOpenCheck size={16} /> Learn this first</span>
          <h3 id="round-playbook-title">Round playbook</h3>
          <p>{practice.competency}</p>
        </div>
        <div className={styles.preparationSteps}>
          <span>How to prepare</span>
          <ol>
            {practice.preparation.map((step, index) => (
              <li key={step}>
                <i>{String(index + 1).padStart(2, '0')}</i>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.practiceBlock} aria-labelledby="practice-queue-title">
        <div className={styles.practiceHeading}>
          <div>
            <span>Practice and verify</span>
            <h3 id="practice-queue-title">Round question queue</h3>
            <p>{practice.completionRule}</p>
          </div>
          <strong>{passedCount}/{practice.questions.length} passed</strong>
        </div>

        <div className={styles.questionQueue} role="tablist" aria-label="Round practice questions">
          {practice.questions.map((question, index) => {
            const questionPassed = isPracticeAttemptPassed(question, attempts[question.id])
            const isActive = question.id === activeQuestion.id

            return (
              <button
                className={`${styles.questionTab} ${isActive ? styles.activeQuestionTab : ''} ${questionPassed ? styles.passedQuestionTab : ''}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="active-practice-question"
                key={question.id}
                onClick={() => setActiveQuestionId(question.id)}
              >
                <span>{questionPassed ? <Check size={15} /> : String(index + 1).padStart(2, '0')}</span>
                <span>
                  <small>{question.id}</small>
                  <strong>{question.topic}</strong>
                </span>
                <ChevronRight size={15} />
              </button>
            )
          })}
        </div>

        <article
          className={`${styles.questionWorkspace} ${isPassed ? styles.passedQuestionWorkspace : ''}`}
          id="active-practice-question"
          role="tabpanel"
        >
          <header className={styles.questionHeader}>
            <div className={styles.questionMeta}>
              <span>{activeQuestion.kind === 'code-review' ? <Code2 size={14} /> : <FileText size={14} />}</span>
              <span>{activeQuestion.difficulty}</span>
              <span>{formatTimeTarget(activeQuestion.timeMinutes)}</span>
              <span>Source {activeQuestion.id}</span>
            </div>
            <span className={`${styles.questionStatus} ${isPassed ? styles.passedQuestionStatus : ''}`}>
              {isPassed ? <CheckCircle2 size={15} /> : <Target size={15} />}
              {isPassed ? 'Passed' : attempt.reviewed ? `${scorePercent}% rubric score` : 'Response required'}
            </span>
          </header>

          <h4>{activeQuestion.prompt}</h4>

          {isChoiceQuestion ? (
            <fieldset className={styles.choiceField} disabled={attempt.reviewed}>
              <legend>Select one answer</legend>
              <div className={styles.choiceList}>
                {activeQuestion.options?.map((option) => (
                  <label
                    className={attempt.answer === option.id ? styles.selectedChoice : undefined}
                    key={option.id}
                  >
                    <input
                      type="radio"
                      name={`answer-${activeQuestion.id}`}
                      value={option.id}
                      checked={attempt.answer === option.id}
                      onChange={() => onAttemptChange(activeQuestion.id, {
                        answer: option.id,
                        reviewed: false,
                        criteriaMet: [],
                      })}
                    />
                    <span>{option.id.toUpperCase()}</span>
                    <strong>{option.label}</strong>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <label className={styles.answerField} htmlFor={`answer-${activeQuestion.id}`}>
              <span>{activeQuestion.kind === 'code-review' ? 'Your solution' : 'Your structured response'}</span>
              <textarea
                id={`answer-${activeQuestion.id}`}
                value={attempt.answer}
                disabled={attempt.reviewed}
                spellCheck={activeQuestion.kind !== 'code-review'}
                onChange={(event) => onAttemptChange(activeQuestion.id, {
                  answer: event.target.value,
                  reviewed: false,
                  criteriaMet: [],
                })}
                placeholder={activeQuestion.kind === 'code-review'
                  ? 'Write the implementation and note the failure cases you would test...'
                  : 'Draft the answer you would give in the interview...'}
              />
              <small className={canReview ? styles.answerReady : ''}>
                {answerLength} / {activeQuestion.minimumAnswerLength} character minimum before benchmark review
              </small>
            </label>
          )}

          {!attempt.reviewed ? (
            <div className={styles.reviewGate}>
              <div>
                <ShieldCheck size={18} />
                <span>
                  <strong>Answer before revealing the benchmark</strong>
                  <small>{isChoiceQuestion
                    ? 'Your selection is checked only after you commit to an answer.'
                    : 'Your draft stays on this device and is the evidence used for rubric review.'}</small>
                </span>
              </div>
              <button type="button" disabled={!canReview} onClick={revealBenchmark}>
                <BookOpenCheck size={16} /> {isChoiceQuestion ? 'Check answer' : 'Compare with benchmark'}
              </button>
            </div>
          ) : (
            <div className={styles.reviewWorkspace}>
              <section className={styles.referencePanel}>
                <span>{isChoiceQuestion
                  ? 'Answer explanation'
                  : activeQuestion.kind === 'code-review' ? 'Reference solution' : 'Model answer'}</span>
                <pre className={activeQuestion.kind === 'code-review' ? styles.codeReference : ''}>
                  {activeQuestion.referenceAnswer}
                </pre>
              </section>

              {isChoiceQuestion ? (
                <section className={`${styles.objectiveResult} ${isPassed ? styles.correctObjectiveResult : ''}`}>
                  <span>Answer check</span>
                  <div>
                    {isPassed ? <CheckCircle2 size={24} /> : <Target size={24} />}
                    <span>
                      <strong>{isPassed ? 'Correct' : 'Not correct yet'}</strong>
                      <small>The correct answer is {activeQuestion.correctOptionId?.toUpperCase()}.</small>
                    </span>
                  </div>
                </section>
              ) : (
                <fieldset className={styles.rubricPanel}>
                  <legend>Score only what your submitted answer demonstrates</legend>
                  <div className={styles.rubricScore}>
                    <span>
                      <strong>{scorePercent}%</strong>
                      <small>{Math.round(PRACTICE_PASS_SCORE * 100)}% required</small>
                    </span>
                    <i><b style={{ width: `${scorePercent}%` }} /></i>
                  </div>
                  <div className={styles.rubricList}>
                    {activeQuestion.criteria.map((criterion, index) => {
                      const isMet = attempt.criteriaMet.includes(index)

                      return (
                        <label key={criterion.label}>
                          <input
                            type="checkbox"
                            checked={isMet}
                            onChange={() => toggleCriterion(index)}
                          />
                          <span className={styles.rubricCheck}>{isMet && <Check size={14} />}</span>
                          <span>{criterion.label}</span>
                          <small>{criterion.weight} pt</small>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )}

              <div className={`${styles.questionResult} ${isPassed ? styles.passedQuestionResult : ''}`}>
                {isPassed ? <CheckCircle2 size={19} /> : <Target size={19} />}
                <span>
                  <strong>{isPassed ? 'Evidence accepted' : 'Revision still needed'}</strong>
                  <small>{isPassed
                    ? 'This question now contributes to weighted roadmap readiness.'
                    : isChoiceQuestion
                      ? 'Review the explanation, then revise your selection.'
                      : 'Revise your answer until it genuinely covers enough of the weighted rubric.'}</small>
                </span>
                <div>
                  <button type="button" onClick={reviseAnswer}>
                    <RotateCcw size={15} /> {isChoiceQuestion ? 'Try again' : 'Revise response'}
                  </button>
                  {isPassed && nextQuestion && (
                    <button type="button" onClick={() => setActiveQuestionId(nextQuestion.id)}>
                      Next question <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>
      </section>
    </>
  )
}