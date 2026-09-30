import type { RoleId } from './assessment-paths'

export const learningPathIds = [
  'software-engineering-core',
  'fde-system-delivery-core',
  'ai-engineering-core',
] as const

export type LearningPathId = (typeof learningPathIds)[number]
export type LearningPlatform = 'Turing' | 'Andela' | 'Toptal'

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

export type LearningChapterSeed = Omit<LearningChapter, 'examples'> & {
  examples: readonly LearningExampleSeed[]
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

    return { ...chapter, examples }
  })

  return { ...path, chapters }
}

export function getLearningExampleCount(path: LearningPath) {
  return path.chapters.reduce((total, chapter) => total + chapter.examples.length, 0)
}

export function isLearningPathId(value: string): value is LearningPathId {
  return learningPathIds.includes(value as LearningPathId)
}