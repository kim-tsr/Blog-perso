'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type BookmarkType = 'article' | 'lab'

export interface BookmarkRow {
  content_type: BookmarkType
  content_slug: string
  created_at: string
}

export async function toggleBookmarkForm(formData: FormData) {
  const type = formData.get('type') as BookmarkType
  const slug = formData.get('slug') as string
  if (!type || !slug) return
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.rpc('toggle_bookmark', { p_type: type, p_slug: slug })
    revalidatePath('/account')
    revalidatePath(type === 'article' ? `/articles/${slug}` : `/labs/${slug}`)
  } catch {}
}

export async function getUserBookmarks(): Promise<BookmarkRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data } = await supabase
      .from('bookmarks')
      .select('content_type, content_slug, created_at')
      .order('created_at', { ascending: false })
    return (data ?? []) as BookmarkRow[]
  } catch {
    return []
  }
}

export async function isBookmarked(type: BookmarkType, slug: string): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase
      .from('bookmarks')
      .select('content_slug')
      .eq('content_type', type)
      .eq('content_slug', slug)
      .maybeSingle()
    return !!data
  } catch {
    return false
  }
}
