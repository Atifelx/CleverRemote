export type QuestionType =
  | "mcq-single"
  | "mcq-multi"
  | "code-output"
  | "short-code"
  | "open-rubric";

export type Difficulty = "easy" | "medium" | "hard";

export type Option = { id: string; text: string };

export type RubricItem = { criterion: string; weight: number };

export type Question = {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  topic: string;
  subtopic?: string;
  niche?: string;
  timeBudgetSec?: number;
  tracks?: string[];
  prompt: string;
  code?: string;
  options?: Option[];
  correct?: string[];
  explanation?: string;
  rubric?: RubricItem[];
  modelAnswer?: string;
  tags?: string[];
  sourcePlatforms?: string[];
};

export type Module = {
  module: string;
  title: string;
  description: string;
  platformCoverage?: string[];
  tracks?: string[];
  testStages?: string[];
  estimatedHours: number;
  studyNotes?: Record<string, string[]>;
  questions: Question[];
};

export type PlanDay = { day: number; modules: string[]; focus: string };
export type Plan = { label: string; description: string; days: PlanDay[] };

export type Manifest = {
  version: string;
  generatedAt: string;
  role: string;
  stackFocus: string;
  platforms: { id: string; name: string; url: string; notes: string }[];
  modules: {
    id: string;
    file: string;
    priority: number;
    estimatedHours: number;
  }[];
  plans: Record<string, Plan>;
};

export type QuestionProgress = {
  answered: boolean;
  correct?: boolean;
  selfScore?: number;
  lastSeenAt: number;
};

export type AppProgress = {
  currentPlan?: string;
  currentDay?: number;
  lastModuleId?: string;
  lastQuestionId?: string;
  questions: Record<string, QuestionProgress>;
};

export type Track = "turing" | "andela" | "all";
