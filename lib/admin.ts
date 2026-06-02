import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/auth/signin')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'admin') redirect('/account')
  return { supabase, user }
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
