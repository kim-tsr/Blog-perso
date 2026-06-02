import { Metadata } from 'next'
import { getAllCategories } from '@/lib/categories'
import ArticleForm from '@/components/admin/ArticleForm'
import { createArticle } from '../actions'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Nouvel article — admin' }

export default async function NewArticlePage() {
  const categories = await getAllCategories()

  return (
    <div style={{ padding:'120px 48px 80px', maxWidth:960, margin:'0 auto' }}>
      <Link href="/admin/articles" style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', letterSpacing:'.1em' }}>← Articles</Link>
      <h1 style={{ fontFamily:'var(--fd)', fontSize:32, fontWeight:700, letterSpacing:'-.02em', color:'var(--text)', margin:'14px 0 36px' }}>
        Nouvel article
      </h1>
      <ArticleForm
        mode="create"
        action={createArticle}
        categories={categories.map(c => ({ slug: c.slug, label: c.label }))}
      />
    </div>
  )
}
