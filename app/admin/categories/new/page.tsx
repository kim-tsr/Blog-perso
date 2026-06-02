import Link from 'next/link'
import CategoryForm from '@/components/admin/CategoryForm'
import { createCategory } from '../actions'

export default function NewCategoryPage() {
  return (
    <div style={{ padding:'120px 48px 80px', maxWidth:880, margin:'0 auto' }}>
      <Link href="/admin/categories" style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim)', letterSpacing:'.1em' }}>← Catégories</Link>
      <h1 style={{ fontFamily:'var(--fd)', fontSize:32, fontWeight:700, letterSpacing:'-.02em', color:'var(--text)', margin:'14px 0 36px' }}>Nouvelle catégorie</h1>
      <CategoryForm mode="create" action={createCategory} />
    </div>
  )
}
