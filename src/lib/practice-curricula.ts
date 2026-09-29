import {
  assessmentPaths,
  type CompanyId,
  type RoleId,
} from './assessment-paths'
import { fdeTuringPractice } from './fde-turing-practice'
import { historicalPracticeQuestions } from './historical-practice-questions'
import type { PracticeQuestion, StagePractice } from './practice-model'

type CurriculumKey = `${RoleId}:${CompanyId}`
type QuestionSelection = readonly [string, string, string, string]
type StageSelection = {
  stageId: string
  questionIds: QuestionSelection
}

const allQuestions = [
  ...fdeTuringPractice.flatMap((stage) => stage.questions),
  ...historicalPracticeQuestions,
]

const questionBank = new Map<string, PracticeQuestion>()

for (const question of allQuestions) {
  const existingQuestion = questionBank.get(question.id)

  if (existingQuestion === question) {
    continue
  }

  if (existingQuestion) {
    throw new Error(`Duplicate practice question: ${question.id}`)
  }

  if (question.kind === 'single-choice') {
    if (!question.options?.some((option) => option.id === question.correctOptionId)) {
      throw new Error(`Invalid correct option for practice question: ${question.id}`)
    }
  } else if (
    question.criteria.length === 0
    || question.criteria.some((criterion) => criterion.weight <= 0)
  ) {
    throw new Error(`Invalid weighted rubric for practice question: ${question.id}`)
  }

  questionBank.set(question.id, question)
}

function resolveQuestions(ids: QuestionSelection) {
  return ids.map((id) => {
    const question = questionBank.get(id)

    if (!question) {
      throw new Error(`Unknown practice question: ${id}`)
    }

    return question
  })
}

function buildCurriculum(
  roleId: RoleId,
  companyId: CompanyId,
  selections: readonly StageSelection[],
): StagePractice[] {
  const path = assessmentPaths.find(
    (candidate) => candidate.roleId === roleId && candidate.companyId === companyId,
  )

  if (!path) {
    throw new Error(`Assessment path is not available for ${roleId}:${companyId}`)
  }

  const selectionsByStage = new Map(
    selections.map((selection) => [selection.stageId, selection.questionIds]),
  )

  if (
    selections.length !== path.stages.length
    || selectionsByStage.size !== selections.length
  ) {
    throw new Error(`Practice stage selection mismatch for ${roleId}:${companyId}`)
  }

  const pathQuestionIds = new Set<string>()

  return path.stages.map((stage) => {
    const questionIds = selectionsByStage.get(stage.id)

    if (!questionIds) {
      throw new Error(`Practice stage is not available for ${roleId}:${companyId}:${stage.id}`)
    }

    for (const questionId of questionIds) {
      if (pathQuestionIds.has(questionId)) {
        throw new Error(`Duplicate question in ${roleId}:${companyId}: ${questionId}`)
      }

      pathQuestionIds.add(questionId)
    }

    return {
      stageId: stage.id,
      competency: stage.summary,
      preparation: [...stage.outcomes],
      completionRule: 'Pass all four drills. Rubric answers require at least 70%; objective answers must be exact.',
      questions: resolveQuestions(questionIds),
    }
  })
}

