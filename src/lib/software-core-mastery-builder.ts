import {
  defineLearningMasteryTopics,
  type LearningMasteryQuestionSeed,
  type LearningMasteryTopicSeed,
  type LearningPlatform,
  type LearningQuestionDifficulty,
} from './learning-model'

export type SoftwareMasteryQuestionTarget = 8 | 12 | 16 | 20

export type SoftwareMasteryTopicBlueprint = {
  id: string
  title: string
  questionTarget: SoftwareMasteryQuestionTarget
  principle: string
  scenario: string
  action: string
  failure: string
  evidence: string
  boundary: string
  tradeoff: string
  verification: string
  outcome: string
  misconception: string
  operation: string
  review: string
}

type QuestionDraft = Omit<LearningMasteryQuestionSeed, 'platforms'>

const allPlatforms = ['Turing', 'Andela', 'Toptal'] as const
const platformRotations: readonly (readonly LearningPlatform[])[] = [
  allPlatforms,
  ['Turing', 'Andela'],
  ['Andela', 'Toptal'],
  ['Turing', 'Toptal'],
]

function question(
  prompt: string,
  correctOption: string,
  distractors: readonly [string, string, string],
  explanation: string,
  difficulty: LearningQuestionDifficulty,
): QuestionDraft {
  return {
    prompt,
    options: [correctOption, ...distractors],
    correctOptionIndex: 0,
    explanation,
    difficulty,
  }
}

function asSentence(text: string) {
  const value = text.trim()
  return /[.!?]$/.test(value) ? value : `${value}.`
}

