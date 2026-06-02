import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminClient } from '@/lib/admin'
import { getAllCategories } from '@/lib/categories'
import ArticleForm from '@/components/admin/ArticleForm'
import { updateArticle, deleteArticle } from '../../actions'

export const metadata: Metadata = { title: 'Éditer un article — admin' }

interface ArticleRow {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  category_slug: string | null
  date_label: string
  read_time: string
  min_role: 'free' | 'pro' | 'admin'
  published: boolean
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await requireAdminClient()

  const { data } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, content, category_slug, date_label, read_time, min_role, published')
    .eq('id', id)
    .maybeSingle()

  if (!data) notFound()
  const article = data as ArticleRow

  const categories = await getAllCategories()

  const boundUpdate = async (fd: FormData) => { 'use server'; await updateArticle(id, fd) }
  const boundDelete = async () => { 'use server'; await deleteArticle(id); }

  return (
    <div style={{ padding:'120px 48px 80px', maxWidth:960, margin:'0 auto' }}>
      <Link href="/admin/articles" style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', letterSpacing:'.1em' }}>← Articles</Link>
      <h1 style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:700, letterSpacing:'-.02em', color:'var(--text)', margin:'14px 0 6px' }}>
        {article.title}
      </h1>
      <div style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', marginBottom:36 }}>/{article.slug}</div>
      <ArticleForm
        mode="edit"
        action={boundUpdate}
        onDelete={boundDelete}
        categories={categories.map(c => ({ slug: c.slug, label: c.label }))}
        initial={{
          id:            article.id,
          slug:          article.slug,
          title:         article.title,
          excerpt:       article.excerpt ?? '',
          content:       article.content,
          category_slug: article.category_slug ?? 'infra',
          date_label:    article.date_label,
          read_time:     article.read_time,
          min_role:      article.min_role,
          published:     article.published,
        }}
      />
    </div>
  )
}
