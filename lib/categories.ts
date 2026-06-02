import { createPublicClient } from './supabase/service'
import { ArticleTheme, CATEGORIES as FALLBACK } from './theme'

export interface Category {
  slug: string
  label: string
  description: string | null
  theme: ArticleTheme
  display_order: number
}

const STATIC_FALLBACK: Category[] = Object.entries(FALLBACK).map(([slug, c], i) => ({
  slug,
  label: c.label,
  description: c.desc,
  theme: c.theme,
  display_order: i,
}))

export async function getAllCategories(): Promise<Category[]> {
  const supabase = createPublicClient()
  if (!supabase) return STATIC_FALLBACK
  const { data, error } = await supabase
    .from('categories')
    .select('slug,label,description,theme,display_order')
    .order('display_order', { ascending: true })
  if (error || !data || data.length === 0) return STATIC_FALLBACK
  return data as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const all = await getAllCategories()
  return all.find(c => c.slug === slug)
}