const practiceCurricula: Record<CurriculumKey, StagePractice[]> = {
  'forward-deployed-engineer:turing': fdeTuringPractice,
  'forward-deployed-engineer:andela': buildCurriculum('forward-deployed-engineer', 'andela', [
    { stageId: 'profile-review', questionIds: ['pd-101', 'be-201', 'be-501', 'pd-113'] },
    { stageId: 'english-screen', questionIds: ['pd-109', 'be-401', 'be-404', 'be-202'] },
    { stageId: 'skills-assessment', questionIds: ['lct-301', 'lct-603', 'rd-003', 'ei-101'] },
    { stageId: 'expert-interview', questionIds: ['pd-108', 'pd-102', 'sd-003', 'sd-007'] },
    { stageId: 'client-interview', questionIds: ['fce-101', 'fce-201', 'fce-210', 'fce-214'] },
  ]),
  'forward-deployed-engineer:toptal': buildCurriculum('forward-deployed-engineer', 'toptal', [
    { stageId: 'language-personality', questionIds: ['pd-109', 'pd-110', 'pd-119', 'be-202'] },
    { stageId: 'technical-screen', questionIds: ['sd-003', 'sd-009', 'pd-108', 'rd-007'] },
    { stageId: 'live-screening', questionIds: ['lct-208', 'lct-206', 'lct-301', 'lct-605'] },
    { stageId: 'test-project', questionIds: ['lct-401', 'lct-403', 'lct-405', 'cd-505'] },
    { stageId: 'excellence-review', questionIds: ['be-401', 'fce-210', 'pd-113', 'pd-111'] },
  ]),
  'ai-engineer:turing': buildCurriculum('ai-engineer', 'turing', [
    { stageId: 'profile-signal', questionIds: ['pd-101', 'pd-102', 'pd-108', 'pd-120'] },
    { stageId: 'ai-fundamentals', questionIds: ['ae-024', 'ae-022', 'ae-033', 'ae-058'] },
    { stageId: 'practical-coding', questionIds: ['de-019', 'dm-005', 'sq-020', 'sq-030'] },
    { stageId: 'ai-system-design', questionIds: ['ae-019', 'ai-011', 'la-405', 'ai-045'] },
    { stageId: 'matching', questionIds: ['ai-008', 'ai-009', 'ai-015', 'fce-106'] },
  ]),
  'ai-engineer:andela': buildCurriculum('ai-engineer', 'andela', [
    { stageId: 'profile-review', questionIds: ['pd-101', 'pd-108', 'pd-120', 'be-501'] },
    { stageId: 'communication-screen', questionIds: ['ai-015', 'pd-109', 'be-401', 'fce-203'] },
    { stageId: 'ml-assessment', questionIds: ['py-301', 'sq-020', 'ae-024', 'rg-016'] },
    { stageId: 'expert-interview', questionIds: ['ae-018', 'ae-019', 'ai-037', 'la-405'] },
    { stageId: 'client-interview', questionIds: ['fce-115', 'ai-008', 'ai-009', 'fce-114'] },
  ]),
  'ai-engineer:toptal': buildCurriculum('ai-engineer', 'toptal', [
    { stageId: 'language-personality', questionIds: ['pd-109', 'ai-015', 'pd-119', 'be-202'] },
    { stageId: 'ai-skill-review', questionIds: ['ae-018', 'ae-022', 'ae-029', 'ae-054'] },
    { stageId: 'live-problem-solving', questionIds: ['de-019', 'dm-005', 'sq-020', 'sq-030'] },
    { stageId: 'test-project', questionIds: ['ai-038', 'ai-037', 'la-405', 'cd-505'] },
    { stageId: 'excellence-review', questionIds: ['pd-108', 'ai-045', 'ai-009', 'pd-106'] },
  ]),
  'ai-forward-deployed-engineer:turing': buildCurriculum('ai-forward-deployed-engineer', 'turing', [
    { stageId: 'profile-signal', questionIds: ['be-201', 'pd-101', 'be-209', 'pd-120'] },
    { stageId: 'ai-readiness', questionIds: ['py-301', 'sq-020', 'ai-013', 'sd-003'] },
    { stageId: 'solution-interview', questionIds: ['sd-002', 'la-405', 'ai-037', 'ai-038'] },
    { stageId: 'customer-case', questionIds: ['fce-115', 'fce-103', 'fce-106', 'fce-101'] },
    { stageId: 'matching', questionIds: ['fce-209', 'fce-211', 'fce-214', 'fce-215'] },
  ]),
  'ai-forward-deployed-engineer:andela': buildCurriculum('ai-forward-deployed-engineer', 'andela', [
    { stageId: 'profile-review', questionIds: ['pd-101', 'pd-108', 'be-201', 'be-501'] },
    { stageId: 'communication-screen', questionIds: ['ai-015', 'fce-203', 'fce-209', 'be-404'] },
    { stageId: 'applied-assessment', questionIds: ['py-301', 'sq-020', 'rg-016', 'ei-101'] },
    { stageId: 'expert-interview', questionIds: ['ae-019', 'ai-037', 'la-405', 'pd-106'] },
    { stageId: 'client-interview', questionIds: ['fce-115', 'fce-103', 'fce-106', 'fce-114'] },
  ]),
  'ai-forward-deployed-engineer:toptal': buildCurriculum('ai-forward-deployed-engineer', 'toptal', [
    { stageId: 'language-personality', questionIds: ['pd-109', 'ai-015', 'pd-110', 'pd-119'] },
    { stageId: 'hybrid-review', questionIds: ['ae-018', 'ae-054', 'sd-002', 'fce-202'] },
    { stageId: 'live-case', questionIds: ['fce-115', 'fce-103', 'fce-106', 'fce-114'] },
    { stageId: 'test-project', questionIds: ['ai-038', 'ai-037', 'la-405', 'lct-402'] },
    { stageId: 'excellence-review', questionIds: ['pd-120', 'pd-108', 'ai-045', 'pd-113'] },
  ]),
}

function assertCurriculaIntegrity() {
  let stageCount = 0
  let assignmentCount = 0

  for (const path of assessmentPaths) {
    const key: CurriculumKey = `${path.roleId}:${path.companyId}`
    const curriculum = practiceCurricula[key]

    if (curriculum.length !== path.stages.length) {
      throw new Error(`Practice stage count mismatch for ${key}`)
    }

    const questionIds = curriculum.flatMap((stage, index) => {
      if (stage.stageId !== path.stages[index].id) {
        throw new Error(`Practice stage order mismatch for ${key}`)
      }

      if (stage.questions.length !== 4) {
        throw new Error(`Expected four questions for ${key}:${stage.stageId}`)
      }

      return stage.questions.map((question) => question.id)
    })

    if (new Set(questionIds).size !== questionIds.length) {
      throw new Error(`Duplicate practice question within ${key}`)
    }

    stageCount += curriculum.length
    assignmentCount += questionIds.length
  }

  if (
    Object.keys(practiceCurricula).length !== 9
    || stageCount !== 45
    || assignmentCount !== 180
  ) {
    throw new Error('Practice curriculum totals are invalid')
  }
}

assertCurriculaIntegrity()

export function getPracticeStages(roleId: RoleId, companyId: CompanyId) {
  return practiceCurricula[`${roleId}:${companyId}`]
}