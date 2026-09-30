import type { RoleId } from './assessment-paths'

export const learningPathIds = [
  'software-engineering-core',
  'fde-system-delivery-core',
  'ai-engineering-core',
] as const

export type LearningPathId = (typeof learningPathIds)[number]
export type LearningPlatform = 'Turing' | 'Andela' | 'Toptal'
export type LearningMasteryLevel = 'L1' | 'L2'
export type LearningQuestionDifficulty = 'easy' | 'medium' | 'hard'
export type LearningQuestionFrequency = 'core' | 'frequent' | 'targeted'
export type LearningQuestionTarget = 5 | 10 | 15 | 20

export type LearningQuestionOption = {
  id: string
  label: string
}

export type LearningMasteryQuestion = {
  id: string
  prompt: string
  options: readonly LearningQuestionOption[]
  correctOptionId: string
  explanation: string
  difficulty: LearningQuestionDifficulty
  platforms: readonly LearningPlatform[]
}

export type LearningMasteryAttempt = {
  selectedOptionId: string
  reviewed: boolean
}

export type LearningMasteryAttempts = Record<string, LearningMasteryAttempt>

export type LearningMasteryTopic = {
  id: string
  title: string
  masteryLevel: LearningMasteryLevel
  frequency: LearningQuestionFrequency
  questionTarget: LearningQuestionTarget
  questions: readonly LearningMasteryQuestion[]
}

export type LearningMasteryQuestionSeed = {
  prompt: string
  options: readonly [string, string, string, string]
  correctOptionIndex: 0 | 1 | 2 | 3
  explanation: string
  difficulty: LearningQuestionDifficulty
  platforms: readonly LearningPlatform[]
}

export type LearningMasteryTopicSeed = Omit<LearningMasteryTopic, 'questions'> & {
  questions: readonly LearningMasteryQuestionSeed[]
}

export type LearningCodeSample = {
  language: string
  code: string
}

export type LearningWorkedExample = {
  scenario: string
  steps: readonly string[]
  code?: LearningCodeSample
  result: string
}

export type LearningInterviewCheck = {
  prompt: string
  answer: string
}

export type LearningExample = {
  id: string
  title: string
  principle: string
  example: string
  explanation?: readonly string[]
  whyItMatters?: string
  useCases?: readonly string[]
  workedExample?: LearningWorkedExample
  interview?: LearningInterviewCheck
}

export type LearningChapter = {
  id: string
  title: string
  summary: string
  outcomes: readonly string[]
  platformFocus: string
  examples: readonly LearningExample[]
  masteryTopics: readonly LearningMasteryTopic[]
}

export type LearningPath = {
  id: LearningPathId
  title: string
  shortTitle: string
  description: string
  accent: string
  audience: string
  recommendedFor: readonly RoleId[]
  platforms: readonly LearningPlatform[]
  chapters: readonly LearningChapter[]
}

export type DetailedLearningExampleSeed = {
  title: string
  principle: string
  explanation: readonly string[]
  whyItMatters: string
  useCases: readonly string[]
  workedExample: LearningWorkedExample
  interview: LearningInterviewCheck
}

export type LearningExampleSeed =
  | readonly [title: string, principle: string, example: string]
  | DetailedLearningExampleSeed

export type LearningChapterSeed = Omit<LearningChapter, 'examples' | 'masteryTopics'> & {
  examples: readonly LearningExampleSeed[]
  masteryTopics?: readonly LearningMasteryTopic[]
}

export function defineLearningMasteryTopics(
  pathId: LearningPathId,
  chapterId: string,
  topics: readonly LearningMasteryTopicSeed[],
): readonly LearningMasteryTopic[] {
  const topicIds = new Set<string>()
  let questionOffset = 0

  return topics.map((topic) => {
    if (topicIds.has(topic.id)) {
      throw new Error(`Duplicate mastery topic: ${pathId}:${chapterId}:${topic.id}`)
    }
    if (topic.questions.length !== topic.questionTarget) {
      throw new Error(`Mastery topic question count must match its target: ${pathId}:${chapterId}:${topic.id}`)
    }
    const targetMatchesFrequency = topic.frequency === 'targeted'
      ? topic.questionTarget === 5
      : topic.frequency === 'frequent'
        ? topic.questionTarget === 10
        : topic.questionTarget === 15 || topic.questionTarget === 20
    if (!targetMatchesFrequency) {
      throw new Error(`Mastery question target does not match frequency: ${pathId}:${chapterId}:${topic.id}`)
    }
    topicIds.add(topic.id)

    const questions = topic.questions.map((question, questionIndex) => {
      const id = `${pathId}:${chapterId}:${topic.id}:q${String(questionIndex + 1).padStart(2, '0')}`
      const desiredCorrectOptionIndex = (questionOffset + questionIndex) % question.options.length
      const optionShift = (
        question.correctOptionIndex - desiredCorrectOptionIndex + question.options.length
      ) % question.options.length
      const optionLabels = [
        ...question.options.slice(optionShift),
        ...question.options.slice(0, optionShift),
      ]
      const options = optionLabels.map((label, optionIndex) => ({
        id: String.fromCharCode(97 + optionIndex),
        label,
      }))
      const correctOptionId = options[desiredCorrectOptionIndex]?.id

      if (!correctOptionId) {
        throw new Error(`Invalid correct option for mastery question: ${id}`)
      }

      return { ...question, id, options, correctOptionId }
    })
    questionOffset += questions.length

    return { ...topic, questions }
  })
}

export function getLearningMasteryQuestions(
  topic: LearningMasteryTopic,
): readonly LearningMasteryQuestion[] {
  return topic.questions
}

export function isLearningMasteryAttemptPassed(
  question: LearningMasteryQuestion,
  attempt: LearningMasteryAttempt | undefined,
) {
  return attempt?.reviewed === true && attempt.selectedOptionId === question.correctOptionId
}

export function defineLearningPath(
  path: Omit<LearningPath, 'chapters'> & { chapters: readonly LearningChapterSeed[] },
): LearningPath {
  const exampleIds = new Set<string>()
  const chapterIds = new Set<string>()

  const chapters = path.chapters.map((chapter) => {
    if (chapterIds.has(chapter.id)) {
      throw new Error(`Duplicate learning chapter: ${path.id}:${chapter.id}`)
    }
    chapterIds.add(chapter.id)

    const examples = chapter.examples.map((seed, index) => {
      const id = `${path.id}:${chapter.id}:${String(index + 1).padStart(2, '0')}`
      if (exampleIds.has(id)) {
        throw new Error(`Duplicate learning example: ${id}`)
      }
      exampleIds.add(id)

      if ('title' in seed) {
        return {
          id,
          ...seed,
          example: seed.workedExample.scenario,
        }
      }

      const [title, principle, example] = seed
      return { id, title, principle, example }
    })

    return { ...chapter, examples, masteryTopics: chapter.masteryTopics ?? [] }
  })

  return { ...path, chapters }
}

export function getLearningExampleCount(path: LearningPath) {
  return path.chapters.reduce((total, chapter) => total + chapter.examples.length, 0)
}

export function isLearningPathId(value: string): value is LearningPathId {
  return learningPathIds.includes(value as LearningPathId)
}