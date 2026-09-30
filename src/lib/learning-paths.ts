import { aiCoreLearningPath } from './ai-core-learning'
import { fdeCoreLearningPath } from './fde-core-learning'
import {
  getLearningExampleCount,
  type LearningPath,
  type LearningPathId,
} from './learning-model'
import { softwareCoreLearningPath } from './software-core-learning'

export const learningPaths: readonly LearningPath[] = [
  softwareCoreLearningPath,
  fdeCoreLearningPath,
  aiCoreLearningPath,
]

const expectedChapterCounts: Record<LearningPathId, number> = {
  'software-engineering-core': 10,
  'fde-system-delivery-core': 12,
  'ai-engineering-core': 15,
}

for (const path of learningPaths) {
  if (path.chapters.length !== expectedChapterCounts[path.id]) {
    throw new Error(`Invalid chapter count for learning path: ${path.id}`)
  }

  if (getLearningExampleCount(path) <= 100) {
    throw new Error(`Learning path must contain more than 100 examples: ${path.id}`)
  }
}

export function getLearningPath(pathId: LearningPathId) {
  return learningPaths.find((path) => path.id === pathId)
}