import { automationLabs } from './labs-automation'
import { deliveryLabs } from './labs-delivery'
import { foundationLabs } from './labs-foundation'
import { governanceLabs } from './labs-governance'
import { operateLabs } from './labs-operate'
import { scaleLabs } from './labs-scale'
import { forPlatform, labPlatforms, type Lab, type LabSeed, type LabTask, type PlatformText } from './types'

const labSeeds: readonly LabSeed[] = [
  ...foundationLabs,
  ...scaleLabs,
  ...automationLabs,
  ...deliveryLabs,
  ...governanceLabs,
  ...operateLabs,
]

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function text(value: PlatformText) {
  return forPlatform(value, 'azure')
}

function validateTask(task: LabTask, where: string) {
  for (const platform of labPlatforms) {
    if (task.kind === 'click' && (task.target < 0 || task.target >= task.items.length)) {
      throw new Error(`${where}: click target out of range`)
    }
    if (task.kind === 'form') {
      for (const field of task.fields) {
        if (field.kind === 'select') {
          const correct = Array.isArray(field.correct) ? field.correct : [field.correct]
          if (correct.some((index) => index < 0 || index >= field.options.length)) {
            throw new Error(`${where}: select answer out of range (${text(field.label)})`)
          }
        }
        if (field.kind === 'text') {
          new RegExp(forPlatform(field.accept, platform), 'i')
        }
      }
    }
    if (task.kind === 'code') {
      const markers = forPlatform(task.code, platform).match(/\[\[\d+\]\]/g) ?? []
      if (markers.length !== task.blanks.length) {
        throw new Error(`${where}: ${platform} code has ${markers.length} blanks, expected ${task.blanks.length}`)
      }
      task.blanks.forEach((blank, index) => {
        if (blank.correct < 0 || blank.correct >= blank.options.length) {
          throw new Error(`${where}: blank ${index} answer out of range`)
        }
      })
    }
    if (task.kind === 'choice' && task.options.filter((option) => option.correct).length !== 1) {
      throw new Error(`${where}: choice needs exactly one correct option`)
    }
  }
}

export const devOpsLabs: readonly Lab[] = labSeeds.map((seed, labIndex) => {
  const steps = seed.steps.map((step, stepIndex) => {
    const id = `${seed.slug}-${String(stepIndex + 1).padStart(2, '0')}-${slugify(text(step.title))}`
    validateTask(step.task, id)
    return { ...step, id }
  })

  return { ...seed, number: labIndex + 1, steps }
})

if (new Set(devOpsLabs.map((lab) => lab.slug)).size !== devOpsLabs.length) {
  throw new Error('DevOps lab slugs must be unique')
}

export const devOpsLabStepCount = devOpsLabs.reduce((total, lab) => total + lab.steps.length, 0)

export * from './types'
