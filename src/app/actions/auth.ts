'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

type AuthState = { error: string } | null

export async function signUp(
  role: 'CLIENT' | 'FREELANCER',
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Email and password are required.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
    },
  })

  if (error) return { error: error.message }

  redirect(`/onboarding/${role.toLowerCase()}`)
}

export async function signIn(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'Email and password are required.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  const role = data.user?.user_metadata?.role
  if (role === 'CLIENT') redirect('/dashboard/client')
  if (role === 'FREELANCER') redirect('/dashboard/freelancer')
  redirect('/onboarding')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
