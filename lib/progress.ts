'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics'

export async function toggleLabCompletionForm(formData: FormData) {
  const slug = formData.get('slug') as string
  if (!slug) return
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.rpc('toggle_lab_completion', { p_slug: slug })
    const status = (data as { new_status?: string } | null)?.new_status
    if (status === 'completed') {
      await trackServerEvent('lab_completed', 'lab', slug)
    } else if (status === 'started') {
      await trackServerEvent('lab_started', 'lab', slug)
    }
    revalidatePath('/account')
    revalidatePath(`/labs/${slug}`)
  } catch {}
}

export interface UserProgress {
  labs:    { lab_slug: string; status: 'started' | 'completed'; started_at: string; completed_at: string | null }[]
  summary: { labs_started: number; labs_completed: number }
  quizzes: { lab_slug: string; best_score: number; max_score: number; ever_passed: boolean; attempts: number; first_try_perfect: boolean }[]
}

export interface QuizAttemptResult {
  ok:         boolean
  passed?:    boolean
  best_score?: number
  first_try?: boolean
  error?:     string
}

export async function submitQuizAttempt(slug: string, score: number, max: number): Promise<QuizAttemptResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { ok: false, error: 'no_db' }
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'not_authenticated' }
    const { data, error } = await supabase.rpc('submit_quiz_attempt', { p_slug: slug, p_score: score, p_max_score: max })
    if (error) return { ok: false, error: error.message }
    await trackServerEvent('quiz_attempted', 'lab', slug, { score, max })
    return (data ?? { ok: false }) as QuizAttemptResult
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getUserProgress(): Promise<UserProgress | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const [lp, sum, qz] = await Promise.all([
      supabase.from('lab_progress').select('lab_slug, status, started_at, completed_at').order('started_at', { ascending: false }),
      supabase.from('user_progress_summary').select('labs_started, labs_completed').eq('user_id', user.id).maybeSingle(),
      supabase.from('quiz_best_scores').select('lab_slug, best_score, max_score, ever_passed, attempts, first_try_perfect').eq('user_id', user.id),
    ])

    return {
      labs:    (lp.data ?? []) as UserProgress['labs'],
      summary: (sum.data as UserProgress['summary']) ?? { labs_started: 0, labs_completed: 0 },
      quizzes: (qz.data ?? []) as UserProgress['quizzes'],
    }
  } catch {
    return null
  }
}

export async function getUserBestQuizScore(slug: string): Promise<{ best: number; max: number; passed: boolean; attempts: number } | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('quiz_best_scores')
      .select('best_score, max_score, ever_passed, attempts')
      .eq('user_id', user.id)
      .eq('lab_slug', slug)
      .maybeSingle()
    if (!data) return null
    return { best: data.best_score, max: data.max_score, passed: data.ever_passed, attempts: data.attempts }
  } catch {
    return null
  }
}
