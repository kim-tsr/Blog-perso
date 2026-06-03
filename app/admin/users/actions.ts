'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/audit'
import type { UserRole } from '@/lib/auth'

async function requireAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/auth/signin')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/admin/users')
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/account')
  return supabase
}

export interface SetRoleResult { ok: boolean; error?: string }

export async function setUserRole(formData: FormData): Promise<SetRoleResult> {
  const supabase = await requireAdmin()
  const userId = (formData.get('userId') as string | null)?.trim()
  const role   = (formData.get('role')   as UserRole | null) ?? null

  if (!userId || !role) return { ok: false, error: 'missing_params' }
  if (!['free', 'pro', 'admin'].includes(role)) return { ok: false, error: 'invalid_role' }

  const { data, error } = await supabase.rpc('admin_set_user_role', {
    p_user_id: userId,
    p_role: role,
  })
  if (error) return { ok: false, error: error.message }
  const res = (data ?? {}) as { ok: boolean; error?: string }
  if (!res.ok) return { ok: false, error: res.error }

  await logAdminAction('user.role_changed', 'user', userId, { new_role: role })

  revalidatePath('/admin/users')
  return { ok: true }
}
