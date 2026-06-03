'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateAccessCode } from '@/lib/codes'
import { logAdminAction } from '@/lib/audit'
import { UserRole } from '@/lib/auth'

async function requireAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/auth/signin')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/admin/codes')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/account')
  return supabase
}

export interface CreateCodeResult { ok: boolean; code?: string; error?: string }

export async function createAccessCode(formData: FormData): Promise<CreateCodeResult> {
  const supabase = await requireAdmin()

  const customCode  = (formData.get('code') as string | null)?.trim() || ''
  const grantsRole  = (formData.get('grantsRole') as UserRole) || 'pro'
  const description = (formData.get('description') as string | null)?.trim() || null
  const maxUsesRaw  = (formData.get('maxUses') as string | null)?.trim()
  const expiresRaw  = (formData.get('expiresAt') as string | null)?.trim()

  const code = (customCode || generateAccessCode()).toUpperCase()
  const max_uses = maxUsesRaw ? Math.max(1, parseInt(maxUsesRaw, 10)) : null
  const expires_at = expiresRaw ? new Date(expiresRaw).toISOString() : null

  const { error } = await supabase
    .from('access_codes')
    .insert({ code, grants_role: grantsRole, description, max_uses, expires_at })

  if (error) return { ok: false, error: error.message }

  await logAdminAction('code.created', 'access_code', code, { grants_role: grantsRole, max_uses, expires_at })

  revalidatePath('/admin/codes')
  return { ok: true, code }
}

export async function toggleAccessCode(code: string, disabled: boolean) {
  const supabase = await requireAdmin()
  await supabase.from('access_codes').update({ disabled }).eq('code', code)
  await logAdminAction(disabled ? 'code.disabled' : 'code.enabled', 'access_code', code)
  revalidatePath('/admin/codes')
}

export async function deleteAccessCode(code: string) {
  const supabase = await requireAdmin()
  await supabase.from('access_codes').delete().eq('code', code)
  await logAdminAction('code.deleted', 'access_code', code)
  revalidatePath('/admin/codes')
}
