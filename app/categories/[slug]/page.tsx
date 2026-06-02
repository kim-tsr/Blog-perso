import { CATEGORIES, getArticlesByCategory, CategorySlug } from '@/lib/articles'
import { getAllCategories } from '@/lib/categories'
import { notFound } from 'next/navigation'
import CategoryClient from './CategoryClient'

export async function generateStaticParams() {
  const cats = await getAllCategories()
  return cats.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cats = await getAllCategories()
  const cat = cats.find(c => c.slug === slug)
  if (!cat) return {}
  return { title: `${cat.label} — dev.sec.ops` }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cats = await getAllCategories()
  const cat = cats.find(c => c.slug === slug)
  if (!cat) notFound()
  const tag = CATEGORIES[slug as keyof typeof CATEGORIES]?.tag ?? cat.label
  const theme = CATEGORIES[slug as keyof typeof CATEGORIES]?.theme ?? cat.theme
  const articles = await getArticlesByCategory(slug as CategorySlug)
  return <CategoryClient slug={slug} cat={{ label: cat.label, tag, theme, desc: cat.description ?? '' }} articles={articles} />
}
