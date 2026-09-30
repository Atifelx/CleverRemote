import type { DetailedLearningExampleSeed } from './learning-model'

export type SoftwareLessonDetails = Omit<
  DetailedLearningExampleSeed,
  'title' | 'principle'
>