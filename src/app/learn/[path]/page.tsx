import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { isLearningPathId, learningPathIds } from '@/lib/learning-model'
import { getLearningPath } from '@/lib/learning-paths'

import LearningWorkspace from './learning-workspace'

type LearningPathPageProps = {
  params: Promise<{ path: string }>
}

export function generateStaticParams() {
  return learningPathIds.map((path) => ({ path }))
}

export async function generateMetadata({ params }: LearningPathPageProps): Promise<Metadata> {
  const { path: pathParam } = await params
  const path = isLearningPathId(pathParam) ? getLearningPath(pathParam) : undefined

  return {
    title: path ? `${path.title} learning path | CleverCrack` : 'Learning path | CleverCrack',
    description: path?.description,
  }
}

export default async function LearningPathPage({ params }: LearningPathPageProps) {
  const { userId } = await auth()
  const { path: pathParam } = await params

  if (!isLearningPathId(pathParam)) {
    notFound()
  }

  const path = getLearningPath(pathParam)
  if (!path) {
    notFound()
  }

  return <LearningWorkspace path={path} storageOwner={userId ?? 'browser'} />
}