'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

type ProfileState = { error: string } | null

export async function saveClientProfile(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string)?.trim()
  const company = (formData.get('company') as string)?.trim()
  const requirementTitle = (formData.get('requirementTitle') as string)?.trim()
  const story = (formData.get('story') as string)?.trim()
  const requiredSkills = formData.getAll('skills') as string[]
  const serviceCategory = (formData.get('serviceCategory') as string)?.trim()

  if (!name) return { error: 'Full name is required.' }
  if (requiredSkills.length === 0) return { error: 'Please select at least one required skill.' }

  const { error } = await supabase.from('client_profiles').upsert(
    {
      user_id: user.id,
      email: user.email,
      name,
      company,
      requirement_title: requirementTitle,
      story,
      required_skills: requiredSkills,
      service_category: serviceCategory || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) return { error: `Could not save profile: ${error.message}` }

  await supabase.auth.updateUser({
    data: { onboarding_complete: true, display_name: name },
  })

  redirect('/dashboard/client')
}

export async function saveFreelancerProfile(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string)?.trim()
  const skills = formData.getAll('skills') as string[]
  const primarySkills = formData.getAll('primarySkills') as string[]
  const serviceCategories = formData.getAll('serviceCategories') as string[]
  const experienceYears = parseInt(formData.get('experienceYears') as string) || 0
  const about = (formData.get('about') as string)?.trim()
  const monthlyRate = (formData.get('monthlyRate') as string)?.trim()

  if (!name) return { error: 'Full name is required.' }
  if (serviceCategories.length === 0) return { error: 'Please select at least one service category.' }

  const allSkills = [...new Set([...primarySkills, ...skills])]

  const { error } = await supabase.from('freelancer_profiles').upsert(
    {
      user_id: user.id,
      email: user.email,
      name,
      skills: allSkills,
      primary_skills: primarySkills,
      service_categories: serviceCategories,
      experience_years: experienceYears,
      about,
      monthly_rate: monthlyRate,
      is_available: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) return { error: `Could not save profile: ${error.message}` }

  await supabase.auth.updateUser({
    data: { onboarding_complete: true, display_name: name },
  })

  redirect('/dashboard/freelancer')
}
