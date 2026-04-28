import { CATEGORIES, getArticlesByCategory, CategorySlug } from '@/lib/articles'
import { notFound } from 'next/navigation'
import CategoryClient from './CategoryClient'

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = CATEGORIES[slug as CategorySlug]
  if (!cat) return {}
  return { title: `${cat.label} — dev.sec.ops` }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = CATEGORIES[slug as CategorySlug]
  if (!cat) notFound()
  const articles = getArticlesByCategory(slug as CategorySlug)
  return <CategoryClient slug={slug} cat={cat} articles={articles} />
}
