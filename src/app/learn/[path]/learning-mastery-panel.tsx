'use client'

import {
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  RotateCcw,
  Target,
} from 'lucide-react'
import { useState } from 'react'

import type {
  LearningChapter,
  LearningMasteryAttempt,
  LearningMasteryAttempts,
  LearningMasteryTopic,
} from '@/lib/learning-model'
import {
  getLearningMasteryQuestions,
  isLearningMasteryAttemptPassed,
} from '@/lib/learning-model'

import styles from '../learn.module.css'

type LearningMasteryPanelProps = {
  chapter: LearningChapter
  attempts: LearningMasteryAttempts
  onAttemptChange: (questionId: string, attempt: LearningMasteryAttempt) => void
}

function getPassedCount(topic: LearningMasteryTopic, attempts: LearningMasteryAttempts) {
  return getLearningMasteryQuestions(topic).filter((question) => (
    isLearningMasteryAttemptPassed(question, attempts[question.id])
  )).length
}

export default function LearningMasteryPanel({
  chapter,
  attempts,
  onAttemptChange,
}: LearningMasteryPanelProps) {
  const firstOpenTopic = chapter.masteryTopics.find((topic) => (
    getPassedCount(topic, attempts) < topic.questionTarget
  )) ?? chapter.masteryTopics[0]
  const [activeTopicId, setActiveTopicId] = useState(firstOpenTopic?.id ?? '')
  const activeTopicIndex = Math.max(
    chapter.masteryTopics.findIndex((topic) => topic.id === activeTopicId),
    0,
  )
  const activeTopic = chapter.masteryTopics[activeTopicIndex]
  const questions = activeTopic ? getLearningMasteryQuestions(activeTopic) : []
  const firstOpenQuestion = questions.find((question) => (
    !isLearningMasteryAttemptPassed(question, attempts[question.id])
  )) ?? questions[0]
  const [activeQuestionId, setActiveQuestionId] = useState(firstOpenQuestion?.id ?? '')
  const activeQuestionIndex = Math.max(
    questions.findIndex((question) => question.id === activeQuestionId),
    0,
  )
  const activeQuestion = questions[activeQuestionIndex]

  if (!activeTopic || !activeQuestion) {
    return null
  }

  const attempt = attempts[activeQuestion.id] ?? { selectedOptionId: '', reviewed: false }
  const isPassed = isLearningMasteryAttemptPassed(activeQuestion, attempt)
  const passedCount = getPassedCount(activeTopic, attempts)
  const topicMastered = passedCount === questions.length
  const masteredTopicCount = chapter.masteryTopics.filter((topic) => (
    getPassedCount(topic, attempts) === topic.questionTarget
  )).length
  const nextOpenQuestion = questions.find((question, index) => (
    index > activeQuestionIndex
    && !isLearningMasteryAttemptPassed(question, attempts[question.id])
  ))
  const nextOpenTopic = chapter.masteryTopics.find((topic, index) => (
    index > activeTopicIndex && getPassedCount(topic, attempts) < topic.questionTarget
  ))

  function selectTopic(topic: LearningMasteryTopic) {
    const topicQuestions = getLearningMasteryQuestions(topic)
    const nextQuestion = topicQuestions.find((question) => (
      !isLearningMasteryAttemptPassed(question, attempts[question.id])
    )) ?? topicQuestions[0]

    setActiveTopicId(topic.id)
    setActiveQuestionId(nextQuestion?.id ?? '')
  }

  function advance() {
    if (nextOpenQuestion) {
      setActiveQuestionId(nextOpenQuestion.id)
      return
    }

    if (nextOpenTopic) {
      selectTopic(nextOpenTopic)
    }
  }

  return (
    <section className={styles.masteryWorkspace} aria-labelledby="mastery-title">
      <header className={styles.masteryHeader}>
        <div>
          <span>Knowledge verification</span>
          <h3 id="mastery-title">{chapter.title} mastery</h3>
          <p>Demonstrate recall, tracing, and engineering judgment under platform-style constraints.</p>
        </div>
        <strong>{masteredTopicCount}/{chapter.masteryTopics.length} topics mastered</strong>
      </header>

      <div className={styles.masteryLayout}>
        <nav className={styles.masteryTopicList} aria-label={`${chapter.title} topics`}>
          {chapter.masteryTopics.map((topic) => {
            const topicPassedCount = getPassedCount(topic, attempts)
            const isMastered = topicPassedCount === topic.questionTarget
            const isActive = topic.id === activeTopic.id

            return (
              <button
                className={`${styles.masteryTopicButton} ${isActive ? styles.activeMasteryTopic : ''} ${isMastered ? styles.masteredTopic : ''}`}
                type="button"
                key={topic.id}
                onClick={() => selectTopic(topic)}
                aria-current={isActive ? 'step' : undefined}
              >
                {isMastered ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                <span>
                  <strong>{topic.title}</strong>
                  <small>{topicPassedCount}/{topic.questionTarget} correct / {topic.masteryLevel}</small>
                </span>
                <ChevronRight size={15} />
              </button>
            )
          })}
        </nav>

        <article className={`${styles.masteryQuestion} ${topicMastered ? styles.masteredQuestionSet : ''}`}>
          <header>
            <div className={styles.masteryQuestionMeta}>
              <span>{activeTopic.frequency}</span>
              <span>{activeQuestion.difficulty}</span>
              {activeQuestion.platforms.map((platform) => <span key={platform}>{platform}</span>)}
            </div>
            <span className={isPassed ? styles.masteryPassedStatus : undefined}>
              {isPassed ? <CheckCircle2 size={15} /> : <Target size={15} />}
              {isPassed ? 'Correct' : `Question ${activeQuestionIndex + 1} of ${questions.length}`}
            </span>
          </header>

          <div className={styles.masteryTopicProgress}>
            <span>{activeTopic.title}</span>
            <i><b style={{ width: `${Math.round((passedCount / questions.length) * 100)}%` }} /></i>
            <strong>{passedCount}/{questions.length}</strong>
          </div>

          <h4>{activeQuestion.prompt}</h4>

          <fieldset className={styles.masteryChoices} disabled={attempt.reviewed}>
            <legend>Select one answer</legend>
            {activeQuestion.options.map((option) => {
              const isSelected = attempt.selectedOptionId === option.id
              const isCorrectOption = attempt.reviewed && option.id === activeQuestion.correctOptionId
              const isWrongSelection = attempt.reviewed && isSelected && !isPassed

              return (
                <label
                  className={`${isSelected ? styles.selectedMasteryChoice : ''} ${isCorrectOption ? styles.correctMasteryChoice : ''} ${isWrongSelection ? styles.wrongMasteryChoice : ''}`}
                  key={option.id}
                >
                  <input
                    type="radio"
                    name={`mastery-${activeQuestion.id}`}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => onAttemptChange(activeQuestion.id, {
                      selectedOptionId: option.id,
                      reviewed: false,
                    })}
                  />
                  <span>{option.id.toUpperCase()}</span>
                  <strong>{option.label}</strong>
                  {isCorrectOption ? <Check size={16} /> : null}
                </label>
              )
            })}
          </fieldset>

          {!attempt.reviewed ? (
            <div className={styles.masteryCheckBar}>
              <span>Selection pending review</span>
              <button
                type="button"
                disabled={!attempt.selectedOptionId}
                onClick={() => onAttemptChange(activeQuestion.id, { ...attempt, reviewed: true })}
              >
                Check answer <Check size={15} />
              </button>
            </div>
          ) : (
            <div className={`${styles.masteryReview} ${isPassed ? styles.masteryReviewPassed : ''}`}>
              <div>
                {isPassed ? <CheckCircle2 size={22} /> : <Target size={22} />}
                <span>
                  <strong>{isPassed ? 'Concept verified' : 'Review and retry'}</strong>
                  <p>{activeQuestion.explanation}</p>
                </span>
              </div>
              <div>
                {!isPassed ? (
                  <button
                    type="button"
                    onClick={() => onAttemptChange(activeQuestion.id, {
                      selectedOptionId: '',
                      reviewed: false,
                    })}
                  >
                    <RotateCcw size={15} /> Try again
                  </button>
                ) : null}
                {isPassed && (nextOpenQuestion || nextOpenTopic) ? (
                  <button type="button" onClick={advance}>
                    Next check <ChevronRight size={15} />
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  )
}