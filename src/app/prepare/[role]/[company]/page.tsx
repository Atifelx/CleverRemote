import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  assessmentPaths,
  getAssessmentPath,
  getCompany,
  getRole,
  isCompanyId,
  isRoleId,
} from '@/lib/assessment-paths'

import PathWorkspace from './path-workspace'

type AssessmentPathPageProps = {
  params: Promise<{ role: string; company: string }>
}

export function generateStaticParams() {
  return assessmentPaths.map((path) => ({
    role: path.roleId,
    company: path.companyId,
  }))
}

export async function generateMetadata({ params }: AssessmentPathPageProps): Promise<Metadata> {
  const { role: roleParam, company: companyParam } = await params

  if (!isRoleId(roleParam) || !isCompanyId(companyParam)) {
    return { title: 'Interview roadmap | CleverCrack' }
  }

  const role = getRole(roleParam)
  const company = getCompany(companyParam)

  return {
    title: role && company
      ? `${company.name} ${role.title} roadmap | CleverCrack`
      : 'Interview roadmap | CleverCrack',
  }
}

export default async function AssessmentPathPage({ params }: AssessmentPathPageProps) {
  const { userId } = await auth()
  const { role: roleParam, company: companyParam } = await params

  if (!isRoleId(roleParam) || !isCompanyId(companyParam)) {
    notFound()
  }

  const role = getRole(roleParam)
  const company = getCompany(companyParam)
  const path = getAssessmentPath(roleParam, companyParam)

  if (!role || !company || !path) {
    notFound()
  }

  return (
    <PathWorkspace
      key={`${role.id}:${company.id}`}
      role={role}
      company={company}
      path={path}
      storageOwner={userId ?? 'browser'}
    />
  )
}