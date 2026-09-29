export const PRACTICE_PASS_SCORE = 0.7

export type PracticeCriterion = {
  label: string
  weight: number
}

export type PracticeOption = {
  id: string
  label: string
}

export type PracticeQuestion = {
  id: string
  source: string
  kind: 'code-review' | 'rubric' | 'single-choice'
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  timeMinutes: number
  prompt: string
  referenceAnswer: string
  criteria: PracticeCriterion[]
  minimumAnswerLength: number
  options?: PracticeOption[]
  correctOptionId?: string
}

export type StagePractice = {
  stageId: string
  competency: string
  preparation: string[]
  completionRule: string
  questions: PracticeQuestion[]
}

export type PracticeAttempt = {
  answer: string
  reviewed: boolean
  criteriaMet: number[]
}

export type PracticeAttempts = Record<string, PracticeAttempt>

export function getPracticeScore(question: PracticeQuestion, attempt?: PracticeAttempt) {
  if (!attempt?.reviewed) {
    return 0
  }

  if (question.kind === 'single-choice') {
    return attempt.answer === question.correctOptionId ? 1 : 0
  }

  const totalWeight = question.criteria.reduce((total, criterion) => total + criterion.weight, 0)
  const earnedWeight = question.criteria.reduce((total, criterion, index) => (
    total + (attempt.criteriaMet.includes(index) ? criterion.weight : 0)
  ), 0)

  return totalWeight === 0 ? 0 : earnedWeight / totalWeight
}

export function isPracticeAttemptPassed(question: PracticeQuestion, attempt?: PracticeAttempt) {
  return Boolean(
    attempt
    && (question.kind === 'single-choice'
      ? attempt.answer === question.correctOptionId
      : attempt.answer.trim().length >= question.minimumAnswerLength)
    && getPracticeScore(question, attempt) >= PRACTICE_PASS_SCORE,
  )
}