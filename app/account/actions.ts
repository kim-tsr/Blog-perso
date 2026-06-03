'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { REDEEM_ERRORS } from '@/lib/codes'
import { UserRole } from '@/lib/auth'
import { trackServerEvent } from '@/lib/analytics'

export interface RedeemResult {
  ok: boolean
  message: string
  previousRole?: UserRole
  grantedRole?: UserRole
}

export async function redeemAccessCode(formData: FormData): Promise<RedeemResult> {
  const code = (formData.get('code') as string)?.trim()
  if (!code) return { ok: false, message: REDEEM_ERRORS.empty_code }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { ok: false, message: 'Supabase n\'est pas configuré.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: REDEEM_ERRORS.not_authenticated }

  const { data, error } = await supabase.rpc('redeem_access_code', { p_code: code })
  if (error) {
    return { ok: false, message: error.message || REDEEM_ERRORS.unknown }
  }

  const result = data as { ok: boolean; error?: string; previous_role?: UserRole; granted_role?: UserRole }

  if (!result.ok) {
    return { ok: false, message: REDEEM_ERRORS[result.error || 'unknown'] || REDEEM_ERRORS.unknown }
  }

  revalidatePath('/account')
  revalidatePath('/', 'layout')

  const upgraded = result.previous_role !== result.granted_role
  if (upgraded && (result.granted_role === 'pro' || result.granted_role === 'admin')) {
    await trackServerEvent('upgrade_to_pro', null, null, {
      from: result.previous_role,
      to:   result.granted_role,
    })
  }
  return {
    ok: true,
    message: upgraded
      ? `Code accepté — vous passez de « ${result.previous_role} » à « ${result.granted_role} » 🎉`
      : `Code accepté — votre rôle « ${result.granted_role} » est confirmé.`,
    previousRole: result.previous_role,
    grantedRole:  result.granted_role,
  }
}
