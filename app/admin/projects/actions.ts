'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminClient } from '@/lib/admin'

function parseTags(raw: string | null): string[] {
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

function parse(formData: FormData) {
  return {
    title:         (formData.get('title') as string)?.trim() ?? '',
    description:   (formData.get('description') as string)?.trim() ?? '',
    tags:          parseTags(formData.get('tags') as string),
    category_slug: (formData.get('category_slug') as string)?.trim() || null,
    status:        ((formData.get('status') as string) ?? 'wip') as 'live' | 'beta' | 'wip' | 'archive',
    year:          (formData.get('year') as string)?.trim() || null,
    github_url:    (formData.get('github_url') as string)?.trim() || null,
    live_url:      (formData.get('live_url') as string)?.trim() || null,
    display_order: parseInt((formData.get('display_order') as string) || '0', 10),
    published:     formData.get('published') === 'on',
  }
}

export async function createProject(formData: FormData) {
  const { supabase } = await requireAdminClient()
  const data = parse(formData)
  if (!data.title || !data.description) return { ok: false, error: 'Titre et description requis' }
  const { error } = await supabase.from('projects').insert(data)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/projects')
  revalidatePath('/projets')
  redirect('/admin/projects')
}

export async function updateProject(id: string, formData: FormData) {
  const { supabase } = await requireAdminClient()
  const data = parse(formData)
  const { error } = await supabase.from('projects').update(data).eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/projects')
  revalidatePath('/projets')
  redirect('/admin/projects')
}

export async function deleteProject(id: string) {
  const { supabase } = await requireAdminClient()
  await supabase.from('projects').delete().eq('id', id)
  revalidatePath('/admin/projects')
  revalidatePath('/projets')
}