function buildQuestionDrafts(topic: SoftwareMasteryTopicBlueprint): readonly QuestionDraft[] {
  const genericDistractors = [
    `Treat ${topic.title} as a naming preference with no effect on behavior`,
    'Assume the happy path proves every relevant case is correct',
    'Add more implementation complexity before identifying a concrete risk',
  ] as const

  return [
    question(
      `Which statement best captures the purpose of ${topic.title}?`,
      topic.principle,
      genericDistractors,
      `${asSentence(topic.principle)} This is the governing idea behind ${topic.title}.`,
      'easy',
    ),
    question(
      `${asSentence(topic.scenario)} What is the strongest next action?`,
      topic.action,
      [
        'Ship the current behavior and wait for users to report its edge cases',
        'Increase every timeout and retry count without collecting evidence',
        'Move the decision into undocumented shared state',
      ],
      `${asSentence(topic.action)} It addresses the decision at the boundary where the scenario can be controlled.`,
      'medium',
    ),
    question(
      `Which observation is the clearest warning sign during a review of ${topic.title}?`,
      topic.failure,
      [
        'The implementation names its assumptions and constraints',
        'The change includes a focused verification step',
        'The owner can explain the expected failure behavior',
      ],
      `${asSentence(topic.failure)} That symptom exposes the failure mode this topic is meant to prevent.`,
      'medium',
    ),
    question(
      `Which evidence is most useful before changing the ${topic.title} design?`,
      topic.evidence,
      [
        'A preference stated without runtime or user evidence',
        'The number of files in the repository',
        'A formatting diff unrelated to the behavior',
      ],
      `${asSentence(topic.evidence)} Relevant evidence makes the next decision falsifiable instead of speculative.`,
      'medium',
    ),
    question(
      `Which boundary case deserves explicit treatment for ${topic.title}?`,
      topic.boundary,
      [
        'Only the most common successful input',
        'A variable rename that cannot affect behavior',
        'The editor theme used by the implementer',
      ],
      `The relevant boundary occurs when ${asSentence(topic.boundary)} Boundary behavior is part of the contract and should not be left to accident.`,
      'medium',
    ),
    question(
      `Which tradeoff should be made explicit when applying ${topic.title}?`,
      topic.tradeoff,
      [
        'There is no cost or downside once the pattern is selected',
        'The option with the most components is always the safest',
        'Implementation speed is the only constraint worth considering',
      ],
      `${asSentence(topic.tradeoff)} Naming both sides prevents a pattern from being applied without regard to context.`,
      'hard',
    ),
    question(
      `Which check gives the strongest confidence that ${topic.title} works as intended?`,
      topic.verification,
      [
        'Confirm that the new code has more lines than the old code',
        'Rely on a successful compile without exercising behavior',
        'Verify only a mocked happy path with no boundary assertions',
      ],
      `${asSentence(topic.verification)} The check observes the behavior or invariant that matters rather than an implementation detail.`,
      'medium',
    ),
    question(
      `What is the most valuable outcome of applying ${topic.title} well?`,
      topic.outcome,
      [
        'Every future change becomes risk-free',
        'The system no longer needs monitoring or tests',
        'All design decisions can be hidden from reviewers',
      ],
      `${asSentence(topic.outcome)} That outcome connects the technique to an observable engineering benefit.`,
      'easy',
    ),
    question(
      `Which claim about ${topic.title} is misleading?`,
      topic.misconception,
      [
        topic.principle,
        topic.tradeoff,
        topic.boundary,
      ],
      `${asSentence(topic.misconception)} It removes context or guarantees that the technique cannot actually provide.`,
      'medium',
    ),
    question(
      `Which operational practice best supports ${topic.title} after release?`,
      topic.operation,
      [
        'Remove diagnostics once the first successful request completes',
        'Treat every failure as an unrelated one-off event',
        'Depend on manual memory instead of a repeatable response',
      ],
      `${asSentence(topic.operation)} Production feedback is needed to confirm that the intended behavior survives real conditions.`,
      'medium',
    ),
    question(
      `What should a reviewer ask about a change involving ${topic.title}?`,
      topic.review,
      [
        'Can the change be approved without understanding its behavior?',
        'Can tests be removed to make the diff shorter?',
        'Can the documented constraint be replaced with an assumption?',
      ],
      `${asSentence(topic.review)} A focused review question exposes assumptions that code shape alone may hide.`,
      'medium',
    ),
    question(
      `In this screening scenario, ${asSentence(topic.scenario)} Which response demonstrates practical ${topic.title} judgment?`,
      topic.action,
      [
        `Ignore the scenario because ${topic.title} is only relevant after deployment`,
        'Choose an implementation before stating the required behavior',
        'Optimize an unrelated component and assume the issue disappears',
      ],
      `${asSentence(topic.action)} The response acts on the specific scenario instead of reciting the concept abstractly.`,
      'hard',
    ),
    question(
      `A team observes this failure: ${asSentence(topic.failure)} What should it inspect first?`,
      topic.evidence,
      [
        'An unrelated successful request from a different environment',
        'Only the final error message with all context removed',
        'The age of the repository rather than the failing behavior',
      ],
      `${asSentence(topic.evidence)} This evidence can confirm or disprove the most local explanation for the observed failure.`,
      'hard',
    ),
    question(
      `A proposed ${topic.title} solution handles the normal path. What question most directly probes its completeness?`,
      `How does it behave when ${topic.boundary}`,
      [
        'Does it use the longest available function names?',
        'Can it avoid documenting every externally visible behavior?',
        'Can it add another layer without a concrete requirement?',
      ],
      `The relevant boundary occurs when ${asSentence(topic.boundary)} A solution is incomplete until its meaningful boundary behavior is defined and checked.`,
      'hard',
    ),
    question(
      `Why should ${topic.title} be evaluated against constraints instead of applied mechanically?`,
      topic.tradeoff,
      [
        'Every implementation has identical costs at every scale',
        'Patterns eliminate the need to understand the domain',
        'A popular approach is correct regardless of failure behavior',
      ],
      `${asSentence(topic.tradeoff)} The right choice follows from the relevant constraints, not from the name of a pattern.`,
      'hard',
    ),
    question(
      `Which regression check best protects the desired ${topic.title} outcome?`,
      `${asSentence(topic.verification)} Confirm that this preserves: ${topic.outcome}`,
      [
        'Snapshot unrelated source formatting and ignore behavior',
        'Assert only that the main function was called once',
        'Run no check because the implementation looks conventional',
      ],
      `${asSentence(topic.verification)} It should protect the observable outcome: ${topic.outcome}`,
      'hard',
    ),
    question(
      `Which production signal would make the ${topic.title} design easier to operate?`,
      `${asSentence(topic.evidence)} Use it with this response practice: ${topic.operation}`,
      [
        'A single unstructured message shared by every request',
        'A dashboard that omits failures and saturation',
        'A metric whose unit and population are undefined',
      ],
      `${asSentence(topic.evidence)} Combined with ${topic.operation.toLowerCase()}, it supports diagnosis and response after release.`,
      'hard',
    ),
    question(
      `Which code-review finding is most likely to predict a future ${topic.title} defect?`,
      `${asSentence(topic.failure)} The review should ask: ${topic.review}`,
      [
        'The change is small and its assumptions are explicit',
        'The relevant invariant has a focused regression test',
        'The rollback and monitoring path are documented',
      ],
      `${asSentence(topic.failure)} The review question, ${topic.review.toLowerCase()}, targets the underlying risk.`,
      'hard',
    ),
    question(
      `Which correction best addresses a common misconception about ${topic.title}?`,
      `${asSentence(topic.misconception)} Instead, ${topic.principle}`,
      [
        'Keep the misconception but add a comment repeating it',
        'Avoid stating any contract so callers can decide independently',
        'Replace measured evidence with a broader assumption',
      ],
      `${asSentence(topic.principle)} This replaces the misleading claim with the actual engineering principle.`,
      'medium',
    ),
    question(
      `Which answer shows the strongest senior-level understanding of ${topic.title}?`,
      `${asSentence(topic.principle)} In practice, the key tradeoff is: ${topic.tradeoff}`,
      [
        `${topic.title} is always required and has no meaningful downside`,
        `${topic.title} matters only when an interviewer asks about it`,
        `${topic.title} replaces the need for verification and operational feedback`,
      ],
      `${asSentence(topic.principle)} Senior judgment also names the constraint: ${topic.tradeoff}`,
      'hard',
    ),
  ]
}

export function defineSoftwareMasteryTopics(
  chapterId: string,
  blueprints: readonly SoftwareMasteryTopicBlueprint[],
) {
  if (blueprints.length !== 20) {
    throw new Error(`Software mastery chapter must define exactly 20 topics: ${chapterId}`)
  }

  const topics: readonly LearningMasteryTopicSeed[] = blueprints.map((topic) => {
    const drafts = buildQuestionDrafts(topic).slice(0, topic.questionTarget)
    const frequency = topic.questionTarget === 8
      ? 'targeted'
      : topic.questionTarget === 12
        ? 'frequent'
        : 'core'

    return {
      id: topic.id,
      title: topic.title,
      masteryLevel: 'L2',
      frequency,
      questionTarget: topic.questionTarget,
      questions: drafts.map((draft, index) => ({
        ...draft,
        platforms: platformRotations[index % platformRotations.length] ?? allPlatforms,
      })),
    }
  })

  return defineLearningMasteryTopics('software-engineering-core', chapterId, topics)
}