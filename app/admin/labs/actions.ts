'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminClient, slugify } from '@/lib/admin'
import { logAdminAction } from '@/lib/audit'

function parseList(raw: string | null): string[] {
  if (!raw) return []
  return raw.split('\n').map(s => s.trim()).filter(Boolean)
}

function parse(formData: FormData) {
  const title = (formData.get('title') as string)?.trim() ?? ''
  const scheduledRaw = (formData.get('scheduled_for') as string | null)?.trim() || ''
  return {
    slug:          ((formData.get('slug') as string)?.trim() || slugify(title)),
    title,
    objective:     (formData.get('objective') as string)?.trim() ?? '',
    content:       (formData.get('content') as string) ?? '',
    category_slug: (formData.get('category_slug') as string)?.trim() || 'infra',
    difficulty:    ((formData.get('difficulty') as string) ?? 'débutant') as 'débutant' | 'intermédiaire' | 'avancé',
    duration:      (formData.get('duration') as string)?.trim() ?? '20 min',
    prerequisites: parseList(formData.get('prerequisites') as string),
    tools:         parseList(formData.get('tools') as string),
    min_role:      ((formData.get('min_role') as string) ?? 'free') as 'free' | 'pro' | 'admin',
    published:     formData.get('published') === 'on',
    scheduled_for: scheduledRaw ? new Date(scheduledRaw).toISOString() : null,
  }
}

export async function createLab(formData: FormData) {
  const { supabase, user } = await requireAdminClient()
  const data = parse(formData)
  if (!data.title || !data.slug || !data.objective) return { ok: false, error: 'Titre, slug et objectif requis' }

  const { error } = await supabase.from('labs').insert({ ...data, created_by: user.id })
  if (error) return { ok: false, error: error.message }

  await logAdminAction('lab.created', 'lab', data.slug, { title: data.title, published: data.published })

  revalidatePath('/admin/labs')
  revalidatePath('/labs')
  revalidatePath(`/labs/${data.slug}`)
  redirect('/admin/labs')
}

export async function updateLab(id: string, formData: FormData) {
  const { supabase } = await requireAdminClient()
  const data = parse(formData)

  const { error } = await supabase.from('labs').update(data).eq('id', id)
  if (error) return { ok: false, error: error.message }

  await logAdminAction('lab.updated', 'lab', id, { slug: data.slug, title: data.title, published: data.published })

  revalidatePath('/admin/labs')
  revalidatePath('/labs')
  revalidatePath(`/labs/${data.slug}`)
  redirect('/admin/labs')
}

export async function deleteLab(id: string) {
  const { supabase } = await requireAdminClient()
  await supabase.from('labs').delete().eq('id', id)
  await logAdminAction('lab.deleted', 'lab', id)
  revalidatePath('/admin/labs')
  revalidatePath('/labs')
}

export async function togglePublishedForm(formData: FormData) {
  const { supabase } = await requireAdminClient()
  const id = formData.get('id') as string
  const published = formData.get('published') === '1'
  await supabase.from('labs').update({ published }).eq('id', id)
  await logAdminAction(published ? 'lab.published' : 'lab.unpublished', 'lab', id)
  revalidatePath('/admin/labs')
  revalidatePath('/labs')
}
