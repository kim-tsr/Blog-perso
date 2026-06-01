'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function configError() {
  return 'Supabase n\'est pas configuré. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY à votre .env.local.'
}

export async function signInWithProvider(provider: 'github' | 'google') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/auth/signin?error=' + encodeURIComponent(configError()))

  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${origin}/auth/callback` },
  })

  if (error) redirect('/auth/signin?error=' + encodeURIComponent(error.message))
  if (data.url) redirect(data.url)
}

export async function signInWithMagicLink(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  if (!email) redirect('/auth/signin?error=' + encodeURIComponent('Email requis'))

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/auth/signin?error=' + encodeURIComponent(configError()))

  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })

  if (error) redirect('/auth/signin?error=' + encodeURIComponent(error.message))
  redirect('/auth/check-email?email=' + encodeURIComponent(email))
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
