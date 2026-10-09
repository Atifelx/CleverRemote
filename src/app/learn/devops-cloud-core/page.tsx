import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'

import LabWorkspace from './lab-workspace'

export const metadata: Metadata = {
  title: 'DevOps Cloud Lab | CleverCrack',
  description: 'Hands-on virtual lab: build, deploy, scale, secure, and run one app on Azure, AWS, and Google Cloud.',
}

export default async function DevOpsLabPage() {
  const { userId } = await auth()
  return <LabWorkspace storageOwner={userId ?? 'browser'} />
}
