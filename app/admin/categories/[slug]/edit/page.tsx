import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminClient } from '@/lib/admin'
import CategoryForm from '@/components/admin/CategoryForm'
import { updateCategory, deleteCategory } from '../../actions'

interface Row {
  slug: string
  label: string
  description: string | null
  theme: 'violet' | 'cyan' | 'amber'
  display_order: number
}

export default async function EditCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { supabase } = await requireAdminClient()
  const { data } = await supabase.from('categories').select('*').eq('slug', slug).maybeSingle()
  if (!data) notFound()
  const c = data as Row

  const boundUpdate = async (fd: FormData) => { 'use server'; await updateCategory(slug, fd) }
  const boundDelete = async () => { 'use server'; await deleteCategory(slug) }

  return (
    <div style={{ padding:'120px 48px 80px', maxWidth:880, margin:'0 auto' }}>
      <Link href="/admin/categories" style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', letterSpacing:'.1em' }}>← Catégories</Link>
      <h1 style={{ fontFamily:'var(--fd)', fontSize:28, fontWeight:700, letterSpacing:'-.02em', color:'var(--text)', margin:'14px 0 36px' }}>{c.label}</h1>
      <CategoryForm
        mode="edit"
        action={boundUpdate}
        onDelete={boundDelete}
        initial={{
          slug:          c.slug,
          label:         c.label,
          description:   c.description ?? '',
          theme:         c.theme,
          display_order: c.display_order,
        }}
      />
    </div>
  )
}
