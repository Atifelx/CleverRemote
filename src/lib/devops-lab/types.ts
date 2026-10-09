export const labPlatforms = ['azure', 'aws', 'gcp'] as const

export type LabPlatform = (typeof labPlatforms)[number]

export const labPlatformNames: Record<LabPlatform, string> = {
  azure: 'Azure',
  aws: 'AWS',
  gcp: 'Google Cloud',
}

export type PerPlatform<T> = {
  readonly azure: T
  readonly aws: T
  readonly gcp: T
}

export type PlatformValue<T> = T | PerPlatform<T>
export type PlatformText = PlatformValue<string>

export function pt<T>(azure: T, aws: T, gcp: T): PerPlatform<T> {
  return { azure, aws, gcp }
}

export function lines(...parts: string[]) {
  return parts.join('\n')
}

function isPerPlatform<T>(value: PlatformValue<T>): value is PerPlatform<T> {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && 'azure' in value
    && 'aws' in value
    && 'gcp' in value
}

export function forPlatform<T>(value: PlatformValue<T>, platform: LabPlatform): T {
  return isPerPlatform(value) ? value[platform] : value
}

export function isLabPlatform(value: unknown): value is LabPlatform {
  return typeof value === 'string' && labPlatforms.includes(value as LabPlatform)
}

export type LabOption = {
  label: PlatformText
  feedback?: PlatformText
}

type LabFieldBase = {
  label: PlatformText
  platforms?: readonly LabPlatform[]
}

export type LabFixedField = LabFieldBase & {
  kind: 'fixed'
  value: PlatformText
}

export type LabSelectField = LabFieldBase & {
  kind: 'select'
  options: readonly LabOption[]
  correct: number | readonly number[]
  hint: PlatformText
}

export type LabTextField = LabFieldBase & {
  kind: 'text'
  placeholder?: PlatformText
  /** Case-insensitive regular expression source. */
  accept: PlatformText
  hint: PlatformText
}

export type LabField = LabFixedField | LabSelectField | LabTextField

export type LabCodeBlank = {
  options: readonly LabOption[]
  correct: number
}

export type LabChoiceOption = {
  label: PlatformText
  correct?: boolean
  feedback: PlatformText
}

export type LabTone = 'info' | 'ok' | 'warn' | 'bad'

export type LabSimMetric = {
  label: PlatformText
  unit: string
  max: number
}

export type LabSimFrame = {
  log: PlatformText
  tone: LabTone
  values?: readonly number[]
}

export type LabTask =
  | {
    kind: 'click'
    layout: 'services' | 'menu' | 'toolbar'
    items: readonly PlatformText[]
    target: number
    hint: PlatformText
  }
  | {
    kind: 'form'
    tabs?: PlatformValue<readonly string[]>
    activeTab?: PlatformValue<number>
    fields: readonly LabField[]
    submit: PlatformText
  }
  | {
    kind: 'code'
    file: PlatformText
    /** Blanks are written as [[0]], [[1]] ... */
    code: PlatformText
    blanks: readonly LabCodeBlank[]
  }
  | {
    kind: 'choice'
    question: PlatformText
    options: readonly LabChoiceOption[]
  }
  | {
    kind: 'terminal'
    command: PlatformText
    output: PlatformValue<readonly string[]>
  }
  | {
    kind: 'simulate'
    action: PlatformText
    url?: PlatformText
    metrics?: readonly LabSimMetric[]
    frames: readonly LabSimFrame[]
  }

export type LabSurface = 'cloud' | 'local' | 'github'

export type LabStepSeed = {
  title: PlatformText
  instruction: PlatformText
  why: PlatformText
  surface?: LabSurface
  /** Breadcrumb segments separated by " > ". The last one is the page title. */
  screen: PlatformText
  task: LabTask
  cli?: PlatformText
  result: PlatformText
}

export type LabStep = LabStepSeed & { id: string }

export const architectureNodeIds = [
  'dev',
  'pipeline',
  'registry',
  'network',
  'users',
  'euUsers',
  'waf',
  'edge',
  'euRegion',
  'lb',
  'vm',
  'scaleSet',
  'k8s',
  'redis',
  'db',
  'vault',
  'monitor',
  'queue',
] as const

export type ArchitectureNodeId = (typeof architectureNodeIds)[number]

export type LabSeed = {
  slug: string
  title: string
  mission: string
  concept: readonly string[]
  build: readonly string[]
  architecture: readonly ArchitectureNodeId[]
  steps: readonly LabStepSeed[]
}

export type Lab = Omit<LabSeed, 'steps'> & {
  number: number
  steps: readonly LabStep[]
}
