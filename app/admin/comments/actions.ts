'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/audit'

async function requireAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/auth/signin')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/admin/comments')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/account')
  return supabase
}

export async function moderateCommentAction(formData: FormData): Promise<void> {
  const supabase = await requireAdmin()

  const id = Number(formData.get('id'))
  const status = formData.get('status') as string
  const labSlug = (formData.get('labSlug') as string | null) ?? ''

  if (!id || !['visible', 'hidden', 'flagged'].includes(status)) return

  const { data } = await supabase.rpc('moderate_comment', {
    p_id: id,
    p_status: status,
  })

  const result = data as { ok: boolean; error?: string } | null
  if (!result?.ok) return

  await logAdminAction('comment.moderated', 'comment', String(id), { status })

  revalidatePath('/admin/comments')
  if (labSlug) revalidatePath(`/labs/${labSlug}`)
}
