'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminClient, slugify } from '@/lib/admin'
import { logAdminAction } from '@/lib/audit'

function parse(formData: FormData) {
  const label = (formData.get('label') as string)?.trim() ?? ''
  return {
    slug:          ((formData.get('slug') as string)?.trim() || slugify(label)),
    label,
    description:   (formData.get('description') as string)?.trim() || null,
    theme:         ((formData.get('theme') as string) ?? 'violet') as 'violet' | 'cyan' | 'amber',
    display_order: parseInt((formData.get('display_order') as string) || '0', 10),
  }
}

export async function createCategory(formData: FormData) {
  const { supabase } = await requireAdminClient()
  const data = parse(formData)
  if (!data.label || !data.slug) return { ok: false, error: 'Label et slug requis' }
  const { error } = await supabase.from('categories').insert(data)
  if (error) return { ok: false, error: error.message }
  await logAdminAction('category.created', 'category', data.slug, { label: data.label })
  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function updateCategory(slug: string, formData: FormData) {
  const { supabase } = await requireAdminClient()
  const data = parse(formData)
  // Le slug est la PK — on ne le change pas en édition pour ne pas casser les URLs.
  const { error } = await supabase
    .from('categories')
    .update({ label: data.label, description: data.description, theme: data.theme, display_order: data.display_order })
    .eq('slug', slug)
  if (error) return { ok: false, error: error.message }
  await logAdminAction('category.updated', 'category', slug, { label: data.label })
  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function deleteCategory(slug: string) {
  const { supabase } = await requireAdminClient()
  await supabase.from('categories').delete().eq('slug', slug)
  await logAdminAction('category.deleted', 'category', slug)
  revalidatePath('/admin/categories')
}
