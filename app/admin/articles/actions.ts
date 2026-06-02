'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminClient, slugify } from '@/lib/admin'

export interface ArticleFormData {
  slug: string
  title: string
  excerpt: string
  content: string
  category_slug: string
  date_label: string
  read_time: string
  min_role: 'free' | 'pro' | 'admin'
  published: boolean
}

function parse(formData: FormData): ArticleFormData {
  const title = (formData.get('title') as string)?.trim() ?? ''
  return {
    slug:          ((formData.get('slug') as string)?.trim() || slugify(title)),
    title,
    excerpt:       (formData.get('excerpt') as string)?.trim() ?? '',
    content:       (formData.get('content') as string) ?? '',
    category_slug: (formData.get('category_slug') as string)?.trim() || 'infra',
    date_label:    (formData.get('date_label') as string)?.trim() ?? '',
    read_time:     (formData.get('read_time') as string)?.trim() ?? '5 min',
    min_role:      ((formData.get('min_role') as ArticleFormData['min_role']) ?? 'free'),
    published:     formData.get('published') === 'on',
  }
}

export async function createArticle(formData: FormData) {
  const { supabase, user } = await requireAdminClient()
  const data = parse(formData)
  if (!data.title || !data.slug) return { ok: false, error: 'Titre et slug requis' }

  const { error } = await supabase
    .from('articles')
    .insert({ ...data, created_by: user.id })

  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/articles')
  revalidatePath('/blog')
  revalidatePath(`/articles/${data.slug}`)
  redirect('/admin/articles')
}

export async function updateArticle(id: string, formData: FormData) {
  const { supabase } = await requireAdminClient()
  const data = parse(formData)

  const { error } = await supabase.from('articles').update(data).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/articles')
  revalidatePath('/blog')
  revalidatePath(`/articles/${data.slug}`)
  redirect('/admin/articles')
}

export async function deleteArticle(id: string) {
  const { supabase } = await requireAdminClient()
  await supabase.from('articles').delete().eq('id', id)
  revalidatePath('/admin/articles')
  revalidatePath('/blog')
}

export async function togglePublished(id: string, published: boolean) {
  const { supabase } = await requireAdminClient()
  await supabase.from('articles').update({ published }).eq('id', id)
  revalidatePath('/admin/articles')
  revalidatePath('/blog')
}

export async function togglePublishedForm(formData: FormData) {
  const id = formData.get('id') as string
  const published = formData.get('published') === '1'
  await togglePublished(id, published)
}
