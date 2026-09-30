import type { DetailedLearningExampleSeed } from './learning-model'

export type FdeLessonDetails = Omit<
  DetailedLearningExampleSeed,
  'title' | 'principle'
>