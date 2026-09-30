import type { DetailedLearningExampleSeed } from './learning-model'

export type AiLessonDetails = Omit<
  DetailedLearningExampleSeed,
  'title' | 'principle'
>