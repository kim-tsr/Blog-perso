'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/auth'

export interface Comment {
  id: number
  user_id: string
  author_name: string | null
  body: string
  status: 'visible' | 'hidden' | 'flagged'
  created_at: string
  updated_at: string
  is_own: boolean
  is_edited: boolean
}

interface CommentsResult {
  comments: Comment[]
  total: number
}

export async function getCommentsForLab(
  slug: string,
  page = 1,
  pageSize = 20,
): Promise<CommentsResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { comments: [], total: 0 }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if admin to decide which statuses to include
    let isAdmin = false
    if (user) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      isAdmin = prof?.role === 'admin'
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('comments')
      .select('id, user_id, body, status, created_at, updated_at', { count: 'exact' })
      .eq('lab_slug', slug)
      .order('created_at', { ascending: true })
      .range(from, to)

    if (!isAdmin) {
      query = query.eq('status', 'visible')
    }

    const { data, count, error } = await query

    if (error) {
      console.error('[getCommentsForLab]', error)
      return { comments: [], total: 0 }
    }

    const rows = data ?? []
    const userIds = Array.from(new Set(rows.map(r => r.user_id)))
    const profilesById = new Map<string, { name: string | null; email: string | null }>()

    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds)
      for (const p of profs ?? []) {
        profilesById.set(p.id as string, { name: p.name as string | null, email: p.email as string | null })
      }
    }

    const comments: Comment[] = rows.map(row => {
      const prof = profilesById.get(row.user_id)
      const name = prof?.name ?? prof?.email ?? 'Anonyme'
      return {
        id: row.id,
        user_id: row.user_id,
        author_name: name,
        body: row.body,
        status: row.status as 'visible' | 'hidden' | 'flagged',
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_own: user ? row.user_id === user.id : false,
        is_edited: row.updated_at !== row.created_at,
      }
    })

    return { comments, total: count ?? 0 }
  } catch {
    return { comments: [], total: 0 }
  }
}

export async function submitCommentForm(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { ok: false, error: 'no_db' }

  const slug = (formData.get('slug') as string | null)?.trim()
  const body = (formData.get('body') as string | null)?.trim()

  if (!slug || !body) return { ok: false, error: 'missing_fields' }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('submit_comment', {
      p_slug: slug,
      p_body: body,
    })

    if (error) return { ok: false, error: error.message }
    const result = data as { ok: boolean; error?: string }
    if (!result.ok) return { ok: false, error: result.error }

    revalidatePath(`/labs/${slug}`)
    return { ok: true }
  } catch {
    return { ok: false, error: 'unknown' }
  }
}

export async function editCommentForm(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { ok: false, error: 'no_db' }

  const id = Number(formData.get('id'))
  const slug = (formData.get('slug') as string | null)?.trim()
  const body = (formData.get('body') as string | null)?.trim()

  if (!id || !slug || !body) return { ok: false, error: 'missing_fields' }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('edit_comment', {
      p_id: id,
      p_body: body,
    })

    if (error) return { ok: false, error: error.message }
    const result = data as { ok: boolean; error?: string }
    if (!result.ok) return { ok: false, error: result.error }

    revalidatePath(`/labs/${slug}`)
    return { ok: true }
  } catch {
    return { ok: false, error: 'unknown' }
  }
}

export async function deleteCommentForm(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { ok: false, error: 'no_db' }

  const id = Number(formData.get('id'))
  const slug = (formData.get('slug') as string | null)?.trim()

  if (!id || !slug) return { ok: false, error: 'missing_fields' }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('delete_comment', { p_id: id })

    if (error) return { ok: false, error: error.message }
    const result = data as { ok: boolean; error?: string }
    if (!result.ok) return { ok: false, error: result.error }

    revalidatePath(`/labs/${slug}`)
    return { ok: true }
  } catch {
    return { ok: false, error: 'unknown' }
  }
}

// Re-export getCurrentProfile for use by Comments component
export { getCurrentProfile }
