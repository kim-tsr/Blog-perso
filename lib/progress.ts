'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markArticleRead(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.rpc('mark_article_read', { p_slug: slug })
    revalidatePath('/account')
  } catch {
    // best-effort
  }
}

export async function toggleLabCompletionForm(formData: FormData) {
  const slug = formData.get('slug') as string
  if (!slug) return
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.rpc('toggle_lab_completion', { p_slug: slug })
    revalidatePath('/account')
    revalidatePath(`/labs/${slug}`)
  } catch {}
}

export interface UserProgress {
  articles: { article_slug: string; read_at: string }[]
  labs:     { lab_slug: string; status: 'started' | 'completed'; started_at: string; completed_at: string | null }[]
  summary:  { articles_read: number; labs_started: number; labs_completed: number }
}

export async function getUserProgress(): Promise<UserProgress | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const [ar, lp, sum] = await Promise.all([
      supabase.from('article_reads').select('article_slug, read_at').order('read_at', { ascending: false }),
      supabase.from('lab_progress').select('lab_slug, status, started_at, completed_at').order('started_at', { ascending: false }),
      supabase.from('user_progress_summary').select('*').eq('user_id', user.id).maybeSingle(),
    ])

    return {
      articles: (ar.data ?? []) as UserProgress['articles'],
      labs:     (lp.data ?? []) as UserProgress['labs'],
      summary:  (sum.data as UserProgress['summary']) ?? { articles_read: 0, labs_started: 0, labs_completed: 0 },
    }
  } catch {
    return null
  }
}
