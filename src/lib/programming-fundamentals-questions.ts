import type { PracticeQuestion } from './practice-model'

export const programmingFundamentalsQuestions: PracticeQuestion[] = [
  {
    id: 'pf-019',
    source: 'data/questions/00-programming-fundamentals.json',
    kind: 'single-choice',
    difficulty: 'medium',
    topic: 'Closures',
    timeMinutes: 1,
    prompt: 'A closure is:',
    referenceAnswer: 'A closure is a function bundled with references to variables from its enclosing lexical scope. Anonymous functions can be closures, but the concepts are not equivalent.',
    criteria: [],
    minimumAnswerLength: 1,
    options: [
      { id: 'a', label: 'A function without a name' },
      { id: 'b', label: 'A function bundled with references to variables from its enclosing lexical scope' },
      { id: 'c', label: 'A private function' },
      { id: 'd', label: 'A recursive function' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'pf-035',
    source: 'data/questions/00-programming-fundamentals.json',
    kind: 'single-choice',
    difficulty: 'medium',
    topic: 'Combined complexity',
    timeMinutes: 1,
    prompt: 'For each of n elements, you perform a binary search on an array of size m. What is the time complexity?',
    referenceAnswer: 'O(n log m): there are n outer iterations, and each binary search costs O(log m).',
    criteria: [],
    minimumAnswerLength: 1,
    options: [
      { id: 'a', label: 'O(n + m)' },
      { id: 'b', label: 'O(n log m)' },
      { id: 'c', label: 'O(n * m)' },
      { id: 'd', label: 'O(log(n * m))' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'pf-038',
    source: 'data/questions/00-programming-fundamentals.json',
    kind: 'single-choice',
    difficulty: 'medium',
    topic: 'Amortized complexity',
    timeMinutes: 2,
    prompt: 'Python list append is O(1) amortized. What does amortized mean here?',
    referenceAnswer: 'An append occasionally triggers an O(n) resize, but geometric capacity growth makes the average cost per append O(1) across a sequence of operations.',
    criteria: [],
    minimumAnswerLength: 1,
    options: [
      { id: 'a', label: 'Every append is guaranteed to take constant time' },
      { id: 'b', label: 'A resize can cost O(n), but the average cost per append across many operations is O(1)' },
      { id: 'c', label: 'Append is actually O(log n)' },
      { id: 'd', label: 'The complexity depends only on the CPU' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'pf-045',
    source: 'data/questions/00-programming-fundamentals.json',
    kind: 'single-choice',
    difficulty: 'hard',
    topic: 'Hash-map complexity',
    timeMinutes: 1,
    prompt: 'In a conventional hash map, lookup is O(1) on average. What can its worst-case complexity become when many keys collide?',
    referenceAnswer: 'O(n) when colliding entries must be scanned in one bucket. Some implementations treeify large collision buckets and improve that bound to O(log n).',
    criteria: [],
    minimumAnswerLength: 1,
    options: [
      { id: 'a', label: 'O(1) in every case' },
      { id: 'b', label: 'O(n)' },
      { id: 'c', label: 'O(log log n)' },
      { id: 'd', label: 'O(n squared)' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'pf-073',
    source: 'data/questions/00-programming-fundamentals.json',
    kind: 'single-choice',
    difficulty: 'medium',
    topic: 'Composition over inheritance',
    timeMinutes: 2,
    prompt: 'What does "composition over inheritance" mean?',
    referenceAnswer: 'Prefer building behavior from smaller collaborating components over deep inheritance hierarchies when that reduces coupling and keeps behavior easier to change.',
    criteria: [],
    minimumAnswerLength: 1,
    options: [
      { id: 'a', label: 'Prefer inheritance to composition' },
      { id: 'b', label: 'Prefer HAS-A relationships over deep IS-A hierarchies to avoid rigid coupling' },
      { id: 'c', label: 'Never use inheritance' },
      { id: 'd', label: 'Compose classes only at runtime' },
    ],
    correctOptionId: 'b',
  },
  {
    id: 'pf-076',
    source: 'data/questions/00-programming-fundamentals.json',
    kind: 'single-choice',
    difficulty: 'medium',
    topic: 'Liskov substitution principle',
    timeMinutes: 1,
    prompt: 'What does the Liskov substitution principle require?',
    referenceAnswer: 'Code using a base type should continue to behave correctly when given any valid subtype. A subtype must preserve the behavioral contract of its base type.',
    criteria: [],
    minimumAnswerLength: 1,
    options: [
      { id: 'a', label: 'Subclasses must always call super()' },
      { id: 'b', label: 'A base-class object must be replaceable with a subclass object without breaking correctness' },
      { id: 'c', label: 'Every subclass must define a new interface' },
      { id: 'd', label: 'Inheritance should always be preferred to composition' },
    ],
    correctOptionId: 'b',
  },
]

export function getProgrammingFundamentalsQuestion(questionId: string): PracticeQuestion {
  const question = programmingFundamentalsQuestions.find(
    (candidate) => candidate.id === questionId,
  )

  if (!question) {
    throw new Error(`Unknown programming fundamentals question: ${questionId}`)
  }

  return question
}